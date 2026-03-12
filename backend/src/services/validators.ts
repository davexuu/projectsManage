import { z } from "zod";

const stage = z.enum(["启动", "规划", "执行", "验收"]);
const status = z.enum(["未开始", "进行中", "已完成", "延期"]);
const trafficLight = z.enum(["绿", "黄", "红"]);
const yn = z.enum(["是", "否"]);
const dateString = z.string().min(8);
const wbsStatusValues = ["未开始", "进行中", "已完成", "延期"] as const;
const reportType = z.enum(["WEEKLY", "MONTHLY"]);
const reportStatus = z.enum(["DRAFT", "SUBMITTED"]);
const planningItemType = z.enum(["功能开发", "数据处理", "材料编写", "会议协调", "排查修复", "其他事项"]);
const wbsCodePattern = /^\d+(?:\.\d+)*$/;
const uuidLike = z.string().min(1);

export const createProjectSchema = z.object({
  projectName: z.string().min(1),
  projectType: z.string().min(1),
  year: z.coerce.number().int().min(2000).max(2100),
  leadDepartment: z.string().min(1),
  projectOwner: z.string().min(1),
  participants: z.string().min(1),
  background: z.string().optional(),
  goal: z.string().optional(),
  scope: z.string().optional(),
  expectedOutcome: z.string().optional()
});

export const createWbsSchema = z.object({
  projectId: z.string().min(1),
  wbsCode: z
    .string()
    .trim()
    .regex(wbsCodePattern, "WBS编码格式不合法，应为 1 或 1.2.3")
    .optional(),
  parentTaskId: uuidLike.optional(),
  predecessorTaskIds: z.array(uuidLike).optional(),
  milestoneId: uuidLike.optional(),
  sortOrder: z.coerce.number().int().optional(),
  level1Stage: stage,
  level2WorkPackage: z.string().min(1),
  taskName: z.string().min(1),
  taskDetail: z.string().min(1),
  deliverable: z.string().min(1),
  taskOwner: z.string().min(1),
  plannedStartDate: dateString,
  plannedEndDate: dateString,
  currentStatus: status,
  isCritical: yn,
  riskHint: z.string().optional(),
  linkedMasterTask: z.string().optional()
});

export const createWbsBatchSchema = z.object({
  projectId: z.string().min(1),
  items: z.array(createWbsSchema).min(1)
});

export const validateWbsPlanSchema = z.object({
  projectId: z.string().min(1),
  items: z.array(createWbsSchema).min(1)
});

export const quickWbsSuggestionSchema = z.object({
  projectId: z.string().min(1),
  itemType: planningItemType,
  prompt: z.string().trim().min(2).max(200),
  plannedStartDate: dateString,
  plannedEndDate: dateString,
  mode: z.enum(["light", "standard", "complete"]).default("standard")
}).superRefine((input, ctx) => {
  if (new Date(input.plannedEndDate).getTime() < new Date(input.plannedStartDate).getTime()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["plannedEndDate"],
      message: "计划完成时间不得早于计划开始时间"
    });
  }
});

export const updateWbsStatusSchema = z.object({
  projectId: z.string().min(1),
  currentStatus: z
    .string()
    .refine((value): value is (typeof wbsStatusValues)[number] => wbsStatusValues.includes(value as (typeof wbsStatusValues)[number]), {
      message: "任务状态不合法"
    })
});

export const createMilestoneSchema = z.object({
  projectId: z.string().min(1),
  milestoneCode: z.string().min(1),
  milestoneName: z.string().min(1),
  level1Stage: stage,
  relatedWorkPackage: z.string().min(1),
  keyOutcome: z.string().min(1),
  doneCriteria: z.string().min(1),
  plannedFinishDate: dateString,
  actualFinishDate: z.string().optional(),
  owner: z.string().min(1),
  currentStatus: status,
  note: z.string().optional()
});

export const createProgressRecordSchema = z.object({
  projectId: z.string().min(1),
  statPeriod: dateString,
  currentStage: stage,
  milestoneCode: z.string().min(1),
  finishedWork: z.string().min(1),
  overallProgressPct: z.number().min(0).max(100),
  issuesAndRisks: z.string().min(1),
  needsCoordination: z.string().min(1),
  nextPlan: z.string().min(1),
  recorder: z.string().min(1),
  recordDate: dateString
});

export const createStatusAssessmentSchema = z.object({
  projectId: z.string().min(1),
  evalPeriod: dateString,
  currentStage: stage,
  overallStatus: trafficLight,
  scheduleStatus: trafficLight,
  qualityStatus: trafficLight,
  riskStatus: trafficLight,
  assessmentBasis: z.string().min(1),
  watchItems: z.string().min(1),
  assessor: z.string().min(1),
  assessmentDate: dateString
});

export const createRiskSchema = z.object({
  projectId: z.string().min(1),
  riskCode: z.string().min(1),
  riskType: z.string().min(1),
  stage,
  description: z.string().min(1),
  impactLevel: z.string().min(1),
  mitigationPlan: z.string().min(1),
  owner: z.string().min(1),
  plannedResolveDate: dateString,
  currentStatus: status,
  actualResolveDate: z.string().optional(),
  escalateToManagement: yn,
  linkedMilestoneOrTask: z.string().optional(),
  note: z.string().optional()
});

export const createChangeSchema = z.object({
  projectId: z.string().min(1),
  changeCode: z.string().min(1),
  changeType: z.string().min(1),
  requestDate: dateString,
  requester: z.string().min(1),
  reason: z.string().min(1),
  beforeContent: z.string().min(1),
  afterContent: z.string().min(1),
  impactAnalysis: z.string().min(1),
  impactsMilestoneOrWbs: yn,
  evaluationConclusion: z.string().min(1),
  approver: z.string().optional(),
  approvalDate: z.string().optional(),
  currentStatus: status,
  note: z.string().optional()
});

export const upsertProjectReportSchema = z.object({
  projectId: z.string().min(1),
  reportType,
  period: z.string().min(4),
  status: reportStatus,
  content: z.string().min(1),
  sourceSnapshot: z.unknown().optional()
});

export const generateProjectReportSchema = z.object({
  projectId: z.string().min(1),
  reportType,
  period: z.string().min(4)
});
