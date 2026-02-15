export type Stage = "启动" | "规划" | "执行" | "验收";
export type TaskStatus = "未开始" | "进行中" | "已完成" | "延期";
export type TrafficLight = "绿" | "黄" | "红";

export interface BaseEntity {
  id: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  projectName: string;
  projectType: string;
  year: number;
  leadDepartment: string;
  projectOwner: string;
  participants: string;
  background?: string;
  goal?: string;
  scope?: string;
  expectedOutcome?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WbsTask extends BaseEntity {
  level1Stage: Stage;
  level2WorkPackage: string;
  taskName: string;
  taskDetail: string;
  deliverable: string;
  taskOwner: string;
  plannedStartDate: string;
  plannedEndDate: string;
  currentStatus: TaskStatus;
  isCritical: "是" | "否";
  riskHint?: string;
  linkedMasterTask?: string;
}

export interface Milestone extends BaseEntity {
  milestoneCode: string;
  milestoneName: string;
  level1Stage: Stage;
  relatedWorkPackage: string;
  keyOutcome: string;
  doneCriteria: string;
  plannedFinishDate: string;
  actualFinishDate?: string;
  owner: string;
  currentStatus: TaskStatus;
  note?: string;
}

export interface ProgressRecord extends BaseEntity {
  statPeriod: string;
  currentStage: Stage;
  milestoneCode: string;
  finishedWork: string;
  overallProgressPct: number;
  issuesAndRisks: string;
  needsCoordination: string;
  nextPlan: string;
  recorder: string;
  recordDate: string;
}

export interface StatusAssessment extends BaseEntity {
  evalPeriod: string;
  currentStage: Stage;
  overallStatus: TrafficLight;
  scheduleStatus: TrafficLight;
  qualityStatus: TrafficLight;
  riskStatus: TrafficLight;
  assessmentBasis: string;
  watchItems: string;
  assessor: string;
  assessmentDate: string;
}

export interface RiskItem extends BaseEntity {
  riskCode: string;
  riskType: string;
  stage: Stage;
  description: string;
  impactLevel: string;
  mitigationPlan: string;
  owner: string;
  plannedResolveDate: string;
  currentStatus: TaskStatus;
  actualResolveDate?: string;
  escalateToManagement: "是" | "否";
  linkedMilestoneOrTask?: string;
  note?: string;
}

export interface ChangeRequest extends BaseEntity {
  changeCode: string;
  changeType: string;
  requestDate: string;
  requester: string;
  reason: string;
  beforeContent: string;
  afterContent: string;
  impactAnalysis: string;
  impactsMilestoneOrWbs: "是" | "否";
  evaluationConclusion: string;
  approver?: string;
  approvalDate?: string;
  currentStatus: TaskStatus;
  note?: string;
}

export interface FormField {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "date" | "number";
  required: boolean;
  options?: string[];
  hint?: string;
}
