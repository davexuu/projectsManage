import { z } from "zod";

const stage = z.enum(["启动", "规划", "执行", "验收"]);
const status = z.enum(["未开始", "进行中", "已完成", "延期"]);
const trafficLight = z.enum(["绿", "黄", "红"]);
const yn = z.enum(["是", "否"]);
const dateString = z.string().min(8);

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
