## ADDED Requirements

### Requirement: Stage filter MUST use direct-select buttons
系统 MUST 在计划编排工作台使用按钮式阶段筛选，支持用户一键切换筛选状态。

#### Scenario: Render stage filter controls
- **WHEN** 用户进入计划编排工作台
- **THEN** 系统 MUST 展示“全部、启动、规划、执行、验收”可直接点选的阶段按钮
- **THEN** 系统 MUST 高亮当前生效的阶段筛选值

#### Scenario: Switch stage by clicking button
- **WHEN** 用户点击任一阶段按钮
- **THEN** 系统 MUST 立即更新阶段筛选状态
- **THEN** 系统 MUST 同步刷新 WBS 列表、里程碑列表与甘特图

### Requirement: Time range placeholder MUST be Chinese
系统 MUST 为时间范围控件提供中文占位文案，避免中英文混用。

#### Scenario: Show empty time range picker
- **WHEN** 用户未选择时间范围
- **THEN** 系统 MUST 显示中文占位文案（如“开始日期”“结束日期”）
- **THEN** 占位文案 MUST 在规划工作台上下文保持一致

### Requirement: Planning table dates MUST be formatted as YYYY-MM-DD
系统 MUST 将计划编排工作台内表格日期展示统一为 `YYYY-MM-DD`。

#### Scenario: Render WBS date fields
- **WHEN** 系统渲染 WBS 列表中的计划开始与计划完成字段
- **THEN** 日期值 MUST 以 `YYYY-MM-DD` 格式展示
- **THEN** 系统 MUST NOT 在该表格中显示时分秒

#### Scenario: Render milestone date fields
- **WHEN** 系统渲染里程碑列表中的计划完成字段
- **THEN** 日期值 MUST 以 `YYYY-MM-DD` 格式展示
- **THEN** 系统 MUST 与时间线日期展示保持一致格式
