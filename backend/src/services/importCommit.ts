import { Stage, TaskStatus, TrafficLight, YesNo } from "@prisma/client";
import {
  createChangeSchema,
  createMilestoneSchema,
  createProgressRecordSchema,
  createRiskSchema,
  createStatusAssessmentSchema,
  createWbsSchema
} from "./validators.js";
import { store } from "./store.js";
import { previewExcel } from "./excelImporter.js";
import { BusinessError } from "./errors.js";

const stageMap: Record<string, Stage> = {
  启动: Stage.启动,
  规划: Stage.规划,
  执行: Stage.执行,
  验收: Stage.验收
};

const statusMap: Record<string, TaskStatus> = {
  未开始: TaskStatus.未开始,
  进行中: TaskStatus.进行中,
  已完成: TaskStatus.已完成,
  延期: TaskStatus.延期
};

const lightMap: Record<string, TrafficLight> = {
  绿: TrafficLight.绿,
  黄: TrafficLight.黄,
  红: TrafficLight.红
};

const ynMap: Record<string, YesNo> = {
  是: YesNo.是,
  否: YesNo.否
};

const stageSet = new Set(Object.keys(stageMap));

const defaultStage = Stage.规划;
const defaultStatus = TaskStatus.未开始;

function toStage(v: string | undefined) {
  return (v && stageMap[v]) || defaultStage;
}

function toStatus(v: string | undefined) {
  return (v && statusMap[v]) || defaultStatus;
}

function toLight(v: string | undefined) {
  return (v && lightMap[v]) || TrafficLight.黄;
}

function toYesNo(v: string | undefined) {
  return (v && ynMap[v]) || YesNo.否;
}

function validDate(v: string | undefined, fallback = "2026-01-01") {
  if (!v) return fallback;
  return /^\d{4}-\d{2}-\d{2}/.test(v) ? v : fallback;
}

function nonEmpty(v: string | undefined, fallback = "未填写") {
  return (v || "").trim() || fallback;
}

function hasChineseSlashRuleText(v: string | undefined) {
  return !!v && (v.includes("/") || v.includes("填写要求") || v.includes("类型："));
}

function isValidProjectRow(row: any) {
  return !!row.projectName && !!row.projectType && !!row.leadDepartment && !!row.projectOwner && Number(row.year) >= 2000;
}

function isValidWbsRow(row: any) {
  return (
    stageSet.has(row.level1Stage || "") &&
    !!row.level2WorkPackage &&
    !!row.taskName &&
    !hasChineseSlashRuleText(row.taskName) &&
    !!row.taskOwner &&
    /^\d{4}-\d{2}-\d{2}/.test(row.plannedStartDate || "") &&
    /^\d{4}-\d{2}-\d{2}/.test(row.plannedEndDate || "")
  );
}

function isValidMilestoneRow(row: any) {
  return /^M\d+/i.test(row.milestoneCode || "") && stageSet.has(row.level1Stage || "") && !!row.milestoneName;
}

function isValidProgressRow(row: any) {
  return stageSet.has(row.currentStage || "") && !!row.recorder && /^\d{4}-\d{2}-\d{2}/.test(row.recordDate || "");
}

function isValidAssessmentRow(row: any) {
  return !!lightMap[row.overallStatus || ""] && !!row.assessor && /^\d{4}-\d{2}-\d{2}/.test(row.assessmentDate || "");
}

function isValidRiskRow(row: any) {
  return !!row.riskCode && !!row.description && stageSet.has(row.stage || "");
}

function isValidChangeRow(row: any) {
  return !!row.changeCode && !!row.changeType && !!row.requester;
}

