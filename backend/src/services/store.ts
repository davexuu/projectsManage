import { AccessRole, PrismaClient, SysStatus } from "@prisma/client";
import {
  ChangeRequest,
  Milestone,
  ProgressRecord,
  Project,
  RiskItem,
  StatusAssessment,
  TaskStatus,
  WbsTask
} from "../domain/types.js";
import { BusinessError } from "./errors.js";
import { RULE_CONFIG } from "./rules/config.js";

export const prisma = new PrismaClient();

const toDate = (value: string) => new Date(value);

function normalizeProject(project: any): Project {
  return {
    id: project.id,
    projectName: project.projectName,
    projectType: project.projectType,
    year: project.year,
    leadDepartment: project.leadDepartment,
    projectOwner: project.projectOwner,
    participants: project.participants,
    background: project.background ?? undefined,
    goal: project.goal ?? undefined,
    scope: project.scope ?? undefined,
    expectedOutcome: project.expectedOutcome ?? undefined,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString()
  };
}

function whereProjectFilter(projectId: string | undefined, allowedProjectIds: string[] | undefined) {
  if (projectId) {
    return { projectId };
  }
  if (allowedProjectIds) {
    return { projectId: { in: allowedProjectIds } };
  }
  return undefined;
}

function todayStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function dayRange(value: string) {
  const date = toDate(value);
  const start = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const end = new Date(start);
  end.setDate(start.getDate() + 1);
  return { start, end };
}

const allowedChangeTypes: Set<string> = new Set(RULE_CONFIG.allowedChangeTypes as readonly string[]);
const vagueTexts = new Set(RULE_CONFIG.vaguePhrases);
const trafficRank = RULE_CONFIG.trafficRank;
const changeStatusFlow = RULE_CONFIG.changeStatusFlow;

export class PrismaStore {
  private async assertNoPendingStructuralChange(projectId: string) {
    const pending = await prisma.changeRequest.findFirst({
      where: {
        projectId,
        impactsMilestoneOrWbs: "是",
        approvalDate: null
      },
      select: { id: true, changeCode: true }
    });
    if (pending) {
      throw new BusinessError(
        `存在未审批且影响里程碑/WBS的变更（${pending.changeCode}），禁止修改WBS/里程碑基线`,
        409
      );
    }
  }

  private assertAssessmentOverallWorstRule(input: Omit<StatusAssessment, "id" | "createdAt" | "updatedAt">) {
    const worst = [input.scheduleStatus, input.qualityStatus, input.riskStatus].sort(
      (a, b) => trafficRank[b] - trafficRank[a]
    )[0];
    if (input.overallStatus !== worst) {
      throw new BusinessError("整体状态必须等于进度/质量/风险状态中的最差值", 400);
    }
  }

  private assertMilestoneCodeFormat(milestoneCode: string) {
    if (!RULE_CONFIG.codePatterns.milestone.test((milestoneCode || "").trim())) {
      throw new BusinessError("里程碑编号格式不正确，应为 M1、M2 ...", 400);
    }
  }

  private assertRiskCodeFormat(riskCode: string) {
    if (!RULE_CONFIG.codePatterns.risk.test((riskCode || "").trim())) {
      throw new BusinessError("风险编号格式不正确，应为 P-01 或 R-01", 400);
    }
  }

  private assertChangeCodeFormat(changeCode: string) {
    if (!RULE_CONFIG.codePatterns.change.test((changeCode || "").trim())) {
      throw new BusinessError("变更编号格式不正确，应为 C-01、C-02 ...", 400);
    }
  }

  private async assertEscalatedRiskStatusLink(projectId: string, riskStatus: StatusAssessment["riskStatus"]) {
    const escalatedOpenCount = await prisma.riskItem.count({
      where: {
        projectId,
        escalateToManagement: "是",
        currentStatus: { not: "已完成" }
      }
    });
    if (escalatedOpenCount > 0 && riskStatus === "绿") {
      throw new BusinessError("存在升级管理关注且未关闭的风险时，风险状态不能为绿", 400);
    }
  }

  private assertNotVague(text: string, fieldLabel: string) {
    const content = (text || "").trim();
    if (!content) return;
    if ([...vagueTexts].some((v) => content.includes(v))) {
      throw new BusinessError(`${fieldLabel}过于空泛，请填写可核验事实`, 400);
    }
  }

