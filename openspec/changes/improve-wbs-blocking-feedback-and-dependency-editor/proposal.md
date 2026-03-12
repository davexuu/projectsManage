## Why

当前 WBS 快速分解流程在“阶段选择感知”“依赖编辑可用性”“阻断提示可操作性”上存在明显体验断层：用户看不出当前阶段是否真正生效，草稿表格内依赖下拉难以操作，提交被后端规则拦截时缺少直白的下一步指引。该问题已直接影响批量分解提交效率与可理解性，需要优先修复。

## What Changes

- 去除快速生成建议区的“当前阶段”手动选择项，避免与规则回退策略产生认知冲突。
- 重构草稿区依赖编辑交互：从“表格单元格多选下拉”改为“行内按钮 -> 弹窗编辑依赖”。
- 将阻断类错误（如存在未审批且影响 WBS/里程碑的变更）升级为弹窗提示，明确告知：是什么问题、如何修复、应点击哪里继续操作。
- 统一提示分层：信息类保留轻提示，阻断类必须强提示（弹窗）并提供可执行操作入口。
- 调整相关文案，确保用户无需理解底层规则即可完成处理。

## Capabilities

### New Capabilities
- `wbs-blocking-feedback-modal`: WBS 提交阻断场景下的强提示弹窗能力，包含问题说明、修复指引与操作入口。
- `wbs-dependency-dialog-editor`: WBS 草稿依赖关系的弹窗编辑能力，替代表格内窄列多选。
- `wbs-quick-suggestion-entry-simplification`: 快速建议入口精简能力，移除“当前阶段”手动选择并明确阶段策略文案。

### Modified Capabilities
- （无）

## Impact

- 前端：`frontend/src/components/DynamicForm.tsx`（快速建议区、草稿依赖编辑、提示策略）
- 前端：`frontend/src/features/planning/PlanningStudio.tsx`（建议接口参数传递与页面行为）
- 前端：`frontend/src/api/client.ts`（快速建议接口参数收敛）
- 后端：`backend/src/services/store.ts`（快速建议生成策略入参兼容处理）
- OpenSpec：新增/修改对应 capability specs 与任务拆解
