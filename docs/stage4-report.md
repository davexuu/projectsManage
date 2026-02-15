# 第 4 阶段交付报告

## 本次完成

1. 导入清洗规则
- 在 `preview` 和 `commit` 统一增加行过滤，自动剔除模板说明行、枚举示例行、无效日期行。
- 清洗后统计口径更贴近真实业务数据。

2. 项目总览页
- 新增后端看板接口：`GET /api/projects/:projectId/dashboard`。
- 输出 KPI：任务完成率、里程碑完成率、逾期任务、开放风险、升级风险。
- 输出趋势与热点：`progressTrend`、`riskHotspots`、`latestStatus`。
- 前端新增“项目总览”展示区。

3. 用户-项目级权限
- 新增 Prisma 模型：`ProjectMember`，枚举 `AccessRole(OWNER/EDITOR/VIEWER)`。
- 新增成员管理接口：
  - `GET /api/projects/:projectId/members`
  - `POST /api/projects/:projectId/members`
  - `DELETE /api/projects/:projectId/members/:userId`
- 读权限：非 ADMIN 用户仅可读取其被授权项目数据。
- 写权限：按角色 + 项目成员权限双重控制。

## 数据库迁移

- 新增迁移：`20260208104134_stage4_project_access`

## 联调验证（本次）

1. 导入预览（清洗后）
- projects: 1
- wbs: 10
- milestones: 5
- progressRecords: 4
- statusAssessments: 4

2. 看板接口
- 成功返回 KPI（包含逾期任务、里程碑完成率等）。

3. 权限接口
- ADMIN 为 `u-member` 授权 `EDITOR` 成功。
- MEMBER 可提交 `progress-records` 成功。
- MEMBER 提交 `wbs` 返回 403（符合权限设计）。