  private assertChangeType(changeType: string) {
    if (!allowedChangeTypes.has((changeType || "").trim())) {
      throw new BusinessError("变更类型不合法，仅允许：目标/范围/进度/成果/资源变更", 400);
    }
  }

  private async assertProgressStageMatchesMilestone(projectId: string, milestoneCode: string, currentStage: string) {
    const milestone = await prisma.milestone.findFirst({
      where: { projectId, milestoneCode },
      select: { level1Stage: true }
    });
    if (!milestone) {
      throw new BusinessError("推进记录关联的里程碑不存在", 400);
    }
    if (milestone.level1Stage !== currentStage) {
      throw new BusinessError("推进记录当前阶段需与关联里程碑阶段一致", 400);
    }
  }

  private async assertStatusAssessmentStageConsistency(projectId: string, currentStage: string) {
    const [wbsCount, milestoneCount, progressCount] = await Promise.all([
      prisma.wbsTask.count({ where: { projectId, level1Stage: currentStage as any } }),
      prisma.milestone.count({ where: { projectId, level1Stage: currentStage as any } }),
      prisma.progressRecord.count({ where: { projectId, currentStage: currentStage as any } })
    ]);
    if (wbsCount + milestoneCount + progressCount === 0) {
      throw new BusinessError("状态评估当前阶段与项目执行数据不一致", 400);
    }
  }

  private async assertRiskLinkExists(projectId: string, linkedMilestoneOrTask?: string) {
    const text = (linkedMilestoneOrTask || "").trim();
    if (!text || text === "无") return;
    const [milestoneHit, wbsHit] = await Promise.all([
      prisma.milestone.count({ where: { projectId, milestoneCode: text } }),
      prisma.wbsTask.count({ where: { projectId, taskName: text } })
    ]);
    if (milestoneHit + wbsHit === 0) {
      throw new BusinessError("风险关联里程碑/WBS不存在", 400);
    }
  }

  private assertChangeCreateRule(input: Omit<ChangeRequest, "id" | "createdAt" | "updatedAt">) {
    this.assertChangeType(input.changeType);
    this.assertNotVague(input.reason, "变更原因");
    this.assertNotVague(input.afterContent, "变更后内容");
    if (input.currentStatus !== "未开始") {
      throw new BusinessError("变更初始状态必须为未开始", 400);
    }
  }

  private async assertChangeUpdateFlow(id: string, nextStatus: TaskStatus) {
    const old = await prisma.changeRequest.findUnique({
      where: { id },
      select: { currentStatus: true }
    });
    if (!old) {
      throw new BusinessError("变更记录不存在", 404);
    }
    const allow = changeStatusFlow[old.currentStatus];
    if (!allow.includes(nextStatus)) {
      throw new BusinessError(`变更状态流转不合法：${old.currentStatus} -> ${nextStatus}`, 400);
    }
  }

  private assertChangeApprovalFields(input: Omit<ChangeRequest, "id" | "createdAt" | "updatedAt">) {
    if (input.currentStatus === "已完成" && (!input.approver || !input.approvalDate)) {
      throw new BusinessError("变更状态为已完成时，必须填写批准人和批准日期", 400);
    }
  }

  private async assertMilestoneCodeUnique(projectId: string, milestoneCode: string, excludeId?: string) {
    const exists = await prisma.milestone.findFirst({
      where: {
        projectId,
        milestoneCode,
        ...(excludeId ? { NOT: { id: excludeId } } : {})
      },
      select: { id: true }
    });
    if (exists) {
      throw new BusinessError("同一项目下里程碑编号不能重复", 409);
    }
  }

  private async assertRiskCodeUnique(projectId: string, riskCode: string, excludeId?: string) {
    const exists = await prisma.riskItem.findFirst({
      where: {
        projectId,
        riskCode,
        ...(excludeId ? { NOT: { id: excludeId } } : {})
      },
      select: { id: true }
    });
    if (exists) {
      throw new BusinessError("同一项目下风险编号不能重复", 409);
    }
  }

  private async assertChangeCodeUnique(projectId: string, changeCode: string, excludeId?: string) {
    const exists = await prisma.changeRequest.findFirst({
      where: {
        projectId,
        changeCode,
        ...(excludeId ? { NOT: { id: excludeId } } : {})
      },
      select: { id: true }
    });
    if (exists) {
      throw new BusinessError("同一项目下变更编号不能重复", 409);
    }
  }

