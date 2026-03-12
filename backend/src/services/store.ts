import { AccessRole, PrismaClient, SysStatus } from "@prisma/client";
import {
  ChangeRequest,
  Milestone,
  ProgressRecord,
  Project,
  ProjectAttachment,
  ProjectReport,
  RiskItem,
  StatusAssessment,
  TaskStatus,
  WbsPlanningItemType,
  WbsSuggestionMode,
  WbsQuickSuggestionResult,
  WbsTask
} from "../domain/types.js";
import { BusinessError } from "./errors.js";
import { planRequirementToLightWbs } from "./requirementPlanner.js";
import { RULE_CONFIG } from "./rules/config.js";

export const prisma = new PrismaClient();

interface ProjectAttachmentDelegate {
  findMany(args: unknown): Promise<unknown[]>;
  create(args: unknown): Promise<unknown>;
  findFirst(args: unknown): Promise<unknown | null>;
  delete(args: unknown): Promise<unknown>;
}

const projectAttachmentModel = (prisma as unknown as { projectAttachment: ProjectAttachmentDelegate }).projectAttachment;

const toDate = (value: string) => new Date(value);

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter((item) => item.trim().length > 0);
}

function parseDateValue(value: string | Date): Date {
  return value instanceof Date ? value : toDate(value);
}

const STAGE_CODE_MAP: Record<WbsTask["level1Stage"], number> = {
  启动: 1,
  规划: 2,
  执行: 3,
  验收: 4
};

interface WbsPlanConflict {
  rowIndex: number;
  field: string;
  message: string;
  relatedTaskId?: string;
}

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

function normalizeProjectReport(report: any): ProjectReport {
  return {
    id: report.id,
    projectId: report.projectId,
    reportType: report.reportType,
    period: report.period,
    status: report.status,
    content: report.content,
    sourceSnapshot: report.sourceSnapshot ?? undefined,
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString()
  };
}

