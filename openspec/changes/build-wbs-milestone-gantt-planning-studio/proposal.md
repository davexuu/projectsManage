## Why

当前系统虽然已支持 WBS 录入、里程碑维护和甘特图查看，但三者分散在不同入口，用户无法在同一工作流中完成“任务分解-里程碑编排-计划可视化”。这导致录入效率不稳定、计划一致性难以保证，且无法快速发现排期冲突与里程碑支撑不足问题。

## What Changes

- 新增“计划编排工作台”，在同一页面提供 WBS 快速分解、里程碑计划与甘特图联动展示。
- 为 WBS 引入结构化计划能力：层级编码、父子关系、任务依赖、里程碑关联。
- 增强 WBS 批量录入流程：上下文固定、行级继承、复制/连续新增、批量提交前冲突校验。
- 提供计划一致性校验与提示：日期先后冲突、依赖环、里程碑缺少支撑任务、跨阶段排期异常。
- 统一计划视图交互：筛选器、阶段泳道、图例、只读/编辑切换、列表与图表双向定位。

## Capabilities

### New Capabilities
- `planning-studio-workspace`: 提供项目级计划编排工作台，整合 WBS、里程碑、甘特图与统一筛选。
- `wbs-hierarchy-dependency-model`: 定义 WBS 层级与依赖关系的创建、编辑、校验和展示规则。
- `milestone-gantt-integration`: 定义里程碑与 WBS 在甘特图中的统一呈现、联动过滤与一致性校验。

### Modified Capabilities
- 无

## Impact

- 前端：`frontend/src/features/module/ModuleRoute.tsx`、`frontend/src/components/DynamicForm.tsx`、`frontend/src/features/charts/GanttChart.tsx` 及新增工作台页面。
- 后端：`backend/src/services/validators.ts`、`backend/src/services/store.ts`、`backend/src/modules/wbs/router.ts`、`backend/src/modules/milestones/router.ts` 需支持扩展字段与批量/校验逻辑。
- 数据模型：`backend/prisma/schema.prisma` 中 `WbsTask` 与 `Milestone` 需扩展结构化关联字段并新增索引。
- API：WBS 与里程碑查询/写入契约将扩展，需保持现有入口兼容或提供迁移策略。
