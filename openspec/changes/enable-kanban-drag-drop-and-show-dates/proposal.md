## Why

当前任务看板模块的 WBS 任务卡片无法通过拖拽交互改变任务状态，同时卡片上缺少阶段和起止时间信息，导致用户需要进入详情页才能查看这些关键信息，影响了项目管理的效率。

## What Changes

1. **修复拖拽更新状态功能** - 修复 KanbanBoard.tsx 中的拖拽逻辑，确保拖拽任务到不同列时能正确调用 API 更新状态
2. **卡片显示阶段信息** - 在任务卡片中增加显示 `level1Stage`（阶段）字段
3. **卡片显示起止时间** - 在任务卡片中增加显示 `plannedStartDate` 和 `plannedEndDate`（计划开始/结束时间）

## Capabilities

### New Capabilities
- `kanban-task-card-enhancement`: 增强任务看板的任务卡片显示信息和拖拽交互

### Modified Capabilities
- 无

## Impact

- **Frontend**: 修改 `frontend/src/features/kanban/KanbanBoard.tsx`
- **Backend**: 无需修改
- **API**: 无需修改
