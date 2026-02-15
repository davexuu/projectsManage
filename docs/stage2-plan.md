# 第 2 阶段已落地内容与下一步

## 已落地

1. 数据库建模
- Prisma Schema 已覆盖：Project、WbsTask、Milestone、ProgressRecord、StatusAssessment、RiskItem、ChangeRequest、User。

2. 登录与权限
- JWT 登录、身份解析、角色鉴权中间件。
- 角色策略：
  - `ADMIN/PM`：可创建项目、WBS、里程碑、状态评估、风险、变更。
  - `MEMBER`：可写推进记录。

3. Excel 导入预览
- 支持读取 xlsx 并按模板字段映射成系统对象（预览模式）。
- 支持模块：立项/WBS/里程碑/推进/状态评估/风险/变更。

## 下一步（第 3 阶段）

1. 仓储层切换到 Prisma
- 将 `store.ts` 内存实现替换为 PrismaRepository。

2. 导入“落库”
- 在 `/api/import/preview` 基础上新增 `/api/import/commit`。
- 增加去重规则（按项目名+年度、里程碑编号、风险编号等）。

3. 业务规则
- 里程碑逾期自动识别。
- 进度风险（红黄绿）自动判定基础规则。
- 变更对里程碑/WBS影响联动提醒。

4. 前端增强
- 角色驱动按钮可见性。
- 项目主页（总览卡片 + 风险热点 + 里程碑甘特）。
