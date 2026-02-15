import { FormField } from "../domain/types.js";

const stageOptions = ["启动", "规划", "执行", "验收"];
const taskStatusOptions = ["未开始", "进行中", "已完成", "延期"];
const ynOptions = ["是", "否"];
const trafficLightOptions = ["绿", "黄", "红"];

export const formSchemas: Record<string, FormField[]> = {
  projects: [
    { key: "projectName", label: "项目名称", type: "text", required: true },
    { key: "projectType", label: "项目类型", type: "text", required: true },
    { key: "year", label: "所属年度", type: "number", required: true },
    { key: "leadDepartment", label: "牵头所室", type: "text", required: true },
    { key: "projectOwner", label: "项目负责人", type: "text", required: true },
    { key: "participants", label: "参与人员", type: "text", required: true },
    { key: "background", label: "项目背景与必要性", type: "textarea", required: false },
    { key: "goal", label: "项目目标", type: "textarea", required: false, hint: "建议 1 句总目标 + 可量化子目标" },
    { key: "scope", label: "建设内容范围", type: "textarea", required: false },
    { key: "expectedOutcome", label: "预期成果", type: "textarea", required: false }
  ],
  wbs: [
    { key: "projectId", label: "项目ID", type: "text", required: true },
    { key: "level1Stage", label: "一级阶段", type: "select", required: true, options: stageOptions },
    { key: "level2WorkPackage", label: "二级工作包", type: "text", required: true },
    { key: "taskName", label: "任务名称", type: "text", required: true, hint: "建议动词 + 对象，可判断完成与否" },
    { key: "taskDetail", label: "具体任务", type: "textarea", required: true },
    { key: "deliverable", label: "交付物", type: "text", required: true },
    { key: "taskOwner", label: "任务责任人", type: "text", required: true },
    { key: "plannedStartDate", label: "计划开始时间", type: "date", required: true },
    { key: "plannedEndDate", label: "计划完成时间", type: "date", required: true },
    { key: "currentStatus", label: "当前状态", type: "select", required: true, options: taskStatusOptions },
    { key: "isCritical", label: "是否关键任务", type: "select", required: true, options: ynOptions },
    { key: "riskHint", label: "风险点说明", type: "textarea", required: false },
    { key: "linkedMasterTask", label: "关联总表任务", type: "text", required: false }
  ],
  milestones: [
    { key: "projectId", label: "项目ID", type: "text", required: true },
    { key: "milestoneCode", label: "里程碑编号", type: "text", required: true },
    { key: "milestoneName", label: "里程碑名称", type: "text", required: true },
    { key: "level1Stage", label: "一级阶段", type: "select", required: true, options: stageOptions },
    { key: "relatedWorkPackage", label: "对应工作包", type: "text", required: true },
    { key: "keyOutcome", label: "关键成果", type: "text", required: true },
    { key: "doneCriteria", label: "完成判定标准", type: "textarea", required: true },
    { key: "plannedFinishDate", label: "计划完成时间", type: "date", required: true },
    { key: "actualFinishDate", label: "实际完成时间", type: "date", required: false },
    { key: "owner", label: "责任人", type: "text", required: true },
    { key: "currentStatus", label: "当前状态", type: "select", required: true, options: taskStatusOptions },
    { key: "note", label: "备注", type: "textarea", required: false }
  ],
  progressRecords: [
    { key: "projectId", label: "项目ID", type: "text", required: true },
    { key: "statPeriod", label: "统计周期", type: "date", required: true },
    { key: "currentStage", label: "当前阶段", type: "select", required: true, options: stageOptions },
    { key: "milestoneCode", label: "对应里程碑", type: "text", required: true },
    { key: "finishedWork", label: "本期完成工作", type: "textarea", required: true },
    { key: "overallProgressPct", label: "当前整体进度(%)", type: "number", required: true },
    { key: "issuesAndRisks", label: "存在问题与风险", type: "textarea", required: true },
    { key: "needsCoordination", label: "需协调事项", type: "textarea", required: true },
    { key: "nextPlan", label: "下阶段计划", type: "textarea", required: true },
    { key: "recorder", label: "记录人", type: "text", required: true },
    { key: "recordDate", label: "记录时间", type: "date", required: true }
  ],
  statusAssessments: [
    { key: "projectId", label: "项目ID", type: "text", required: true },
    { key: "evalPeriod", label: "评估周期", type: "date", required: true },
    { key: "currentStage", label: "当前阶段", type: "select", required: true, options: stageOptions },
    { key: "overallStatus", label: "整体状态", type: "select", required: true, options: trafficLightOptions },
    { key: "scheduleStatus", label: "进度状态", type: "select", required: true, options: trafficLightOptions },
    { key: "qualityStatus", label: "质量状态", type: "select", required: true, options: trafficLightOptions },
    { key: "riskStatus", label: "风险状态", type: "select", required: true, options: trafficLightOptions },
    { key: "assessmentBasis", label: "状态判定依据", type: "textarea", required: true },
    { key: "watchItems", label: "需关注事项", type: "textarea", required: true },
    { key: "assessor", label: "评估人", type: "text", required: true },
    { key: "assessmentDate", label: "评估时间", type: "date", required: true }
  ],
  risks: [
    { key: "projectId", label: "项目ID", type: "text", required: true },
    { key: "riskCode", label: "问题/风险编号", type: "text", required: true },
    { key: "riskType", label: "类型", type: "text", required: true },
    { key: "stage", label: "所处阶段", type: "select", required: true, options: stageOptions },
    { key: "description", label: "问题/风险描述", type: "textarea", required: true },
    { key: "impactLevel", label: "影响范围/程度", type: "text", required: true },
    { key: "mitigationPlan", label: "应对措施", type: "textarea", required: true },
    { key: "owner", label: "责任人", type: "text", required: true },
    { key: "plannedResolveDate", label: "计划解决时间", type: "date", required: true },
    { key: "currentStatus", label: "当前状态", type: "select", required: true, options: taskStatusOptions },
    { key: "actualResolveDate", label: "实际解决时间", type: "date", required: false },
    { key: "escalateToManagement", label: "是否升级管理关注", type: "select", required: true, options: ynOptions },
    { key: "linkedMilestoneOrTask", label: "关联里程碑 / WBS", type: "text", required: false },
    { key: "note", label: "备注", type: "textarea", required: false }
  ],
  changes: [
    { key: "projectId", label: "项目ID", type: "text", required: true },
    { key: "changeCode", label: "变更编号", type: "text", required: true },
    { key: "changeType", label: "变更类型", type: "text", required: true },
    { key: "requestDate", label: "变更提出日期", type: "date", required: true },
    { key: "requester", label: "变更提出人", type: "text", required: true },
    { key: "reason", label: "变更原因", type: "textarea", required: true },
    { key: "beforeContent", label: "变更前内容", type: "textarea", required: true },
    { key: "afterContent", label: "变更后内容", type: "textarea", required: true },
    { key: "impactAnalysis", label: "变更影响分析", type: "textarea", required: true },
    { key: "impactsMilestoneOrWbs", label: "是否影响里程碑 / WBS", type: "select", required: true, options: ynOptions },
    { key: "evaluationConclusion", label: "变更评估结论", type: "textarea", required: true },
    { key: "approver", label: "批准人", type: "text", required: false },
    { key: "approvalDate", label: "批准日期", type: "date", required: false },
    { key: "currentStatus", label: "当前状态", type: "select", required: true, options: taskStatusOptions },
    { key: "note", label: "备注", type: "textarea", required: false }
  ]
};
