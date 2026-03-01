## ADDED Requirements

### Requirement: Milestone-to-WBS structured linking
系统 MUST 支持里程碑与 WBS 任务的结构化关联，用于计划跟踪与展示一致性校验。

#### Scenario: Link milestone to supporting tasks
- **WHEN** 用户为里程碑选择一个或多个支撑任务
- **THEN** 系统 MUST 保存里程碑与任务的关联关系
- **THEN** 系统 MUST 在查询里程碑详情时返回关联任务摘要

#### Scenario: Validate milestone without supporting tasks
- **WHEN** 里程碑处于进行中或已完成状态但无支撑任务关联
- **THEN** 系统 MUST 返回一致性告警信息
- **THEN** 系统 MUST 在工作台中提示用户补全关联

### Requirement: Unified gantt rendering for tasks and milestones
系统 MUST 在甘特图中统一渲染 WBS 任务与里程碑，并支持筛选联动与状态样式区分。

#### Scenario: Render combined plan timeline
- **WHEN** 用户打开甘特图视图
- **THEN** 系统 MUST 同时显示任务条与里程碑节点
- **THEN** 系统 MUST 使用可区分样式表达任务状态与关键任务标识

#### Scenario: Apply stage filter in gantt
- **WHEN** 用户在工作台选择阶段筛选
- **THEN** 甘特图 MUST 仅展示匹配阶段的任务与里程碑
- **THEN** 甘特图与列表视图的过滤结果 MUST 保持一致

### Requirement: Plan consistency checks for schedule conflicts
系统 MUST 对计划时间一致性执行校验，至少覆盖任务日期冲突与依赖时间冲突。

#### Scenario: Detect task date inversion
- **WHEN** 任务计划完成时间早于计划开始时间
- **THEN** 系统 MUST 阻止保存并返回字段级错误

#### Scenario: Detect dependency date conflict
- **WHEN** 后继任务计划开始时间早于其前置任务计划完成时间
- **THEN** 系统 MUST 返回依赖冲突告警
- **THEN** 系统 MUST 标记相关任务供用户快速定位
