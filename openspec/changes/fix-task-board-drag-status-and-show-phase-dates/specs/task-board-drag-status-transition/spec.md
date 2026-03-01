## ADDED Requirements

### Requirement: Kanban task cards can change WBS status by drag-and-drop
任务看板 SHALL 允许用户将任务卡片拖拽到目标状态列，并在释放后将该任务的 `currentStatus` 更新为目标列状态。

#### Scenario: Drag card to a different status column
- **WHEN** 用户将一个任务卡片从原状态列拖拽并释放到另一个状态列
- **THEN** 任务卡片 SHALL 出现在目标状态列中
- **THEN** 系统 SHALL 发起该任务状态持久化请求

#### Scenario: Drop card into the same status column
- **WHEN** 用户将任务卡片拖拽并释放到与当前状态相同的列
- **THEN** 系统 SHALL 不发起状态更新请求
- **THEN** 任务卡片位置和状态 SHALL 保持不变

### Requirement: Kanban status change persistence failure is recoverable
当拖拽触发的状态更新请求失败时，任务看板 SHALL 回滚任务卡片到拖拽前状态，并向用户显示错误提示。

#### Scenario: API request fails during status update
- **WHEN** 用户拖拽任务卡片到目标状态列后，状态更新请求返回错误
- **THEN** 系统 SHALL 将任务卡片恢复到原状态列
- **THEN** 系统 SHALL 显示可读错误信息

#### Scenario: API request succeeds during status update
- **WHEN** 用户拖拽任务卡片到目标状态列后，状态更新请求成功
- **THEN** 系统 SHALL 保持任务卡片在目标状态列
- **THEN** 系统 SHALL 显示成功反馈或等效的已完成提示

