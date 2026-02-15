# PMP 项目管理系统（前后端分离）

基于你提供的 `PMP项目管理工具模板.xlsx` 开发，当前已完成第 4 阶段：

- 前端：React + Vite + TypeScript
- 后端：Express + TypeScript + Zod
- 鉴权：JWT（角色 `ADMIN/PM/MEMBER`）
- 持久化：Prisma + MySQL
- Excel：导入预览 + 清洗 + 一键入库
- 权限：项目级权限（`OWNER/EDITOR/VIEWER`）
- 看板：项目总览（进度、里程碑、风险热点）

## 路径

- 后端：`/Users/xucong/codexProjects/projectsManage/backend`
- 前端：`/Users/xucong/codexProjects/projectsManage/frontend`
- Prisma：`/Users/xucong/codexProjects/projectsManage/backend/prisma/schema.prisma`

## 本机联调环境（已验证）

- Docker 容器：`pmp-mysql`
- 连接串：`mysql://root:Nm,.7890@localhost:3306/pmp_manage`
- Prisma 迁移：
  - `20260208100949_init`
  - `20260208104134_stage4_project_access`

## 启动

1. 安装依赖
- 在 `/Users/xucong/codexProjects/projectsManage` 执行：`npm install`

2. 启动数据库（Docker）
- `docker compose up -d`

3. 执行 Prisma
- `npm run prisma:generate -w backend`
- `npm run prisma:migrate -w backend -- --name init`

4. 启动服务
- 后端：`npm run dev:backend`
- 前端：`npm run dev:frontend`

## 默认测试账号

- `admin / Admin@123`
- `pm / Pm@123456`
- `member / Member@123`

## 主要接口

- 登录与用户：
  - `POST /api/auth/login`
  - `GET /api/auth/me`
  - `GET /api/users`
- Excel 导入：
  - `POST /api/import/preview`
  - `POST /api/import/commit`
- 项目与看板：
  - `GET /api/projects`
  - `POST /api/projects`
  - `GET /api/projects/:projectId/dashboard`
- 项目成员权限：
  - `GET /api/projects/:projectId/members`
  - `POST /api/projects/:projectId/members`
  - `DELETE /api/projects/:projectId/members/:userId`
- 业务模块：
  - `/api/wbs`
  - `/api/milestones`
  - `/api/progress-records`
  - `/api/status-assessments`
  - `/api/risks`
  - `/api/changes`
