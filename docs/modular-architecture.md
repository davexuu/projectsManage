# 模块化结构说明

## 后端（已模块化）

- 模块根目录：`/Users/xucong/codexProjects/projectsManage/backend/src/modules`
- 路由聚合入口：`/Users/xucong/codexProjects/projectsManage/backend/src/modules/apiRouter.ts`

### 已拆分模块

- `auth`：登录与当前用户
- `import`：Excel 预览与入库
- `meta`：表单元数据
- `users`：用户列表
- `projects`：项目、项目看板、成员权限
- `wbs`
- `milestones`
- `progress-records`
- `status-assessments`
- `risks`
- `changes`
- `shared`：HTTP工具与项目访问工具

### 兼容性

- 所有 API 路径保持不变。
- 前端无需改接口地址即可继续使用。

## 前端（已模块化）

- Feature 根目录：`/Users/xucong/codexProjects/projectsManage/frontend/src/features`

### 已拆分模块

- `auth/LoginPanel.tsx`
- `dashboard/ProjectDashboard.tsx`
- `access/ProjectMemberAccess.tsx`
- `import/ImportPanel.tsx`

### 入口

- 页面组装入口：`/Users/xucong/codexProjects/projectsManage/frontend/src/App.tsx`
