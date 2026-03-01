## ADDED Requirements

### Requirement: Unified planning studio entry
系统 MUST 提供项目级统一入口，用于在同一页面完成 WBS 分解、里程碑编排与甘特图查看，并共享同一筛选上下文。

#### Scenario: Open planning studio with project selected
- **WHEN** 用户从项目空间进入计划编排工作台且已选择项目
- **THEN** 系统 MUST 在同一页面展示 WBS、里程碑、甘特图三个视图区域
- **THEN** 系统 MUST 自动带入该项目作为统一上下文

#### Scenario: Change shared filters in studio
- **WHEN** 用户在工作台修改阶段或时间范围筛选
- **THEN** 系统 MUST 同步刷新 WBS 列表、里程碑列表与甘特图数据
- **THEN** 系统 MUST 保持筛选条件在当前会话内可见且一致

### Requirement: Fast WBS decomposition in studio
系统 MUST 支持在工作台内进行快速 WBS 分解录入，包含上下文固定、行复制、连续新增和批量提交。

#### Scenario: Add multiple rows quickly
- **WHEN** 用户在 WBS 明细区连续输入多条分解项
- **THEN** 系统 MUST 支持将当前行加入待提交列表并继续输入下一行
- **THEN** 系统 MUST 对可继承字段自动带入默认值

#### Scenario: Submit batch with validation errors
- **WHEN** 用户批量提交的分解项包含校验错误
- **THEN** 系统 MUST 阻止提交并展示错误摘要
- **THEN** 系统 MUST 提供行级与字段级错误定位且保留已输入数据

### Requirement: Cross-view navigation consistency
系统 MUST 支持列表与图表双向定位，帮助用户快速定位计划项。

#### Scenario: Locate record from gantt chart
- **WHEN** 用户点击甘特图中的任务条或里程碑节点
- **THEN** 系统 MUST 高亮对应的数据行并滚动到可视区域
- **THEN** 系统 MUST 展示该项的关键元信息（状态、责任人、计划日期）
