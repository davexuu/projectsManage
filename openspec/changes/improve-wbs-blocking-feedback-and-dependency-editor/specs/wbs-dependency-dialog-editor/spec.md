## ADDED Requirements

### Requirement: Draft dependency editing MUST use row action and modal
系统 MUST 将草稿依赖编辑从表格单元格多选改为“行内按钮 -> 弹窗编辑”。

#### Scenario: Open dependency editor from draft row
- **WHEN** 用户在草稿行点击“编辑依赖”
- **THEN** 系统 MUST 打开依赖编辑弹窗并加载该行当前紧前任务
- **THEN** 弹窗 MUST 支持按任务名称搜索和多选

### Requirement: Dependency editor MUST persist and reflect successors after save
依赖弹窗保存后，系统 MUST 正确回写紧前任务，并实时反推紧后关系展示。

#### Scenario: Save dependency changes
- **WHEN** 用户在依赖弹窗中调整紧前任务并点击保存
- **THEN** 系统 MUST 将选择结果回写到对应草稿行
- **THEN** 系统 MUST 更新该行及相关行的紧后任务展示

### Requirement: Dependency conflicts MUST provide row-level actionable feedback
草稿转入分解列表前，系统 MUST 对依赖冲突提供行级可操作提示。

#### Scenario: Dependency conflict found before adding to list
- **WHEN** 用户批量加入分解列表时存在自依赖、环依赖或时间冲突
- **THEN** 系统 MUST 拒绝冲突行加入并保留草稿
- **THEN** 系统 MUST 提示具体草稿行和冲突原因，指导用户回到依赖编辑弹窗修复
