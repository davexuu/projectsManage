## 1. Backend Status Update API

- [x] 1.1 在 `backend/src/services/validators.ts` 增加 WBS 状态更新专用 Zod schema（最少包含 `projectId` 和 `currentStatus`）
- [x] 1.2 在 `backend/src/services/store.ts` 增加 WBS 状态专用更新方法（仅更新 `currentStatus`，保留现有权限/项目约束前提）
- [x] 1.3 在 `backend/src/modules/wbs/router.ts` 新增 `PATCH /wbs/:id/status` 路由并接入权限校验与 schema 校验
- [x] 1.4 确认接口错误信息在状态非法、权限不足、任务不存在时返回可读中文提示

## 2. Frontend Kanban Drag-and-Drop Persistence

- [x] 2.1 在 `frontend/src/api/client.ts` 增加 `updateWbsStatus`（或等效）API 方法，调用新的状态专用接口
- [x] 2.2 修改 `frontend/src/features/kanban/KanbanBoard.tsx` 的 `moveTask` 逻辑，改用状态专用接口替代全量 `api.update('wbs', ...)`
- [x] 2.3 保持并验证拖拽乐观更新行为：请求成功保留目标列状态，请求失败回滚并提示错误
- [x] 2.4 补充拖拽边界处理（无 `draggingId`、拖到同列、不存在任务卡片时不触发更新）

## 3. Task Card Field Display Consistency

- [x] 3.1 检查 `KanbanBoard` 任务卡片中阶段字段展示是否稳定使用 `level1Stage`，为空时显示占位值
- [x] 3.2 检查计划起止时间展示格式与空值占位规则（双空、单边空、双边有值）符合 spec
- [x] 3.3 如后端列表返回字段与前端预期不一致，补齐 `wbs` 列表接口返回字段映射或前端兼容处理

## 4. Verification

- [ ] 4.1 手工验证：将任务从“未开始”拖到“进行中/延期/已完成”时状态列计数与卡片位置正确更新
- [ ] 4.2 手工验证：接口失败场景下卡片回滚且出现错误提示（可通过临时断网/模拟错误）
- [ ] 4.3 手工验证：卡片持续显示阶段、工作包、计划起止时间与责任人信息
- [x] 4.4 运行构建检查：`cd backend && npm run build` 与 `cd frontend && npm run build`
