## ADDED Requirements

### Requirement: Gantt dependency lines MUST expose explicit semantics
系统 MUST 在甘特图中明确说明依赖线表示“前置任务到后继任务”的关系，避免用户误读。

#### Scenario: Show dependency meaning in gantt legend/help
- **WHEN** 用户查看甘特图并存在任务依赖
- **THEN** 系统 MUST 提供依赖线语义说明（图例、提示或帮助文案）
- **THEN** 说明内容 MUST 明确“线条表示前置任务完成后后继任务才能开始”

#### Scenario: User focuses on a dependency-related task
- **WHEN** 用户点击或定位到带前置依赖的任务
- **THEN** 系统 MUST 保留依赖线可见性并提供可理解的反馈信息
- **THEN** 反馈信息 MUST 可帮助用户判断是否存在排期先后冲突

### Requirement: Dependency semantics MUST align with existing predecessor data
系统 MUST 保证依赖线展示与 `predecessorTaskIds` 数据语义一致。

#### Scenario: Render gantt with predecessorTaskIds
- **WHEN** 任务包含一个或多个 `predecessorTaskIds`
- **THEN** 系统 MUST 按前置任务关系渲染依赖线
- **THEN** 系统 MUST NOT 将无依赖关系的任务错误连线

#### Scenario: Render gantt without predecessorTaskIds
- **WHEN** 任务不存在前置依赖关系
- **THEN** 系统 MUST 不展示该任务的依赖连线
- **THEN** 系统 MUST 保持任务条与里程碑节点正常展示
