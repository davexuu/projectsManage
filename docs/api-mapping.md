# Excel 到 API 字段映射（第一版）

## 1) 01_项目立项卡 -> /api/projects

- `项目名称` -> `projectName`
- `项目类型` -> `projectType`
- `所属年度` -> `year`
- `牵头所室` -> `leadDepartment`
- `项目负责人` -> `projectOwner`
- `参与人员` -> `participants`
- `项目背景与必要性` -> `background`
- `项目目标` -> `goal`
- `建设内容范围` -> `scope`
- `预期成果` -> `expectedOutcome`

## 2) 03_WBS任务分解 -> /api/wbs

- `一级阶段` -> `level1Stage`
- `二级工作包` -> `level2WorkPackage`
- `任务名称` -> `taskName`
- `具体任务` -> `taskDetail`
- `交付物` -> `deliverable`
- `任务责任人` -> `taskOwner`
- `计划开始时间` -> `plannedStartDate`
- `计划完成时间` -> `plannedEndDate`
- `当前状态` -> `currentStatus`
- `是否关键任务` -> `isCritical`
- `风险点说明` -> `riskHint`
- `关联总表任务` -> `linkedMasterTask`

## 3) 04_里程碑计划 -> /api/milestones

- `里程碑编号` -> `milestoneCode`
- `里程碑名称` -> `milestoneName`
- `一级阶段` -> `level1Stage`
- `对应工作包` -> `relatedWorkPackage`
- `关键成果` -> `keyOutcome`
- `完成判定标准` -> `doneCriteria`
- `计划完成时间` -> `plannedFinishDate`
- `实际完成时间` -> `actualFinishDate`
- `责任人` -> `owner`
- `当前状态` -> `currentStatus`
- `备注` -> `note`

## 4) 06_推进记录 -> /api/progress-records

- `统计周期` -> `statPeriod`
- `当前阶段` -> `currentStage`
- `对应里程碑` -> `milestoneCode`
- `本期完成工作` -> `finishedWork`
- `当前整体进度(%)` -> `overallProgressPct`
- `存在问题与风险` -> `issuesAndRisks`
- `需协调事项` -> `needsCoordination`
- `下阶段计划` -> `nextPlan`
- `记录人` -> `recorder`
- `记录时间` -> `recordDate`

## 5) 08_项目状态评估 -> /api/status-assessments

- `评估周期` -> `evalPeriod`
- `当前阶段` -> `currentStage`
- `整体状态` -> `overallStatus`
- `进度状态` -> `scheduleStatus`
- `质量状态` -> `qualityStatus`
- `风险状态` -> `riskStatus`
- `状态判定依据` -> `assessmentBasis`
- `需关注事项` -> `watchItems`
- `评估人` -> `assessor`
- `评估时间` -> `assessmentDate`

## 6) 09_风险问题台账 -> /api/risks

- `问题/风险编号` -> `riskCode`
- `类型` -> `riskType`
- `所处阶段` -> `stage`
- `问题/风险描述` -> `description`
- `影响范围/程度` -> `impactLevel`
- `应对措施` -> `mitigationPlan`
- `责任人` -> `owner`
- `计划解决时间` -> `plannedResolveDate`
- `当前状态` -> `currentStatus`
- `实际解决时间` -> `actualResolveDate`
- `是否升级管理关注` -> `escalateToManagement`
- `关联里程碑 / WBS` -> `linkedMilestoneOrTask`
- `备注` -> `note`

## 7) 10_变更申请 -> /api/changes

- `变更编号` -> `changeCode`
- `变更类型` -> `changeType`
- `变更提出日期` -> `requestDate`
- `变更提出人` -> `requester`
- `变更原因` -> `reason`
- `变更前内容` -> `beforeContent`
- `变更后内容` -> `afterContent`
- `变更影响分析` -> `impactAnalysis`
- `是否影响里程碑 / WBS` -> `impactsMilestoneOrWbs`
- `变更评估结论` -> `evaluationConclusion`
- `批准人` -> `approver`
- `批准日期` -> `approvalDate`
- `当前状态` -> `currentStatus`
- `备注` -> `note`
