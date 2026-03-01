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

export interface ProjectAttachment {
  id: string;
  projectId: string;
  category: string;
  fileName: string;
  objectKey: string;
  mimeType?: string;
  fileSize: string;
  uploaderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WbsTask extends BaseEntity {
  wbsCode?: string;
  parentTaskId?: string;
  predecessorTaskIds?: string[];
  milestoneId?: string;
  sortOrder?: number;
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

export type WbsQuickIntent = "新增" | "修复" | "优化" | "合规";
export type WbsSuggestionMode = "light" | "standard" | "complete";

export interface WbsQuickSuggestionResult {
  intent: WbsQuickIntent;
  mode: WbsSuggestionMode;
  targetStage: Stage;
  normalizedPrompt: string;
  reason: string;
  items: Array<Omit<WbsTask, "id" | "createdAt" | "updatedAt">>;
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
  linkWarning?: string;
  linkedTaskSummaries?: Array<{
    id: string;
    taskName: string;
    wbsCode?: string;
    currentStatus: TaskStatus;
  }>;
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

export interface ProjectReport extends BaseEntity {
  reportType: "WEEKLY" | "MONTHLY";
  period: string;
  status: "DRAFT" | "SUBMITTED";
  content: string;
  sourceSnapshot?: unknown;
}

export interface FormField {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "date" | "number";
  required: boolean;
  options?: string[];
  hint?: string;
  priority?: "core" | "recommended" | "optional" | "auto";
  placeholder?: string;
  helpText?: string;
  example?: string;
  section?: "context" | "detail" | "advanced";
  visibleWhen?: {
    key: string;
    equals?: string;
    notEquals?: string;
    isTruthy?: boolean;
  };
  defaultValueResolver?: "selectedProjectId" | "previousRow";
  inheritable?: boolean;
  readonly?: boolean;
}
