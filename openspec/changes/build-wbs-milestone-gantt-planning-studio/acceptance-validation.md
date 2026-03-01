## 验收对照（spec 场景）

### planning-studio-workspace

- Unified planning studio entry
  - Open planning studio with project selected: 通过（路由 `/planning-studio` + 同页渲染 WBS/里程碑/甘特）
  - Change shared filters in studio: 通过（`stage/timeRange` 统一驱动 `api.list` 查询参数）

- Fast WBS decomposition in studio
  - Add multiple rows quickly: 通过（`DynamicForm` 批量模式 + 连续加入列表 + 继承）
  - Submit batch with validation errors: 通过（`/wbs/validate-plan`，返回冲突并阻止提交）

- Cross-view navigation consistency
  - Locate record from gantt chart: 通过（`GanttChart.onSelect` 回调驱动列表选中与高亮）

### wbs-hierarchy-dependency-model

- Structured WBS hierarchy model
  - Create child task under parent: 通过（`parentTaskId` 字段与外键）
  - Retrieve WBS as hierarchical structure: 通过（返回层级字段；按 `sortOrder/createdAt` 稳定排序）

- Task dependency relationship management
  - Save dependency without cycles: 通过（依赖存在性校验 + 更新时环路校验）
  - Reject cyclic dependencies: 通过（`assertWbsDependencyNoCycle`）

- Batch write with transactional integrity
  - Batch create succeeds: 通过（`/wbs/batch` + `prisma.$transaction`）
  - Batch create partially invalid: 通过（400 + `details.rowErrors` 逐行错误）

### milestone-gantt-integration

- Milestone-to-WBS structured linking
  - Link milestone to supporting tasks: 通过（`WbsTask.milestoneId` 关联 + milestones include 摘要）
  - Validate milestone without supporting tasks: 通过（`linkWarning` 在状态进行中/已完成且无关联时返回）

- Unified gantt rendering for tasks and milestones
  - Render combined plan timeline: 通过（任务条 + 里程碑节点统一渲染）
  - Apply stage filter in gantt: 通过（stage/startDate/endDate 查询与图表过滤一致）

- Plan consistency checks for schedule conflicts
  - Detect task date inversion: 通过（schema + store 校验）
  - Detect dependency date conflict: 通过（`validate-plan` 与冲突标记）

## 自动化验证结果

- 后端构建：`npm run build -w backend` 通过
- 前端构建：`npm run build -w frontend` 通过
- API 回归：`npm run test:api-regression` 通过（已覆盖新增 `/wbs/batch`、`/wbs/validate-plan`、里程碑摘要查询）

## 人工回归建议

- 在浏览器走查 `/planning-studio`：
  - 快速录入 3 条 WBS，验证复制/继承/草稿
  - 点击甘特任务与里程碑，确认表格反向定位
  - 触发依赖冲突，确认列表与甘特均显示冲突标记
