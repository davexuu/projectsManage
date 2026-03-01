## Why

当前系统将图表与业务模块分散在多个一级菜单中，且大量页面依赖“先选项目”才能继续，导致路径冗长、上下文割裂、点击成本高。现在需要在不牺牲主操作可见性的前提下，建立以项目过程为中心且可快速穿透问题明细的统一体验。

## What Changes

- 新增独立的 `Mission Control` 页面作为项目空间首页，集中展示关键态势与高频操作入口。
- 将项目空间主导航重组为 5 大过程：启动、规划、执行、监控、收尾，并保持主导航稳定可见。
- 为关键 KPI 建立统一“指标穿透”交互：从指标卡一键进入带筛选条件的明细视图，并保留上下文状态。
- 新增周报/月报在项目空间内的统一入口与状态提示，支持由项目数据驱动的报告草拟入口。
- 统一交互约束：不使用长动画、不引入复杂 3D、不隐藏主操作，以减少点击与减少操作步骤为首要目标。

## Capabilities

### New Capabilities

- `mission-control-workspace`: 定义独立 Mission Control 页面的信息结构、核心模块与项目级入口规则。
- `process-group-navigation`: 定义基于 5 大过程的项目空间导航模型与页面归属规则。
- `kpi-drilldown`: 定义 KPI 指标卡的可穿透行为、明细承接方式、筛选上下文继承与返回策略。
- `project-report-hub`: 定义周报/月报在项目空间中的入口、状态展示与数据预填联动规则。

### Modified Capabilities

- None.

## Impact

- 前端路由与导航结构：`frontend/src/App.tsx` 及相关页面入口映射。
- 前端总览与图表承接组件：`frontend/src/features/dashboard/*`、`frontend/src/features/charts/*`、`frontend/src/features/module/*`。
- 前端交互状态管理：项目上下文、筛选条件继承、穿透返回路径、快捷入口状态。
- 后端聚合与明细接口可能需要扩展（尤其是周报/月报入口所需的聚合数据与查询条件）。
- OpenSpec 新增多个 capability spec 文件，作为后续 design/tasks 的约束基础。
