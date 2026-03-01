## 变更说明

本次实现为计划编排工作台补齐了后端结构化模型与前端统一入口，兼容现有 `/wbs`、`/milestones` 的单条 CRUD 使用方式。

### 新增能力

- WBS 结构化字段：`wbsCode`、`parentTaskId`、`predecessorTaskIds`、`milestoneId`、`sortOrder`
- WBS 批量与校验 API：
  - `POST /api/wbs/batch`
  - `POST /api/wbs/validate-plan`
- 里程碑查询增强：支持筛选参数及 `includeTaskSummary=true` 返回关联任务摘要
- 前端新增计划编排工作台入口：`/planning-studio`

## 兼容性

- 保留原有 `POST /api/wbs`、`PUT /api/wbs/:id`、`GET /api/wbs` 入口不变。
- 新增字段均为可空字段，旧数据无需立即补录。
- 旧版模块入口（`/module/*`）可继续使用。

## 数据迁移

- 迁移文件：`backend/prisma/migrations/20260301170000_add_wbs_planning_fields/migration.sql`
- 迁移内容：
  - `WbsTask` 增加结构化字段与索引
  - 增加 `WbsTask.parentTaskId -> WbsTask.id` 自引用外键
  - 增加 `WbsTask.milestoneId -> Milestone.id` 外键
  - 增加 `Milestone(projectId, milestoneCode)` 索引

## 回滚策略

1. 前端回滚：菜单中移除 `/planning-studio` 入口，保留原 `/module/wbs` 与 `/gantt`。
2. 后端回滚：停用 `/wbs/batch`、`/wbs/validate-plan` 两个新接口。
3. 数据层回滚：若必须回滚 migration，需先清理依赖新字段的数据，再回退迁移。
