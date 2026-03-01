## ADDED Requirements

### Requirement: Standard suggestion mode must be stage-aware
系统 MUST 在标准档位下按当前阶段生成建议任务，默认不跨完整生命周期展开。

#### Scenario: Generate in standard mode for planning stage
- **WHEN** 用户选择标准档位且当前阶段为“规划”
- **THEN** 系统 MUST 生成以规划阶段为主的建议任务集合
- **THEN** 建议条目数量 MUST 控制在可快速确认的范围（如 2-4 条）

### Requirement: Suggestion depth mode must be selectable
系统 MUST 支持轻量/标准/完整档位切换，不同档位控制建议覆盖范围。

#### Scenario: Switch from standard to complete mode
- **WHEN** 用户将档位从标准切换为完整
- **THEN** 系统 MUST 按完整档位规则重新生成建议
- **THEN** 系统 MUST 明确提示不同档位的生成范围差异
