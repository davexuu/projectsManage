## ADDED Requirements

### Requirement: Field priority classification for create/edit forms
系统 MUST 为 WBS 新增/编辑表单字段定义优先级分类（必填、建议填写、可选、自动生成/自动推导），并基于分类控制默认展示与交互策略。

#### Scenario: Render form with mixed field priorities
- **WHEN** 页面加载包含不同优先级字段的 WBS 表单配置
- **THEN** 系统 MUST 默认突出显示必填字段与建议字段
- **THEN** 系统 MUST 将可选字段放入“更多字段”区域或等效折叠区域

### Requirement: Inline entry guidance for key fields
系统 MUST 为关键字段提供填写要求说明，包括用途说明、格式限制或填写示例；说明文案 SHOULD 在输入前可见或易于展开查看。

#### Scenario: User focuses a key field with formatting constraints
- **WHEN** 用户进入具有格式或业务约束的关键字段
- **THEN** 系统 MUST 展示该字段的填写要求或示例
- **THEN** 说明内容 MUST 与该字段当前业务规则保持一致

### Requirement: Configurable field metadata for labels and guidance
系统 SHALL 支持通过字段元数据配置控制标签、占位文案、帮助文本、示例、校验规则与条件显示逻辑，以避免在页面模板中硬编码这些规则。

#### Scenario: Change guidance text by configuration
- **WHEN** 管理者或开发者更新某字段的配置化帮助文案与示例
- **THEN** 系统 SHALL 在不修改页面结构代码的情况下渲染新文案
- **THEN** 同一字段在新增与编辑场景中的展示规则 MUST 保持一致（除非配置显式区分）

### Requirement: Separated guidance and validation messaging
系统 MUST 区分“填写要求提示”和“校验错误提示”，前者用于指导输入，后者用于说明错误原因与修正方向。

#### Scenario: Invalid input after guidance is shown
- **WHEN** 用户已看到字段填写要求但仍输入不符合规则的值
- **THEN** 系统 MUST 显示独立的错误提示文案说明失败原因
- **THEN** 系统 MUST 保留原有填写要求提示或提供可再次查看入口

### Requirement: Optional field reduction without data-model breakage
系统 MUST 支持将原新增记录中的非必要字段降级为可选或自动推导，而不破坏现有接口兼容性与已保存数据的展示。

#### Scenario: Submit form without downgraded optional fields
- **WHEN** 用户未填写被降级为可选的字段并提交 WBS 记录
- **THEN** 系统 MUST 允许提交（前提是所有必填字段均有效）
- **THEN** 系统 MUST 使用空值、默认值或推导值与现有接口字段映射兼容

