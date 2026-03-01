## Why

当前“快速分解WBS”录入表单字段负担较重，且关键字段依赖 PMP 术语理解，导致用户常常只能输入“新增xx功能”这类高层描述，难以稳定拆成可执行任务。与此同时，WBS 编码仍需手工维护、前置关系需手填 ID，录入效率低且错误率高，已经成为计划编排落地的主要瓶颈。

## What Changes

- 在计划编排工作台的“快速分解WBS”中新增“我要做什么”单句输入入口，基于规则引擎自动生成 WBS 建议分解行。
- 新增规则驱动的任务拆解能力：按意图分类（新增/修复/优化/合规）+ 模板生成阶段、工作包、任务名称、具体任务、交付物草稿。
- 新增 WBS 编码自动生成机制，前端默认只读展示编码，不再要求用户手工输入编码。
- 将关键字段说明改为 icon 悬浮提示，默认收敛大段说明文案，保持界面清爽。
- 将前置/后继关系操作从“手填 ID”升级为“按任务名称选择关联”，并在 UI 中同时展示紧前与紧后关系。
- 保留现有批量校验与提交流程（validate-plan + batch），将自动生成结果接入现有流程。

## Capabilities

### New Capabilities
- `rule-based-wbs-decomposition`: 提供基于规则引擎的单句意图识别与 WBS 建议行自动生成能力。
- `wbs-code-auto-generation`: 提供 WBS 编码自动生成与展示规则，支持批量录入场景下的稳定编号。
- `wbs-dependency-linking-ux`: 提供前置/后继任务的可视化关联操作与展示，不再依赖手填任务 ID。

### Modified Capabilities
- 无

## Impact

- 前端：`frontend/src/features/planning/PlanningStudio.tsx`、`frontend/src/components/DynamicForm.tsx`、相关样式与交互组件。
- 后端：`backend/src/services/store.ts`、`backend/src/services/validators.ts`、`backend/src/modules/wbs/router.ts`（若新增规则拆解接口）。
- 元数据：`backend/src/meta/formSchemas.ts` 中 WBS 字段展示与提示策略。
- API：可能新增“规则拆解预生成”接口；保留并复用现有 `/wbs/validate-plan` 与 `/wbs/batch`。
- 测试：补充快速分解流程回归（自动建议、依赖关联、编码展示、批量提交）。
