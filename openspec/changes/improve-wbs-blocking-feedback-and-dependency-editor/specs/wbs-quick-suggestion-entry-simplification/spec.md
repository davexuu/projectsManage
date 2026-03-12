## ADDED Requirements

### Requirement: Quick suggestion entry MUST remove manual target-stage selector
快速建议入口 MUST 移除“当前阶段”手动选择控件，避免用户误解阶段约束语义。

#### Scenario: Open quick suggestion entry
- **WHEN** 用户打开 WBS 快速分解弹窗
- **THEN** 快速建议区 MUST 不展示“当前阶段”下拉
- **THEN** 快速建议区 MUST 保留建议档位和一句话输入入口

### Requirement: Suggestion strategy explanation MUST be explicit
系统 MUST 在建议入口清晰说明各档位策略，特别是标准档的“优先当前阶段，不足补邻近阶段”规则。

#### Scenario: User selects standard mode
- **WHEN** 用户选择标准档并准备生成建议
- **THEN** 界面 MUST 明确展示标准档策略说明
- **THEN** 用户 MUST 能理解建议可能包含邻近阶段任务