function normalizeProjectAttachment(attachment: any): ProjectAttachment {
  return {
    id: attachment.id,
    projectId: attachment.projectId,
    category: attachment.category,
    fileName: attachment.fileName,
    objectKey: attachment.objectKey,
    mimeType: attachment.mimeType ?? undefined,
    fileSize: String(attachment.fileSize ?? "0"),
    uploaderId: attachment.uploaderId ?? undefined,
    createdAt: attachment.createdAt.toISOString(),
    updatedAt: attachment.updatedAt.toISOString()
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

  private async assertWbsParentValid(projectId: string, parentTaskId?: string, currentTaskId?: string) {
    if (!parentTaskId) return;
    if (currentTaskId && parentTaskId === currentTaskId) {
      throw new BusinessError("父任务不能是当前任务自身", 400);
    }
    const parent = await prisma.wbsTask.findFirst({
      where: { id: parentTaskId, projectId },
      select: { id: true }
    });
    if (!parent) {
      throw new BusinessError("父任务不存在或不属于当前项目", 400);
    }
  }

  private async assertWbsMilestoneValid(projectId: string, milestoneId?: string) {
    if (!milestoneId) return;
    const milestone = await prisma.milestone.findFirst({
      where: { id: milestoneId, projectId },
      select: { id: true }
    });
    if (!milestone) {
      throw new BusinessError("关联里程碑不存在或不属于当前项目", 400);
    }
  }

  private async assertWbsPredecessorsExist(projectId: string, predecessorIds: string[], currentTaskId?: string) {
    if (predecessorIds.length === 0) return;
    if (currentTaskId && predecessorIds.includes(currentTaskId)) {
      throw new BusinessError("任务不能依赖自身", 400);
    }
    const rows = await prisma.wbsTask.findMany({
      where: { projectId, id: { in: predecessorIds } },
      select: { id: true }
    });
    if (rows.length !== predecessorIds.length) {
      throw new BusinessError("前置任务中存在无效任务ID", 400);
    }
  }

  private async assertWbsDependencyNoCycle(projectId: string, currentTaskId: string, predecessorIds: string[]) {
    const rows = await prisma.wbsTask.findMany({
      where: { projectId },
      select: { id: true, predecessorTaskIds: true }
    });
    const deps = new Map<string, string[]>();
    rows.forEach((row) => deps.set(row.id, asStringArray(row.predecessorTaskIds)));
    deps.set(currentTaskId, predecessorIds);

    const visiting = new Set<string>();
    const visited = new Set<string>();
    const hasCycle = (id: string): boolean => {
      if (visiting.has(id)) return true;
      if (visited.has(id)) return false;
      visiting.add(id);
      const next = deps.get(id) || [];
      for (const dep of next) {
        if (!deps.has(dep)) continue;
        if (hasCycle(dep)) return true;
      }
      visiting.delete(id);
      visited.add(id);
      return false;
    };

    if (hasCycle(currentTaskId)) {
      throw new BusinessError("WBS任务依赖形成循环，请检查前置关系", 400);
    }
  }

  private async assertWbsDependencyDateRule(projectId: string, input: Omit<WbsTask, "id" | "createdAt" | "updatedAt">) {
    const predecessorIds = input.predecessorTaskIds ?? [];
    if (predecessorIds.length === 0) return;
    const taskStart = parseDateValue(input.plannedStartDate);
    const predecessors = await prisma.wbsTask.findMany({
      where: { projectId, id: { in: predecessorIds } },
      select: { id: true, plannedEndDate: true, taskName: true }
    });
    for (const predecessor of predecessors) {
      if (taskStart.getTime() < predecessor.plannedEndDate.getTime()) {
        throw new BusinessError(
          `任务计划开始时间早于前置任务完成时间：${predecessor.taskName}`,
          400
        );
      }
    }
  }

  private async assertWbsInput(projectId: string, input: Omit<WbsTask, "id" | "createdAt" | "updatedAt">, currentTaskId?: string) {
    const start = parseDateValue(input.plannedStartDate);
    const end = parseDateValue(input.plannedEndDate);
    if (start.getTime() > end.getTime()) {
      throw new BusinessError("计划完成时间不得早于计划开始时间", 400);
    }
    await this.assertWbsParentValid(projectId, input.parentTaskId, currentTaskId);
    await this.assertWbsMilestoneValid(projectId, input.milestoneId);
    await this.assertWbsPredecessorsExist(projectId, input.predecessorTaskIds ?? [], currentTaskId);
    await this.assertWbsDependencyDateRule(projectId, input);
  }

  private buildSortOrderByCode(code?: string, fallback?: number) {
    if (!code) return fallback;
    const parts = code
      .split(".")
      .map((part) => Number(part))
      .filter((part) => Number.isFinite(part) && part >= 0);
    if (parts.length === 0) return fallback;
    const weights = [1_000_000, 1_000, 1];
    let sort = 0;
    for (let index = 0; index < Math.min(parts.length, 3); index += 1) {
      sort += (parts[index] || 0) * weights[index]!;
    }
    return sort || fallback;
  }

  private async assignAutoWbsCodes(
    projectId: string,
    items: Array<Omit<WbsTask, "id" | "createdAt" | "updatedAt">>
  ): Promise<Array<Omit<WbsTask, "id" | "createdAt" | "updatedAt">>> {
    const existing = await prisma.wbsTask.findMany({
      where: { projectId },
      select: { wbsCode: true, level1Stage: true, level2WorkPackage: true }
    });

    const packageOrderByStage = new Map<string, string[]>();
    const taskCountByBucket = new Map<string, number>();

    const ensurePackage = (stage: WbsTask["level1Stage"], workPackage: string) => {
      const stageKey = stage;
      const normalized = workPackage.trim() || "默认工作包";
      const list = packageOrderByStage.get(stageKey) || [];
      if (!list.includes(normalized)) {
        list.push(normalized);
        packageOrderByStage.set(stageKey, list);
      }
      return { list, normalized };
    };

    existing.forEach((row) => {
      const stage = row.level1Stage as WbsTask["level1Stage"];
      const workPackage = String(row.level2WorkPackage || "").trim() || "默认工作包";
      const { list, normalized } = ensurePackage(stage, workPackage);
      const packageIndex = list.indexOf(normalized) + 1;
      const bucketKey = `${stage}|${packageIndex}`;
      taskCountByBucket.set(bucketKey, (taskCountByBucket.get(bucketKey) || 0) + 1);
    });

    return items.map((item) => {
      const current = (item.wbsCode || "").trim();
      if (current) {
        return {
          ...item,
          wbsCode: current,
          sortOrder: item.sortOrder ?? this.buildSortOrderByCode(current, item.sortOrder)
        };
      }
      const { list, normalized } = ensurePackage(item.level1Stage, item.level2WorkPackage);
      const packageIndex = list.indexOf(normalized) + 1;
      const bucketKey = `${item.level1Stage}|${packageIndex}`;
      const nextTaskIndex = (taskCountByBucket.get(bucketKey) || 0) + 1;
      taskCountByBucket.set(bucketKey, nextTaskIndex);
      const generatedCode = `${STAGE_CODE_MAP[item.level1Stage]}.${packageIndex}.${nextTaskIndex}`;
      return {
        ...item,
        wbsCode: generatedCode,
        sortOrder: item.sortOrder ?? this.buildSortOrderByCode(generatedCode, item.sortOrder)
      };
    });
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

  async deleteProject(id: string): Promise<Project> {
    const row = await prisma.project.delete({ where: { id } });
    return normalizeProject(row);
  }

  async listProjectAttachments(projectId: string): Promise<ProjectAttachment[]> {
    const rows = await projectAttachmentModel.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" }
    });
    return rows.map((row) => normalizeProjectAttachment(row));
  }

  async createProjectAttachment(input: {
    projectId: string;
    category: string;
    fileName: string;
    objectKey: string;
    mimeType?: string;
    fileSize: bigint;
    uploaderId?: string;
  }): Promise<ProjectAttachment> {
    const row = await projectAttachmentModel.create({
      data: {
        projectId: input.projectId,
        category: input.category,
        fileName: input.fileName,
        objectKey: input.objectKey,
        mimeType: input.mimeType,
        fileSize: input.fileSize,
        uploaderId: input.uploaderId
      }
    });
    return normalizeProjectAttachment(row);
  }

  async getProjectAttachment(projectId: string, attachmentId: string): Promise<ProjectAttachment | null> {
    const row = await projectAttachmentModel.findFirst({
      where: { id: attachmentId, projectId }
    });
    return row ? normalizeProjectAttachment(row) : null;
  }

  async deleteProjectAttachment(projectId: string, attachmentId: string): Promise<ProjectAttachment | null> {
    const row = await projectAttachmentModel.findFirst({
      where: { id: attachmentId, projectId }
    });
    if (!row) return null;
    await projectAttachmentModel.delete({ where: { id: attachmentId } });
    return normalizeProjectAttachment(row);
  }

  async generateQuickWbsSuggestions(input: {
    projectId: string;
    itemType: WbsPlanningItemType;
    prompt: string;
    plannedStartDate: string;
    plannedEndDate: string;
    mode?: WbsSuggestionMode;
  }): Promise<WbsQuickSuggestionResult> {
    const project = await prisma.project.findUnique({
      where: { id: input.projectId },
      select: { id: true, projectOwner: true }
    });
    if (!project) {
      throw new BusinessError("项目不存在", 404);
    }
    const planned = planRequirementToLightWbs({
      projectId: input.projectId,
      itemType: input.itemType,
      prompt: input.prompt,
      plannedStartDate: input.plannedStartDate,
      plannedEndDate: input.plannedEndDate,
      projectOwner: project.projectOwner ?? undefined,
      mode: input.mode
    });
    const withCodes = await this.assignAutoWbsCodes(input.projectId, planned.wbsDrafts);
    return {
      ...planned,
      wbsDrafts: withCodes,
      items: withCodes
    };
  }

  async listWbs(
    projectId?: string,
    allowedProjectIds?: string[],
    filters?: { stage?: string; startDate?: string; endDate?: string }
  ): Promise<WbsTask[]> {
    const dateFilter = filters?.startDate || filters?.endDate
      ? {
          plannedEndDate: filters?.startDate ? { gte: toDate(filters.startDate) } : undefined,
          plannedStartDate: filters?.endDate ? { lte: toDate(filters.endDate) } : undefined
        }
      : {};
    return prisma.wbsTask.findMany({
      where: {
        ...(whereProjectFilter(projectId, allowedProjectIds) || {}),
        ...(filters?.stage ? { level1Stage: filters.stage as any } : {}),
        ...dateFilter
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
    }) as unknown as Promise<WbsTask[]>;
  }

  async createWbs(input: Omit<WbsTask, "id" | "createdAt" | "updatedAt">): Promise<WbsTask> {
    await this.assertNoPendingStructuralChange(input.projectId);
    const [normalized] = await this.assignAutoWbsCodes(input.projectId, [input]);
    if (!normalized) {
      throw new BusinessError("WBS输入无效", 400);
    }
    await this.assertWbsInput(input.projectId, normalized);
    return prisma.wbsTask.create({
      data: {
        ...normalized,
        predecessorTaskIds: normalized.predecessorTaskIds ?? [],
        plannedStartDate: toDate(normalized.plannedStartDate),
        plannedEndDate: toDate(normalized.plannedEndDate)
      }
    }) as unknown as Promise<WbsTask>;
  }

  async updateWbs(id: string, input: Omit<WbsTask, "id" | "createdAt" | "updatedAt">): Promise<WbsTask> {
    await this.assertNoPendingStructuralChange(input.projectId);
    await this.assertWbsInput(input.projectId, input, id);
    await this.assertWbsDependencyNoCycle(input.projectId, id, input.predecessorTaskIds ?? []);
    return prisma.wbsTask.update({
      where: { id },
      data: {
        ...input,
        predecessorTaskIds: input.predecessorTaskIds ?? [],
        plannedStartDate: toDate(input.plannedStartDate),
        plannedEndDate: toDate(input.plannedEndDate)
      }
    }) as unknown as Promise<WbsTask>;
  }

  async batchCreateWbs(input: {
    projectId: string;
    items: Array<Omit<WbsTask, "id" | "createdAt" | "updatedAt">>;
  }): Promise<{ createdCount: number; items: WbsTask[] }> {
    await this.assertNoPendingStructuralChange(input.projectId);
    const normalizedItems = await this.assignAutoWbsCodes(input.projectId, input.items);
    const errors: Array<{ rowIndex: number; message: string }> = [];
    for (let index = 0; index < normalizedItems.length; index += 1) {
      const item = normalizedItems[index]!;
      try {
        await this.assertWbsInput(input.projectId, item);
      } catch (error) {
        const message = error instanceof Error ? error.message : "校验失败";
        errors.push({ rowIndex: index, message });
      }
    }
    if (errors.length > 0) {
      throw new BusinessError("批量创建失败，存在未通过校验的记录", 400, {
        rowErrors: errors
      });
    }

    const created = await prisma.$transaction(
      normalizedItems.map((item) =>
        prisma.wbsTask.create({
          data: {
            ...item,
            predecessorTaskIds: item.predecessorTaskIds ?? [],
            plannedStartDate: toDate(item.plannedStartDate),
            plannedEndDate: toDate(item.plannedEndDate)
          }
        })
      )
    );

    return {
      createdCount: created.length,
      items: created as unknown as WbsTask[]
    };
  }

  async validateWbsPlan(input: {
    projectId: string;
    items: Array<Omit<WbsTask, "id" | "createdAt" | "updatedAt">>;
  }): Promise<{ ok: boolean; conflicts: WbsPlanConflict[] }> {
    const conflicts: WbsPlanConflict[] = [];
    for (let index = 0; index < input.items.length; index += 1) {
      const item = input.items[index]!;
      const start = parseDateValue(item.plannedStartDate);
      const end = parseDateValue(item.plannedEndDate);
      if (start.getTime() > end.getTime()) {
        conflicts.push({
          rowIndex: index,
          field: "plannedEndDate",
          message: "计划完成时间不得早于计划开始时间"
        });
      }
      const predecessorIds = item.predecessorTaskIds ?? [];
      if (predecessorIds.length > 0) {
        const predecessors = await prisma.wbsTask.findMany({
          where: { projectId: input.projectId, id: { in: predecessorIds } },
          select: { id: true, plannedEndDate: true }
        });
        const predecessorMap = new Map(predecessors.map((row) => [row.id, row]));
        predecessorIds.forEach((predecessorId) => {
          const predecessor = predecessorMap.get(predecessorId);
          if (!predecessor) {
            conflicts.push({
              rowIndex: index,
              field: "predecessorTaskIds",
              relatedTaskId: predecessorId,
              message: "前置任务不存在"
            });
            return;
          }
          if (start.getTime() < predecessor.plannedEndDate.getTime()) {
            conflicts.push({
              rowIndex: index,
              field: "plannedStartDate",
              relatedTaskId: predecessorId,
              message: "计划开始时间早于前置任务完成时间"
            });
          }
        });
      }
    }
    return { ok: conflicts.length === 0, conflicts };
  }

  async updateWbsStatus(id: string, projectId: string, currentStatus: TaskStatus): Promise<WbsTask> {
    await this.assertNoPendingStructuralChange(projectId);
    const exists = await prisma.wbsTask.findFirst({
      where: { id, projectId },
      select: { id: true }
    });
    if (!exists) {
      throw new BusinessError("WBS任务不存在", 404);
    }
    return prisma.wbsTask.update({
      where: { id },
      data: { currentStatus }
    }) as unknown as Promise<WbsTask>;
  }

  async deleteWbs(id: string): Promise<WbsTask> {
    return prisma.wbsTask.delete({ where: { id } }) as unknown as Promise<WbsTask>;
  }

  async listMilestones(
    projectId?: string,
    allowedProjectIds?: string[],
    filters?: { stage?: string; startDate?: string; endDate?: string; includeTaskSummary?: boolean }
  ): Promise<Milestone[]> {
    const plannedFinishDateFilter =
      filters?.startDate || filters?.endDate
        ? {
            gte: filters?.startDate ? toDate(filters.startDate) : undefined,
            lte: filters?.endDate ? toDate(filters.endDate) : undefined
          }
        : undefined;
    const rows = await prisma.milestone.findMany({
      where: {
        ...(whereProjectFilter(projectId, allowedProjectIds) || {}),
        ...(filters?.stage ? { level1Stage: filters.stage as any } : {}),
        ...(plannedFinishDateFilter ? { plannedFinishDate: plannedFinishDateFilter } : {})
      },
      include: filters?.includeTaskSummary
        ? {
            linkedTasks: {
              select: {
                id: true,
                taskName: true,
                wbsCode: true,
                currentStatus: true
              }
            }
          }
        : undefined,
      orderBy: [{ plannedFinishDate: "asc" }, { createdAt: "desc" }]
    });

    return rows.map((row) => ({
      ...(row as unknown as Milestone),
      linkedTaskSummaries:
        "linkedTasks" in row
          ? ((row as unknown as { linkedTasks: Array<{ id: string; taskName: string; wbsCode: string | null; currentStatus: TaskStatus }> }).linkedTasks || []).map((task) => ({
            id: task.id,
            taskName: task.taskName,
            wbsCode: task.wbsCode ?? undefined,
            currentStatus: task.currentStatus
          }))
          : undefined,
      linkWarning:
        "linkedTasks" in row &&
        ["进行中", "已完成"].includes(String((row as unknown as { currentStatus: string }).currentStatus)) &&
        ((row as unknown as { linkedTasks?: unknown[] }).linkedTasks || []).length === 0
          ? "里程碑缺少支撑任务关联"
          : undefined
    }));
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

  async deleteMilestone(id: string): Promise<Milestone> {
    return prisma.milestone.delete({ where: { id } }) as unknown as Promise<Milestone>;
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

  async deleteProgressRecord(id: string): Promise<ProgressRecord> {
    return prisma.progressRecord.delete({ where: { id } }) as unknown as Promise<ProgressRecord>;
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

  async deleteStatusAssessment(id: string): Promise<StatusAssessment> {
    return prisma.statusAssessment.delete({ where: { id } }) as unknown as Promise<StatusAssessment>;
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

  async deleteRisk(id: string): Promise<RiskItem> {
    return prisma.riskItem.delete({ where: { id } }) as unknown as Promise<RiskItem>;
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

  async deleteChange(id: string): Promise<ChangeRequest> {
    return prisma.changeRequest.delete({ where: { id } }) as unknown as Promise<ChangeRequest>;
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

  async listProjectReports(
    projectId?: string,
    allowedProjectIds?: string[],
    reportType?: "WEEKLY" | "MONTHLY"
  ): Promise<ProjectReport[]> {
    const where = {
      ...whereProjectFilter(projectId, allowedProjectIds),
      ...(reportType ? { reportType } : {})
    };
    const rows = await prisma.projectReport.findMany({
      where,
      orderBy: [{ period: "desc" }, { updatedAt: "desc" }]
    });
    return rows.map(normalizeProjectReport);
  }

  async getProjectReportSummary(projectId: string) {
    const [weekly, monthly] = await Promise.all([
      prisma.projectReport.findFirst({
        where: { projectId, reportType: "WEEKLY" },
        orderBy: { period: "desc" }
      }),
      prisma.projectReport.findFirst({
        where: { projectId, reportType: "MONTHLY" },
        orderBy: { period: "desc" }
      })
    ]);
    return {
      weekly: weekly ? normalizeProjectReport(weekly) : null,
      monthly: monthly ? normalizeProjectReport(monthly) : null
    };
  }

  async upsertProjectReport(input: {
    projectId: string;
    reportType: "WEEKLY" | "MONTHLY";
    period: string;
    status: "DRAFT" | "SUBMITTED";
    content: string;
    sourceSnapshot?: unknown;
  }): Promise<ProjectReport> {
    const row = await prisma.projectReport.upsert({
      where: {
        projectId_reportType_period: {
          projectId: input.projectId,
          reportType: input.reportType,
          period: input.period
        }
      },
      create: {
        projectId: input.projectId,
        reportType: input.reportType,
        period: input.period,
        status: input.status,
        content: input.content,
        sourceSnapshot: input.sourceSnapshot as any
      },
      update: {
        status: input.status,
        content: input.content,
        sourceSnapshot: input.sourceSnapshot as any
      }
    });
    return normalizeProjectReport(row);
  }

  async generateProjectReportDraft(
    projectId: string,
    reportType: "WEEKLY" | "MONTHLY",
    period: string
  ): Promise<ProjectReport> {
    const dashboard = await this.getProjectDashboard(projectId);
    if (!dashboard) throw new BusinessError("项目不存在", 404);
    const [latestProgress, latestAssessment, topRisks, openChanges] = await Promise.all([
      prisma.progressRecord.findMany({ where: { projectId }, orderBy: { statPeriod: "desc" }, take: 3 }),
      prisma.statusAssessment.findMany({ where: { projectId }, orderBy: { assessmentDate: "desc" }, take: 1 }),
      prisma.riskItem.findMany({ where: { projectId, currentStatus: { not: "已完成" } }, orderBy: { updatedAt: "desc" }, take: 5 }),
      prisma.changeRequest.findMany({ where: { projectId, currentStatus: { not: "已完成" } }, orderBy: { updatedAt: "desc" }, take: 5 })
    ]);
    const snapshot = {
      kpis: dashboard.kpis,
      latestStatus: dashboard.latestStatus,
      progressRecords: latestProgress.map((item) => ({
        statPeriod: item.statPeriod,
        currentStage: item.currentStage,
        overallProgressPct: item.overallProgressPct,
        nextPlan: item.nextPlan
      })),
      statusAssessments: latestAssessment.map((item) => ({
        assessmentDate: item.assessmentDate,
        overallStatus: item.overallStatus,
        assessmentBasis: item.assessmentBasis,
        watchItems: item.watchItems
      })),
      risks: topRisks.map((item) => ({
        riskCode: item.riskCode,
        description: item.description,
        owner: item.owner,
        currentStatus: item.currentStatus
      })),
      changes: openChanges.map((item) => ({
        changeCode: item.changeCode,
        changeType: item.changeType,
        currentStatus: item.currentStatus
      }))
    };
    const kpiMap = dashboard.kpis as Record<string, unknown>;
    const content = [
      `# ${reportType === "WEEKLY" ? "周报" : "月报"}草稿`,
      ``,
      `- 周期：${period}`,
      `- 任务完成率：${Number(kpiMap.taskCompletionRate ?? 0)}%`,
      `- 里程碑完成率：${Number(kpiMap.milestoneCompletionRate ?? 0)}%`,
      `- 逾期任务：${Number(kpiMap.taskOverdue ?? 0)}`,
      `- 开放风险：${Number(kpiMap.openRiskCount ?? 0)}`,
      ``,
      `## 本期重点进展`,
      latestProgress.map((item) => `- ${item.statPeriod.toISOString().slice(0, 10)}：进度 ${item.overallProgressPct}%`).join("\n") || "- 暂无推进记录",
      ``,
      `## 风险与待协调事项`,
      topRisks.map((item) => `- [${item.riskCode}] ${item.description}（责任人：${item.owner}）`).join("\n") || "- 暂无开放风险",
      ``,
      `## 变更情况`,
      openChanges.map((item) => `- [${item.changeCode}] ${item.changeType}（状态：${item.currentStatus}）`).join("\n") || "- 暂无进行中变更",
      ``,
      `## 下阶段计划`,
      latestProgress.map((item) => `- ${item.nextPlan}`).join("\n") || "- 请补充下阶段计划"
    ].join("\n");

    return this.upsertProjectReport({
      projectId,
      reportType,
      period,
      status: "DRAFT",
      content,
      sourceSnapshot: snapshot
    });
  }

  get client() {
    return prisma;
  }
}

export const store = new PrismaStore();
