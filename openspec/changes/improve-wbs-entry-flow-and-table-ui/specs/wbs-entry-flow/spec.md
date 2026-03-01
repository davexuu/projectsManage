## ADDED Requirements

### Requirement: Project-context-first WBS entry flow
系统 MUST 在创建 WBS 分解记录时先建立项目上下文（如项目、版本/迭代、时间范围等），并在同一流程中将“基础信息”和“分解项明细”分区展示，减少用户在字段间来回切换。

#### Scenario: Open create form for a specific project
- **WHEN** 用户从某个项目进入 WBS 新增流程
- **THEN** 系统 MUST 预填该项目信息并将其作为当前上下文
- **THEN** 系统 MUST 先展示基础信息区，再展示分解项明细区

#### Scenario: Open create form without project preselection
- **WHEN** 用户从通用入口进入 WBS 新增流程且未指定项目
- **THEN** 系统 MUST 要求用户先完成项目上下文的关键字段选择
- **THEN** 在关键上下文未完成前，系统 MUST 禁止提交分解项数据

### Requirement: Batch row editing for decomposition items
系统 MUST 支持在分解项区域以表格方式进行多行录入，并支持新增行、复制行、删除行，以便连续输入多条 WBS 分解项。

#### Scenario: Add multiple decomposition rows continuously
- **WHEN** 用户在分解项表格中连续录入多条任务分解项
- **THEN** 系统 MUST 允许用户通过新增行操作持续添加记录
- **THEN** 系统 MUST 在同一表格中保留未提交行的编辑状态

#### Scenario: Copy an existing row as a template
- **WHEN** 用户对某一条分解项执行复制操作
- **THEN** 系统 MUST 创建一条新行并复制允许继承的字段值
- **THEN** 系统 MUST 为新行保留可编辑状态以便用户修改差异字段

### Requirement: Default value inheritance for repeated inputs
系统 SHALL 对可继承字段提供默认值继承能力，以减少重复输入；继承范围 MUST 可控且不得覆盖用户已手动修改的值。

#### Scenario: Inherit shared values when adding next row
- **WHEN** 用户新增下一条分解项且上一条存在可继承字段值
- **THEN** 系统 SHALL 自动带入配置允许继承的字段默认值
- **THEN** 系统 MUST 不覆盖用户在当前新行已输入的字段

### Requirement: Submission validation with row-level error targeting
系统 MUST 在提交前执行分解项与基础信息校验，并提供字段级/行级错误定位能力，帮助用户快速修正问题。

#### Scenario: Submit with invalid decomposition rows
- **WHEN** 用户提交包含缺失必填项或格式错误的分解项表格
- **THEN** 系统 MUST 显示错误摘要并指出错误所在行与字段
- **THEN** 系统 MUST 保留用户已输入内容，避免因校验失败丢失数据