  private async assertMilestoneLinkedWorkPackage(projectId: string, relatedWorkPackage: string) {
    const linked = await prisma.wbsTask.findFirst({
      where: { projectId, level2WorkPackage: relatedWorkPackage },
      select: { id: true }
    });
    if (!linked) {
      throw new BusinessError("里程碑对应工作包不存在，请先维护 WBS 二级工作包", 400);
    }
  }

  private async assertProgressMilestoneExists(projectId: string, milestoneCode: string) {
    const linked = await prisma.milestone.findFirst({
      where: { projectId, milestoneCode },
      select: { id: true }
    });
    if (!linked) {
      throw new BusinessError("推进记录关联的里程碑不存在", 400);
    }
  }

  private async assertAssessmentPeriodUnique(projectId: string, evalPeriod: string, excludeId?: string) {
    const { start, end } = dayRange(evalPeriod);
    const exists = await prisma.statusAssessment.findFirst({
      where: {
        projectId,
        evalPeriod: { gte: start, lt: end },
        ...(excludeId ? { NOT: { id: excludeId } } : {})
      },
      select: { id: true }
    });
    if (exists) {
      throw new BusinessError("同一项目同一评估周期仅允许一条状态评估", 409);
    }
  }

  private assertMilestoneCompletionRule(input: Omit<Milestone, "id" | "createdAt" | "updatedAt">) {
    if (input.currentStatus === "已完成" && !input.actualFinishDate) {
      throw new BusinessError("里程碑状态为已完成时，必须填写实际完成时间", 400);
    }
  }

  private assertRiskCompletionRule(input: Omit<RiskItem, "id" | "createdAt" | "updatedAt">) {
    if (input.currentStatus === "已完成" && !input.actualResolveDate) {
      throw new BusinessError("风险状态为已完成时，必须填写实际解决时间", 400);
    }
  }

  async hasEnabledSysUser(userId: string): Promise<boolean> {
    const user = await prisma.sysUser.findFirst({
      where: { id: userId, status: SysStatus.ENABLED },
      select: { id: true }
    });
    return !!user;
  }

