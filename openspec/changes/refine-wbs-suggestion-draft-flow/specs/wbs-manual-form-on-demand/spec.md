## ADDED Requirements

### Requirement: Manual form must be collapsed by default in quick decomposition
系统 MUST 在快速分解中将完整手动表单默认折叠，减少主路径干扰。

#### Scenario: Open quick decomposition modal
- **WHEN** 用户首次打开快速分解弹窗
- **THEN** 系统 MUST 默认展示快速生成与草稿区主路径
- **THEN** 系统 MUST 将完整手动填写区域保持折叠

### Requirement: Manual form must remain available on demand
系统 MUST 提供展开/收起手动表单能力，支持用户在规则建议不足时手动补录。

#### Scenario: Expand manual form for custom entry
- **WHEN** 用户点击“展开手动填写”
- **THEN** 系统 MUST 展示完整手动字段
- **THEN** 用户手动新增内容 MUST 可加入同一分解列表并参与相同校验流程
