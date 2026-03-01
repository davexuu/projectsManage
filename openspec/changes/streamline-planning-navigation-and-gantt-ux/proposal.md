## Why

当前“计划编排工作台”与“规划过程”并行暴露，形成重复入口，用户需要在多个页面间判断“该去哪录入与排程”。同时，规划页交互细节存在理解成本：阶段筛选效率偏低、时间占位文案不一致、日期展示格式不统一、甘特依赖线语义不直观，影响排程决策效率。

## What Changes

- 调整导航信息架构：将“计划编排工作台”收敛到“规划过程”主入口下，作为规划阶段默认入口。
- 移除开发期“兼容入口”菜单，不再保留旧入口双轨并行。
- 优化工作台筛选交互：阶段筛选从下拉改为按钮组单击切换。
- 统一时间控件文案：时间范围占位符改为中文。
- 统一规划表格日期展示格式为 `YYYY-MM-DD`。
- 强化甘特图依赖线可理解性：补充依赖线语义说明与可见提示，降低误解。

## Capabilities

### New Capabilities
- `planning-navigation-convergence`: 规范规划阶段导航收敛策略，定义“计划编排工作台”作为规划主入口及菜单归位规则。
- `planning-studio-filter-and-date-ux`: 规范计划编排工作台的阶段筛选交互、时间占位文案与日期格式一致性。
- `gantt-dependency-clarity`: 规范甘特图依赖线语义提示与交互反馈，确保用户可理解前后置关系。

### Modified Capabilities
- 无

## Impact

- 前端导航与路由：`frontend/src/App.tsx`、`frontend/src/features/process/navigation-config.ts`、`frontend/src/features/process/ProcessWorkspace.tsx`。
- 计划编排页面：`frontend/src/features/planning/PlanningStudio.tsx`。
- 甘特图组件与样式：`frontend/src/features/charts/GanttChart.tsx`、`frontend/src/styles.css`。
- 回归范围：规划流程入口可达性、筛选联动、日期呈现一致性、甘特依赖线理解与提示。
