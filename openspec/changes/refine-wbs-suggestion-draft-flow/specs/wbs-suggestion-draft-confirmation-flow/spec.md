## ADDED Requirements

### Requirement: Suggestion results must enter draft area first
系统 MUST 在“生成建议”后将结果写入建议草稿区，而不是直接写入分解任务列表。

#### Scenario: Generate suggestions from quick prompt
- **WHEN** 用户输入一句话并点击“生成建议”
- **THEN** 系统 MUST 在草稿区展示建议行
- **THEN** 系统 MUST 不自动将建议行加入已确认分解列表

### Requirement: Draft rows require explicit confirmation before listing
系统 MUST 提供“批量加入分解列表”确认动作，只有通过该动作的草稿行才能进入已确认列表。

#### Scenario: Confirm draft rows into list
- **WHEN** 用户在草稿区勾选若干行并点击“批量加入分解列表”
- **THEN** 系统 MUST 仅将被确认且通过校验的草稿行加入分解列表
- **THEN** 系统 MUST 将未通过校验的草稿行保留在草稿区并给出定位提示
