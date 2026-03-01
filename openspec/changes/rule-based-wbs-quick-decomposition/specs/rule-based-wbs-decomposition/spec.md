## ADDED Requirements

### Requirement: Rule-based intent classification for quick decomposition
系统 MUST 支持将“我要做什么”输入文本按规则分类为预定义意图类型（至少包含新增、修复、优化、合规），并输出用于生成建议任务的意图结果。

#### Scenario: Classify valid quick intent text
- **WHEN** 用户输入“新增xx功能”并触发快速分解
- **THEN** 系统 MUST 将输入识别为“新增”意图
- **THEN** 系统 MUST 返回结构化分类结果供后续模板生成使用

#### Scenario: Handle unmatched text safely
- **WHEN** 用户输入未命中规则的自由文本
- **THEN** 系统 MUST 回退到默认意图模板或提示用户补充关键词
- **THEN** 系统 MUST 保证返回结果可继续进入人工编辑流程

### Requirement: Template-driven suggestion row generation
系统 MUST 基于意图分类结果按模板生成 WBS 建议分解行，建议行至少包含一级阶段、二级工作包、任务名称、具体任务、交付物字段。

#### Scenario: Generate suggestions for feature-add intent
- **WHEN** 意图分类结果为“新增”
- **THEN** 系统 MUST 生成覆盖规划、执行、验收阶段的建议分解行集合
- **THEN** 每条建议行 MUST 可直接映射到现有 WBS 批量录入字段结构

#### Scenario: User edits generated suggestion rows
- **WHEN** 系统已生成建议分解行并展示在快速分解列表
- **THEN** 用户 MUST 能在提交前编辑或删除任意建议行
- **THEN** 编辑后的结果 MUST 复用现有批量校验与批量提交流程
