## ADDED Requirements

### Requirement: Visual predecessor linking in quick decomposition
系统 MUST 提供基于任务名称或任务摘要的前置任务可视化选择能力，并在提交时转换为 `predecessorTaskIds` 存储。

#### Scenario: Select predecessors without typing IDs
- **WHEN** 用户在快速分解中为任务配置前置关系
- **THEN** 系统 MUST 允许用户通过选择器检索并勾选前置任务
- **THEN** 系统 MUST 在提交请求中写入对应任务 ID 列表而非名称文本

#### Scenario: Validate selected predecessor references
- **WHEN** 用户提交包含前置关系的分解记录
- **THEN** 系统 MUST 复用现有前置任务存在性与时间冲突校验
- **THEN** 若校验失败，系统 MUST 返回可定位到行与字段的冲突信息

### Requirement: Bidirectional dependency visibility
系统 MUST 在快速分解上下文中展示任务的紧前与紧后关系，帮助用户理解依赖影响。

#### Scenario: Show successor relation after linking predecessors
- **WHEN** 用户已为任务 A 选择任务 B 作为前置任务
- **THEN** 系统 MUST 在可视化信息中显示“A 的紧前包含 B”
- **THEN** 系统 MUST 在相应视图中显示“B 的紧后包含 A”

### Requirement: Compact field guidance by icon hover
系统 MUST 将关键字段填写说明以 icon 悬浮形式提供，并与错误校验提示分离显示。

#### Scenario: View guidance on demand
- **WHEN** 用户在快速分解中查看“一级阶段/工作包/任务名称/具体任务/交付物”等字段
- **THEN** 页面 MUST 通过 icon 悬浮展示填写说明与示例
- **THEN** 页面默认状态 MUST 不长时间占用大段说明区域
