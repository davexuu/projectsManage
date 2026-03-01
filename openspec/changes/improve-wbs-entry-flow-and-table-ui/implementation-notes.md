## WBS Field Inventory (Task 1.1)

Current WBS fields are defined in `backend/src/meta/formSchemas.ts` and rendered by `frontend/src/features/module/ModuleRoute.tsx` + `frontend/src/components/DynamicForm.tsx`.

### Current WBS fields (source of truth)

1. `projectId` (required, interface-required, page context field)
2. `level1Stage` (required, select)
3. `level2WorkPackage` (required, text)
4. `taskName` (required, text)
5. `taskDetail` (required, textarea)
6. `deliverable` (required, text)
7. `taskOwner` (required, text/select after enhancement)
8. `plannedStartDate` (required, date)
9. `plannedEndDate` (required, date)
10. `currentStatus` (required, select)
11. `isCritical` (required, select)
12. `riskHint` (optional, textarea)
13. `linkedMasterTask` (optional, text)

### Enhanced field classification introduced in this change

- `auto`: `projectId`
- `core`: stage/work package/task name/task owner/start/end date
- `recommended`: task detail/deliverable/currentStatus/isCritical
- `optional`: riskHint/linkedMasterTask

## Reuse Entry Points (Task 1.3)

Confirmed reusable components / extension points:

- Table wrapper exists: `frontend/src/components/AppTable.tsx` (ProTable-based)
- Generic business list exists: `frontend/src/components/EntityTable.tsx`
- Generic dynamic form exists: `frontend/src/components/DynamicForm.tsx`
- Generic module page orchestrator exists: `frontend/src/features/module/ModuleRoute.tsx`

Implementation strategy used:

- Reuse and extend `DynamicForm` for WBS enhanced entry (instead of replacing all forms)
- Reuse `AppTable` and add `element-like` variant for WBS list / WBS staged rows
- Keep backend API contract unchanged and perform batch submission on frontend via sequential create calls

## Outstanding Business Confirmations (Task 1.2 dependency)

- Final list of fields to downgrade to optional / auto-filled
- WBS “人物分解项”是否使用固定枚举（角色/人员）还是自由输入
- 字段填写说明文案是否需要产品统一规范模板

