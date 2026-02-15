# 第 5 阶段：系统功能底座（sys_*）

本阶段基于参考系统表结构，先把系统能力底座落库，业务功能继续沿用当前表结构。

## 已新增表（Prisma + 迁移）

- 组织与区域：`sys_area`、`sys_office`
- 用户权限：`sys_user`、`sys_role`、`sys_menu`、`sys_post`
- 关系表：`sys_user_role`、`sys_user_post`、`sys_role_menu`、`sys_role_datarule`
- 字典与配置：`sys_dict_type`、`sys_dict_value`、`sys_config`
- 数据规则：`sys_datarule`
- 运行支撑：`sys_schedule`、`sys_log`、`sys_login_count`
- 文件中心：`sys_folder`、`sys_file`

## 设计原则

- 不影响现有业务：本次只新增 `sys_*`，不改现有 `Project/*` 业务表。
- 对齐成熟系统命名：使用 `@@map("sys_xxx")` 直接映射到参考命名。
- 先建模后接入：先把系统主数据与权限中台建好，再改认证和菜单接口。

## 建议落地顺序

1. 接入 `sys_user + sys_role + sys_user_role` 到登录流程（替换当前内存用户）。
2. 接入 `sys_menu + sys_role_menu` 做动态菜单与按钮权限。
3. 接入 `sys_office + sys_post + sys_user_post` 做组织与岗位维度管理。
4. 接入 `sys_dict_* + sys_config`，替换前端硬编码选项与常量。
5. 接入 `sys_log + sys_schedule + sys_file`，补齐系统运行能力。

## 相关文件

- Prisma 模型：`/Users/xucong/codexProjects/projectsManage/backend/prisma/schema.prisma`
- 迁移脚本：`/Users/xucong/codexProjects/projectsManage/backend/prisma/migrations/20260208202000_stage5_system_base/migration.sql`