  async getAllowedProjectIds(userId: string): Promise<string[]> {
    const rows = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true }
    });
    return rows.map((r) => r.projectId);
  }

  async hasProjectAccess(userId: string, projectId: string, roles?: AccessRole[]): Promise<boolean> {
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } }
    });
    if (!member) return false;
    if (!roles || roles.length === 0) return true;
    return roles.includes(member.accessRole);
  }

  async listProjectMembers(projectId: string) {
    return prisma.projectMember.findMany({
      where: { projectId },
      orderBy: [{ accessRole: "asc" }, { createdAt: "asc" }]
    });
  }

  async upsertProjectMember(projectId: string, userId: string, accessRole: AccessRole) {
    return prisma.projectMember.upsert({
      where: { projectId_userId: { projectId, userId } },
      update: { accessRole },
      create: { projectId, userId, accessRole }
    });
  }

  async removeProjectMember(projectId: string, userId: string) {
    return prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } }
    });
  }

  async listOrganizationTree() {
    type OrgNode = { id: string; name: string; children: OrgNode[] };
    const offices = await prisma.sysOffice.findMany({
      where: { status: SysStatus.ENABLED },
      select: { id: true, officeName: true, parentId: true },
      orderBy: [{ sort: "asc" }, { createdAt: "asc" }]
    });

    const nodeMap = new Map(
      offices.map((office) => [
        office.id,
        {
          id: office.id,
          name: office.officeName,
          children: [] as OrgNode[]
        }
      ])
    );

    const roots: OrgNode[] = [];
    offices.forEach((office) => {
      const node = nodeMap.get(office.id)!;
      if (office.parentId && nodeMap.has(office.parentId)) {
        nodeMap.get(office.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    const flattenVirtualRoots = (nodes: OrgNode[]): OrgNode[] =>
      nodes.flatMap((node) => {
        const children = flattenVirtualRoots(node.children);
        if (node.name.endsWith("根节点") && children.length > 0) return children;
        return [{ ...node, children }];
      });

    return flattenVirtualRoots(roots);
  }

  async createOrganizationNode(name: string, parentId?: string) {
    const codeSuffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
    const row = await prisma.sysOffice.create({
      data: {
        officeCode: `OFF-${codeSuffix}`,
        officeName: name,
        parentId: parentId || null,
        status: SysStatus.ENABLED
      },
      select: { id: true, officeName: true, parentId: true }
    });
    return {
      id: row.id,
      name: row.officeName,
      parentId: row.parentId
    };
  }

  async renameOrganizationNode(id: string, name: string) {
    const row = await prisma.sysOffice.update({
      where: { id },
      data: { officeName: name },
      select: { id: true, officeName: true }
    });
    return { id: row.id, name: row.officeName };
  }

  async deleteOrganizationNode(id: string) {
    const offices = await prisma.sysOffice.findMany({
      select: { id: true, parentId: true }
    });
    const childrenMap = new Map<string, string[]>();
    offices.forEach((office) => {
      if (!office.parentId) return;
      const children = childrenMap.get(office.parentId) || [];
      children.push(office.id);
      childrenMap.set(office.parentId, children);
    });

    const targetIds: string[] = [];
    const stack = [id];
    while (stack.length > 0) {
      const current = stack.pop()!;
      targetIds.push(current);
      const children = childrenMap.get(current) || [];
      children.forEach((childId) => stack.push(childId));
    }

    await prisma.sysOffice.deleteMany({
      where: { id: { in: targetIds } }
    });
    return targetIds.length;
  }

  async listDictionaryItems(dictCodes?: string[]) {
    const types = await prisma.sysDictType.findMany({
      where: {
        status: SysStatus.ENABLED,
        ...(dictCodes && dictCodes.length > 0 ? { dictCode: { in: dictCodes } } : {})
      },
      include: {
        dictValues: {
          where: { status: SysStatus.ENABLED },
          orderBy: [{ sort: "asc" }, { createdAt: "asc" }]
        }
      },
      orderBy: { createdAt: "asc" }
    });

    return types.map((type) => ({
      key: type.dictCode,
      label: type.dictName,
      options: type.dictValues.map((value) => value.dictValue)
    }));
  }

  async addDictionaryOption(dictCode: string, option: string) {
    const type = await prisma.sysDictType.findFirst({
      where: { dictCode, status: SysStatus.ENABLED },
      select: { id: true }
    });
    if (!type) {
      throw new Error(`字典类型不存在: ${dictCode}`);
    }

    const currentCount = await prisma.sysDictValue.count({
      where: { dictTypeId: type.id }
    });

    return prisma.sysDictValue.upsert({
      where: { dictTypeId_dictValue: { dictTypeId: type.id, dictValue: option } },
      update: { status: SysStatus.ENABLED },
      create: {
        dictTypeId: type.id,
        dictLabel: option,
        dictValue: option,
        sort: currentCount + 1,
        status: SysStatus.ENABLED
      }
    });
  }

  async removeDictionaryOption(dictCode: string, option: string) {
    const type = await prisma.sysDictType.findFirst({
      where: { dictCode, status: SysStatus.ENABLED },
      select: { id: true }
    });
    if (!type) {
      throw new Error(`字典类型不存在: ${dictCode}`);
    }

    await prisma.sysDictValue.deleteMany({
      where: { dictTypeId: type.id, dictValue: option }
    });
  }

  async listProjects(allowedProjectIds?: string[]): Promise<Project[]> {
    const rows = await prisma.project.findMany({
      where: allowedProjectIds ? { id: { in: allowedProjectIds } } : undefined,
      orderBy: { createdAt: "desc" }
    });
    return rows.map(normalizeProject);
  }

  async hasProjectName(projectName: string, excludeId?: string): Promise<boolean> {
    const row = await prisma.project.findFirst({
      where: {
        projectName,
        ...(excludeId ? { NOT: { id: excludeId } } : {})
      },
      select: { id: true }
    });
    return !!row;
  }

  async createProject(
    input: Omit<Project, "id" | "createdAt" | "updatedAt">,
    ownerUserId?: string
  ): Promise<Project> {
    const row = await prisma.project.create({ data: input });
    if (ownerUserId) {
      await prisma.projectMember.upsert({
        where: { projectId_userId: { projectId: row.id, userId: ownerUserId } },
        update: { accessRole: AccessRole.OWNER },
        create: { projectId: row.id, userId: ownerUserId, accessRole: AccessRole.OWNER }
      });
    }
    return normalizeProject(row);
  }

  async updateProject(id: string, input: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project> {
    const row = await prisma.project.update({
      where: { id },
      data: input
    });
    return normalizeProject(row);
  }

  async listWbs(projectId?: string, allowedProjectIds?: string[]): Promise<WbsTask[]> {
    return prisma.wbsTask.findMany({
      where: whereProjectFilter(projectId, allowedProjectIds),
      orderBy: { createdAt: "desc" }
    }) as unknown as Promise<WbsTask[]>;
  }

  async createWbs(input: Omit<WbsTask, "id" | "createdAt" | "updatedAt">): Promise<WbsTask> {
    await this.assertNoPendingStructuralChange(input.projectId);
    return prisma.wbsTask.create({
      data: {
        ...input,
        plannedStartDate: toDate(input.plannedStartDate),
        plannedEndDate: toDate(input.plannedEndDate)
      }
    }) as unknown as Promise<WbsTask>;
  }

  async updateWbs(id: string, input: Omit<WbsTask, "id" | "createdAt" | "updatedAt">): Promise<WbsTask> {
    await this.assertNoPendingStructuralChange(input.projectId);
    return prisma.wbsTask.update({
      where: { id },
      data: {
        ...input,
        plannedStartDate: toDate(input.plannedStartDate),
        plannedEndDate: toDate(input.plannedEndDate)
      }
    }) as unknown as Promise<WbsTask>;
  }

  async listMilestones(projectId?: string, allowedProjectIds?: string[]): Promise<Milestone[]> {
    return prisma.milestone.findMany({
      where: whereProjectFilter(projectId, allowedProjectIds),
      orderBy: { createdAt: "desc" }
    }) as unknown as Promise<Milestone[]>;
  }

  async createMilestone(input: Omit<Milestone, "id" | "createdAt" | "updatedAt">): Promise<Milestone> {
    await this.assertNoPendingStructuralChange(input.projectId);
    this.assertMilestoneCodeFormat(input.milestoneCode);
    await this.assertMilestoneCodeUnique(input.projectId, input.milestoneCode);
    await this.assertMilestoneLinkedWorkPackage(input.projectId, input.relatedWorkPackage);
    this.assertMilestoneCompletionRule(input);
    return prisma.milestone.create({
      data: {
        ...input,
        plannedFinishDate: toDate(input.plannedFinishDate),
        actualFinishDate: input.actualFinishDate ? toDate(input.actualFinishDate) : null
      }
    }) as unknown as Promise<Milestone>;
  }

  async updateMilestone(id: string, input: Omit<Milestone, "id" | "createdAt" | "updatedAt">): Promise<Milestone> {
    await this.assertNoPendingStructuralChange(input.projectId);
    this.assertMilestoneCodeFormat(input.milestoneCode);
    await this.assertMilestoneCodeUnique(input.projectId, input.milestoneCode, id);
    await this.assertMilestoneLinkedWorkPackage(input.projectId, input.relatedWorkPackage);
    this.assertMilestoneCompletionRule(input);
    return prisma.milestone.update({
      where: { id },
      data: {
        ...input,
        plannedFinishDate: toDate(input.plannedFinishDate),
        actualFinishDate: input.actualFinishDate ? toDate(input.actualFinishDate) : null
      }
    }) as unknown as Promise<Milestone>;
  }

  async listProgressRecords(projectId?: string, allowedProjectIds?: string[]): Promise<ProgressRecord[]> {
    return prisma.progressRecord.findMany({
      where: whereProjectFilter(projectId, allowedProjectIds),
      orderBy: { createdAt: "desc" }
    }) as unknown as Promise<ProgressRecord[]>;
  }

  async createProgressRecord(
    input: Omit<ProgressRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<ProgressRecord> {
    this.assertNotVague(input.finishedWork, "本期完成工作");
    await this.assertProgressMilestoneExists(input.projectId, input.milestoneCode);
    await this.assertProgressStageMatchesMilestone(input.projectId, input.milestoneCode, input.currentStage);
    return prisma.progressRecord.create({
      data: {
        ...input,
        statPeriod: toDate(input.statPeriod),
        recordDate: toDate(input.recordDate)
      }
    }) as unknown as Promise<ProgressRecord>;
  }

  async updateProgressRecord(
    id: string,
    input: Omit<ProgressRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<ProgressRecord> {
    this.assertNotVague(input.finishedWork, "本期完成工作");
    await this.assertProgressMilestoneExists(input.projectId, input.milestoneCode);
    await this.assertProgressStageMatchesMilestone(input.projectId, input.milestoneCode, input.currentStage);
    return prisma.progressRecord.update({
      where: { id },
      data: {
        ...input,
        statPeriod: toDate(input.statPeriod),
        recordDate: toDate(input.recordDate)
      }
    }) as unknown as Promise<ProgressRecord>;
  }

  async listStatusAssessments(projectId?: string, allowedProjectIds?: string[]): Promise<StatusAssessment[]> {
    return prisma.statusAssessment.findMany({
      where: whereProjectFilter(projectId, allowedProjectIds),
      orderBy: { createdAt: "desc" }
    }) as unknown as Promise<StatusAssessment[]>;
  }

  async createStatusAssessment(
    input: Omit<StatusAssessment, "id" | "createdAt" | "updatedAt">
  ): Promise<StatusAssessment> {
    await this.assertAssessmentPeriodUnique(input.projectId, input.evalPeriod);
    this.assertAssessmentOverallWorstRule(input);
    this.assertNotVague(input.assessmentBasis, "状态判定依据");
    await this.assertStatusAssessmentStageConsistency(input.projectId, input.currentStage);
    await this.assertEscalatedRiskStatusLink(input.projectId, input.riskStatus);
    return prisma.statusAssessment.create({
      data: {
        ...input,
        evalPeriod: toDate(input.evalPeriod),
        assessmentDate: toDate(input.assessmentDate)
      }
    }) as unknown as Promise<StatusAssessment>;
  }

  async updateStatusAssessment(
    id: string,
    input: Omit<StatusAssessment, "id" | "createdAt" | "updatedAt">
  ): Promise<StatusAssessment> {
    await this.assertAssessmentPeriodUnique(input.projectId, input.evalPeriod, id);
    this.assertAssessmentOverallWorstRule(input);
    this.assertNotVague(input.assessmentBasis, "状态判定依据");
    await this.assertStatusAssessmentStageConsistency(input.projectId, input.currentStage);
    await this.assertEscalatedRiskStatusLink(input.projectId, input.riskStatus);
    return prisma.statusAssessment.update({
      where: { id },
      data: {
        ...input,
        evalPeriod: toDate(input.evalPeriod),
        assessmentDate: toDate(input.assessmentDate)
      }
    }) as unknown as Promise<StatusAssessment>;
  }

  async listRisks(projectId?: string, allowedProjectIds?: string[]): Promise<RiskItem[]> {
    return prisma.riskItem.findMany({
      where: whereProjectFilter(projectId, allowedProjectIds),
      orderBy: { createdAt: "desc" }
    }) as unknown as Promise<RiskItem[]>;
  }

  async createRisk(input: Omit<RiskItem, "id" | "createdAt" | "updatedAt">): Promise<RiskItem> {
    this.assertRiskCodeFormat(input.riskCode);
    this.assertNotVague(input.description, "问题/风险描述");
    await this.assertRiskLinkExists(input.projectId, input.linkedMilestoneOrTask);
    await this.assertRiskCodeUnique(input.projectId, input.riskCode);
    this.assertRiskCompletionRule(input);
    return prisma.riskItem.create({
      data: {
        ...input,
        plannedResolveDate: toDate(input.plannedResolveDate),
        actualResolveDate: input.actualResolveDate ? toDate(input.actualResolveDate) : null
      }
    }) as unknown as Promise<RiskItem>;
  }

  async updateRisk(id: string, input: Omit<RiskItem, "id" | "createdAt" | "updatedAt">): Promise<RiskItem> {
    this.assertRiskCodeFormat(input.riskCode);
    this.assertNotVague(input.description, "问题/风险描述");
    await this.assertRiskLinkExists(input.projectId, input.linkedMilestoneOrTask);
    await this.assertRiskCodeUnique(input.projectId, input.riskCode, id);
    this.assertRiskCompletionRule(input);
    return prisma.riskItem.update({
      where: { id },
      data: {
        ...input,
        plannedResolveDate: toDate(input.plannedResolveDate),
        actualResolveDate: input.actualResolveDate ? toDate(input.actualResolveDate) : null
      }
    }) as unknown as Promise<RiskItem>;
  }

  async listChanges(projectId?: string, allowedProjectIds?: string[]): Promise<ChangeRequest[]> {
    return prisma.changeRequest.findMany({
      where: whereProjectFilter(projectId, allowedProjectIds),
      orderBy: { createdAt: "desc" }
    }) as unknown as Promise<ChangeRequest[]>;
  }

  async createChange(input: Omit<ChangeRequest, "id" | "createdAt" | "updatedAt">): Promise<ChangeRequest> {
    this.assertChangeCodeFormat(input.changeCode);
    this.assertChangeCreateRule(input);
    this.assertChangeApprovalFields(input);
    await this.assertChangeCodeUnique(input.projectId, input.changeCode);
    return prisma.changeRequest.create({
      data: {
        ...input,
        requestDate: toDate(input.requestDate),
        approvalDate: input.approvalDate ? toDate(input.approvalDate) : null
      }
    }) as unknown as Promise<ChangeRequest>;
  }

  async updateChange(id: string, input: Omit<ChangeRequest, "id" | "createdAt" | "updatedAt">): Promise<ChangeRequest> {
    this.assertChangeCodeFormat(input.changeCode);
    this.assertChangeType(input.changeType);
    this.assertNotVague(input.reason, "变更原因");
    this.assertNotVague(input.afterContent, "变更后内容");
    this.assertChangeApprovalFields(input);
    await this.assertChangeUpdateFlow(id, input.currentStatus);
    await this.assertChangeCodeUnique(input.projectId, input.changeCode, id);
    return prisma.changeRequest.update({
      where: { id },
      data: {
        ...input,
        requestDate: toDate(input.requestDate),
        approvalDate: input.approvalDate ? toDate(input.approvalDate) : null
      }
    }) as unknown as Promise<ChangeRequest>;
  }

  async getProjectDashboard(projectId: string) {
    const [project, wbs, milestones, risks, statusAssessments, progressRecords] = await Promise.all([
      prisma.project.findUnique({ where: { id: projectId } }),
      prisma.wbsTask.findMany({ where: { projectId } }),
      prisma.milestone.findMany({ where: { projectId } }),
      prisma.riskItem.findMany({ where: { projectId } }),
      prisma.statusAssessment.findMany({ where: { projectId }, orderBy: { assessmentDate: "desc" }, take: 1 }),
      prisma.progressRecord.findMany({ where: { projectId }, orderBy: { statPeriod: "asc" }, take: 6 })
    ]);

    if (!project) {
      return null;
    }

    const now = todayStart();
    const taskCompleted = wbs.filter((t) => t.currentStatus === "已完成").length;
    const taskOverdue = wbs.filter((t) => t.currentStatus !== "已完成" && t.plannedEndDate < now).length;
    const criticalTasks = wbs.filter((t) => t.isCritical === "是").length;

    const milestoneCompleted = milestones.filter((m) => m.currentStatus === "已完成").length;
    const milestoneOverdue = milestones.filter((m) => m.currentStatus !== "已完成" && m.plannedFinishDate < now).length;

    const openRisks = risks.filter((r) => r.currentStatus !== "已完成");
    const escalatedOpenRisks = openRisks.filter((r) => r.escalateToManagement === "是");

    const hotspotMap = new Map<string, number>();
    openRisks.forEach((r) => {
      hotspotMap.set(r.stage, (hotspotMap.get(r.stage) || 0) + 1);
    });

    return {
      project,
      kpis: {
        taskTotal: wbs.length,
        taskCompleted,
        taskCompletionRate: wbs.length === 0 ? 0 : Number(((taskCompleted / wbs.length) * 100).toFixed(2)),
        taskOverdue,
        criticalTasks,
        milestoneTotal: milestones.length,
        milestoneCompleted,
        milestoneCompletionRate:
          milestones.length === 0 ? 0 : Number(((milestoneCompleted / milestones.length) * 100).toFixed(2)),
        milestoneOverdue,
        openRiskCount: openRisks.length,
        escalatedRiskCount: escalatedOpenRisks.length
      },
      latestStatus: statusAssessments[0] ?? null,
      riskHotspots: [...hotspotMap.entries()].map(([stage, count]) => ({ stage, count })),
      progressTrend: progressRecords.map((p) => ({ period: p.statPeriod, progress: p.overallProgressPct }))
    };
  }

  get client() {
    return prisma;
  }
}

export const store = new PrismaStore();