export async function commitExcel(filePath: string, ownerUserId?: string) {
  const preview = previewExcel(filePath);

  preview.data.projects = preview.data.projects.filter(isValidProjectRow);
  preview.data.wbs = preview.data.wbs.filter(isValidWbsRow);
  preview.data.milestones = preview.data.milestones.filter(isValidMilestoneRow);
  preview.data.progressRecords = preview.data.progressRecords.filter(isValidProgressRow);
  preview.data.statusAssessments = preview.data.statusAssessments.filter(isValidAssessmentRow);
  preview.data.risks = preview.data.risks.filter(isValidRiskRow);
  preview.data.changes = preview.data.changes.filter(isValidChangeRow);

  const created = {
    project: 0,
    wbs: 0,
    milestones: 0,
    progressRecords: 0,
    statusAssessments: 0,
    risks: 0,
    changes: 0
  };
  const skipped = {
    wbs: 0,
    milestones: 0,
    progressRecords: 0,
    statusAssessments: 0,
    risks: 0,
    changes: 0
  };

  const firstProject = preview.data.projects[0];
  if (!firstProject) {
    throw new Error("Excel 中未识别到项目立项数据，无法入库");
  }

  const existingProject = await store.client.project.findFirst({
    where: {
      projectName: nonEmpty(firstProject.projectName),
      year: Number(firstProject.year) || 2026
    }
  });

  let projectId = existingProject?.id;
  if (!projectId) {
    const project = await store.createProject(
      {
        projectName: nonEmpty(firstProject.projectName),
        projectType: nonEmpty(firstProject.projectType),
        year: Number(firstProject.year) || 2026,
        leadDepartment: nonEmpty(firstProject.leadDepartment),
        projectOwner: nonEmpty(firstProject.projectOwner),
        participants: nonEmpty(firstProject.participants),
        background: firstProject.background,
        goal: firstProject.goal,
        scope: firstProject.scope,
        expectedOutcome: firstProject.expectedOutcome
      },
      ownerUserId
    );
    projectId = project.id;
    created.project += 1;
  }

  for (const row of preview.data.wbs) {
    const payload = {
      projectId,
      level1Stage: toStage(row.level1Stage),
      level2WorkPackage: nonEmpty(row.level2WorkPackage),
      taskName: nonEmpty(row.taskName),
      taskDetail: nonEmpty(row.taskDetail),
      deliverable: nonEmpty(row.deliverable),
      taskOwner: nonEmpty(row.taskOwner),
      plannedStartDate: validDate(row.plannedStartDate),
      plannedEndDate: validDate(row.plannedEndDate),
      currentStatus: toStatus(row.currentStatus),
      isCritical: toYesNo(row.isCritical),
      riskHint: row.riskHint,
      linkedMasterTask: row.linkedMasterTask
    };

    const parsed = createWbsSchema.safeParse(payload);
    if (!parsed.success) {
      skipped.wbs += 1;
      continue;
    }

    const exists = await store.client.wbsTask.findFirst({
      where: {
        projectId,
        taskName: payload.taskName,
        level2WorkPackage: payload.level2WorkPackage
      }
    });
    if (exists) {
      skipped.wbs += 1;
      continue;
    }

    try {
      await store.createWbs(parsed.data as any);
      created.wbs += 1;
    } catch (err) {
      if (err instanceof BusinessError) {
        skipped.wbs += 1;
        continue;
      }
      throw err;
    }
  }

  for (const row of preview.data.milestones) {
    const payload = {
      projectId,
      milestoneCode: nonEmpty(row.milestoneCode),
      milestoneName: nonEmpty(row.milestoneName),
      level1Stage: toStage(row.level1Stage),
      relatedWorkPackage: nonEmpty(row.relatedWorkPackage),
      keyOutcome: nonEmpty(row.keyOutcome),
      doneCriteria: nonEmpty(row.doneCriteria),
      plannedFinishDate: validDate(row.plannedFinishDate),
      actualFinishDate: row.actualFinishDate ? validDate(row.actualFinishDate) : undefined,
      owner: nonEmpty(row.owner),
      currentStatus: toStatus(row.currentStatus),
      note: row.note
    };

    const parsed = createMilestoneSchema.safeParse(payload);
    if (!parsed.success) {
      skipped.milestones += 1;
      continue;
    }

    const exists = await store.client.milestone.findFirst({ where: { projectId, milestoneCode: payload.milestoneCode } });
    if (exists) {
      skipped.milestones += 1;
      continue;
    }

    try {
      await store.createMilestone(parsed.data as any);
      created.milestones += 1;
    } catch (err) {
      if (err instanceof BusinessError) {
        skipped.milestones += 1;
        continue;
      }
      throw err;
    }
  }

  for (const row of preview.data.progressRecords) {
    const payload = {
      projectId,
      statPeriod: validDate(row.statPeriod),
      currentStage: toStage(row.currentStage),
      milestoneCode: nonEmpty(row.milestoneCode),
      finishedWork: nonEmpty(row.finishedWork),
      overallProgressPct: Number(row.overallProgressPct) || 0,
      issuesAndRisks: nonEmpty(row.issuesAndRisks),
      needsCoordination: nonEmpty(row.needsCoordination),
      nextPlan: nonEmpty(row.nextPlan),
      recorder: nonEmpty(row.recorder),
      recordDate: validDate(row.recordDate)
    };

    const parsed = createProgressRecordSchema.safeParse(payload);
    if (!parsed.success) {
      skipped.progressRecords += 1;
      continue;
    }

    try {
      await store.createProgressRecord(parsed.data as any);
      created.progressRecords += 1;
    } catch (err) {
      if (err instanceof BusinessError) {
        skipped.progressRecords += 1;
        continue;
      }
      throw err;
    }
  }

  for (const row of preview.data.statusAssessments) {
    const payload = {
      projectId,
      evalPeriod: validDate(row.evalPeriod),
      currentStage: toStage(row.currentStage),
      overallStatus: toLight(row.overallStatus),
      scheduleStatus: toLight(row.scheduleStatus),
      qualityStatus: toLight(row.qualityStatus),
      riskStatus: toLight(row.riskStatus),
      assessmentBasis: nonEmpty(row.assessmentBasis),
      watchItems: nonEmpty(row.watchItems),
      assessor: nonEmpty(row.assessor),
      assessmentDate: validDate(row.assessmentDate)
    };

    const parsed = createStatusAssessmentSchema.safeParse(payload);
    if (!parsed.success) {
      skipped.statusAssessments += 1;
      continue;
    }

    try {
      await store.createStatusAssessment(parsed.data as any);
      created.statusAssessments += 1;
    } catch (err) {
      if (err instanceof BusinessError) {
        skipped.statusAssessments += 1;
        continue;
      }
      throw err;
    }
  }

  for (const row of preview.data.risks) {
    const payload = {
      projectId,
      riskCode: nonEmpty(row.riskCode),
      riskType: nonEmpty(row.riskType),
      stage: toStage(row.stage),
      description: nonEmpty(row.description),
      impactLevel: nonEmpty(row.impactLevel),
      mitigationPlan: nonEmpty(row.mitigationPlan),
      owner: nonEmpty(row.owner),
      plannedResolveDate: validDate(row.plannedResolveDate),
      currentStatus: toStatus(row.currentStatus),
      actualResolveDate: row.actualResolveDate ? validDate(row.actualResolveDate) : undefined,
      escalateToManagement: toYesNo(row.escalateToManagement),
      linkedMilestoneOrTask: row.linkedMilestoneOrTask,
      note: row.note
    };

    const parsed = createRiskSchema.safeParse(payload);
    if (!parsed.success) {
      skipped.risks += 1;
      continue;
    }

    const exists = await store.client.riskItem.findFirst({ where: { projectId, riskCode: payload.riskCode } });
    if (exists) {
      skipped.risks += 1;
      continue;
    }

    try {
      await store.createRisk(parsed.data as any);
      created.risks += 1;
    } catch (err) {
      if (err instanceof BusinessError) {
        skipped.risks += 1;
        continue;
      }
      throw err;
    }
  }

  for (const row of preview.data.changes) {
    const payload = {
      projectId,
      changeCode: nonEmpty(row.changeCode),
      changeType: nonEmpty(row.changeType),
      requestDate: validDate(row.requestDate),
      requester: nonEmpty(row.requester),
      reason: nonEmpty(row.reason),
      beforeContent: nonEmpty(row.beforeContent),
      afterContent: nonEmpty(row.afterContent),
      impactAnalysis: nonEmpty(row.impactAnalysis),
      impactsMilestoneOrWbs: toYesNo(row.impactsMilestoneOrWbs),
      evaluationConclusion: nonEmpty(row.evaluationConclusion),
      approver: row.approver,
      approvalDate: row.approvalDate ? validDate(row.approvalDate) : undefined,
      currentStatus: toStatus(row.currentStatus),
      note: row.note
    };

    const parsed = createChangeSchema.safeParse(payload);
    if (!parsed.success) {
      skipped.changes += 1;
      continue;
    }

    const exists = await store.client.changeRequest.findFirst({ where: { projectId, changeCode: payload.changeCode } });
    if (exists) {
      skipped.changes += 1;
      continue;
    }

    try {
      await store.createChange(parsed.data as any);
      created.changes += 1;
    } catch (err) {
      if (err instanceof BusinessError) {
        skipped.changes += 1;
        continue;
      }
      throw err;
    }
  }

  return {
    projectId,
    created,
    skipped
  };
}
