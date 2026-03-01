## Context

任务看板位于 `frontend/src/features/kanban/KanbanBoard.tsx`，使用原生 HTML5 拖拽 API 实现列间任务移动。当前状态：
- 任务卡片显示：taskName, level2WorkPackage, taskOwner
- 缺少显示：level1Stage（阶段）, plannedStartDate, plannedEndDate
- 拖拽功能代码存在但可能未生效

## Goals / Non-Goals

**Goals:**
1. 修复拖拽任务到不同列时能正确调用 API 更新状态
2. 在任务卡片上增加显示阶段（level1Stage）
3. 在任务卡片上增加显示计划开始/结束时间

**Non-Goals:**
- 不修改后端 API
- 不新增数据库字段
- 不修改任务详情页面

## Decisions

### D1: 使用原生 HTML5 拖拽 API
- **Decision**: 继续使用现有的原生 HTML5 drag-and-drop API
- **Rationale**: 当前项目已使用原生 API，无需引入 @dnd-kit 等外部依赖
- **Alternative**: 考虑使用 @dnd-kit 但会增加依赖和复杂度

### D2: 在 WbsTaskRow 接口中增加缺失字段
- **Decision**: 在前端 interface 中添加 level1Stage, plannedStartDate, plannedEndDate
- **Rationale**: TypeScript 需要类型支持，且后端已返回这些字段

### D3: 时间显示格式
- **Decision**: 使用 "YYYY-MM-DD" 格式显示日期
- **Rationale**: 节省卡片空间，保留关键日期信息

## Risks / Trade-offs

- **Risk**: 拖拽 API 调用失败但前端状态已更新 → **Mitigation**: 在 catch 中回滚状态并显示错误信息（代码已实现）
- **Risk**: 日期字段为空时显示 "undefined" → **Mitigation**: 使用 "待定" 或 "-" 替代
