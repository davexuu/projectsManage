import { PrismaClient } from "@prisma/client";
import { store } from "../../services/store.js";

export type SystemFieldKind = "string" | "number" | "boolean" | "date" | "json" | "enum";

type MutableMode = "create" | "update" | "both";

export interface SystemFieldMeta {
  key: string;
  label: string;
  kind: SystemFieldKind;
  required: boolean;
  options?: string[];
  mutable?: MutableMode;
}

export interface SystemEntityMeta {
  key: string;
  label: string;
  allowCreate: boolean;
  allowUpdate: boolean;
  allowDelete: boolean;
  fields: SystemFieldMeta[];
}

interface SystemEntityConfig extends SystemEntityMeta {
  model: string;
  orderBy?: Record<string, "asc" | "desc"> | Array<Record<string, "asc" | "desc">>;
}

const SYS_STATUS_OPTIONS = ["ENABLED", "DISABLED"];
const MENU_TYPE_OPTIONS = ["DIRECTORY", "MENU", "BUTTON"];
const DATA_SCOPE_OPTIONS = ["ALL", "ORG_AND_CHILD", "ORG", "SELF", "CUSTOM"];

const entityConfigs: Record<string, SystemEntityConfig> = {
  sysArea: {
    key: "sysArea",
    label: "区域管理",
    model: "sysArea",
    allowCreate: true,
    allowUpdate: true,
    allowDelete: true,
    orderBy: [{ level: "asc" }, { sort: "asc" }, { createdAt: "asc" }],
    fields: [
      { key: "code", label: "区域编码", kind: "string", required: true },
      { key: "name", label: "区域名称", kind: "string", required: true },
      { key: "fullName", label: "区域全称", kind: "string", required: false },
      { key: "parentId", label: "上级区域ID", kind: "string", required: false },
      { key: "level", label: "层级", kind: "number", required: false },
      { key: "sort", label: "排序", kind: "number", required: false },
      { key: "status", label: "状态", kind: "enum", required: false, options: SYS_STATUS_OPTIONS }
    ]
  },
  sysOffice: {
    key: "sysOffice",
    label: "组织机构",
    model: "sysOffice",
    allowCreate: true,
    allowUpdate: true,
    allowDelete: true,
    orderBy: [{ sort: "asc" }, { createdAt: "asc" }],
    fields: [
      { key: "officeCode", label: "机构编码", kind: "string", required: true },
      { key: "officeName", label: "机构名称", kind: "string", required: true },
      { key: "officeType", label: "机构类型", kind: "string", required: false },
      { key: "grade", label: "机构等级", kind: "string", required: false },
      { key: "parentId", label: "上级机构ID", kind: "string", required: false },
      { key: "parentIds", label: "所有上级ID串", kind: "string", required: false },
      { key: "areaId", label: "归属区域ID", kind: "string", required: false },
      { key: "leader", label: "负责人", kind: "string", required: false },
      { key: "phone", label: "电话", kind: "string", required: false },
      { key: "fax", label: "传真", kind: "string", required: false },
      { key: "email", label: "邮箱", kind: "string", required: false },
      { key: "address", label: "地址", kind: "string", required: false },
      { key: "zipCode", label: "邮编", kind: "string", required: false },
      { key: "sort", label: "排序", kind: "number", required: false },
      { key: "status", label: "状态", kind: "enum", required: false, options: SYS_STATUS_OPTIONS },
      { key: "useable", label: "是否可用", kind: "string", required: false },
      { key: "primaryPerson", label: "主负责人", kind: "string", required: false },
      { key: "deputyPerson", label: "副负责人", kind: "string", required: false },
      { key: "delFlag", label: "删除标记", kind: "number", required: false }
    ]
  },
  sysPost: {
    key: "sysPost",
    label: "岗位管理",
    model: "sysPost",
    allowCreate: true,
    allowUpdate: true,
    allowDelete: true,
    orderBy: [{ sort: "asc" }, { createdAt: "asc" }],
    fields: [
      { key: "postCode", label: "岗位编码", kind: "string", required: true },
      { key: "postName", label: "岗位名称", kind: "string", required: true },
      { key: "officeId", label: "所属机构ID", kind: "string", required: false },
      { key: "sort", label: "排序", kind: "number", required: false },
      { key: "status", label: "状态", kind: "enum", required: false, options: SYS_STATUS_OPTIONS },
      { key: "remark", label: "备注", kind: "string", required: false }
    ]
  },
  sysUser: {
    key: "sysUser",
    label: "系统用户",
    model: "sysUser",
    allowCreate: true,
    allowUpdate: true,
    allowDelete: true,
    orderBy: { createdAt: "desc" },
    fields: [
      { key: "username", label: "账号", kind: "string", required: true },
      { key: "displayName", label: "姓名", kind: "string", required: true },
      { key: "passwordHash", label: "密码Hash", kind: "string", required: true, mutable: "create" },
      { key: "officeId", label: "机构ID", kind: "string", required: false },
      { key: "mobile", label: "手机号", kind: "string", required: false },
      { key: "email", label: "邮箱", kind: "string", required: false },
      { key: "status", label: "状态", kind: "enum", required: false, options: SYS_STATUS_OPTIONS },
      { key: "lastLoginAt", label: "最后登录时间", kind: "date", required: false, mutable: "update" }
    ]
  },
  sysRole: {
    key: "sysRole",
    label: "角色管理",
    model: "sysRole",
    allowCreate: true,
    allowUpdate: true,
    allowDelete: true,
    orderBy: [{ sort: "asc" }, { createdAt: "asc" }],
    fields: [
      { key: "roleCode", label: "角色编码", kind: "string", required: true },
      { key: "roleName", label: "角色名称", kind: "string", required: true },
      { key: "dataScope", label: "数据范围", kind: "enum", required: false, options: DATA_SCOPE_OPTIONS },
      { key: "sort", label: "排序", kind: "number", required: false },
      { key: "status", label: "状态", kind: "enum", required: false, options: SYS_STATUS_OPTIONS },
      { key: "remark", label: "备注", kind: "string", required: false }
    ]
  },
  sysMenu: {
    key: "sysMenu",
    label: "菜单管理",
    model: "sysMenu",
    allowCreate: true,
    allowUpdate: true,
    allowDelete: true,
    orderBy: [{ sort: "asc" }, { createdAt: "asc" }],
    fields: [
      { key: "menuCode", label: "菜单编码", kind: "string", required: false },
      { key: "menuName", label: "菜单名称", kind: "string", required: true },
      { key: "menuType", label: "菜单类型", kind: "enum", required: true, options: MENU_TYPE_OPTIONS },
      { key: "parentId", label: "上级菜单ID", kind: "string", required: false },
      { key: "path", label: "路由", kind: "string", required: false },
      { key: "component", label: "组件", kind: "string", required: false },
      { key: "permission", label: "权限标识", kind: "string", required: false },
      { key: "icon", label: "图标", kind: "string", required: false },
      { key: "sort", label: "排序", kind: "number", required: false },
      { key: "visible", label: "可见", kind: "boolean", required: false },
      { key: "keepAlive", label: "缓存", kind: "boolean", required: false },
      { key: "status", label: "状态", kind: "enum", required: false, options: SYS_STATUS_OPTIONS }
    ]
  },
  sysUserRole: {
    key: "sysUserRole",
    label: "用户角色关系",
    model: "sysUserRole",
    allowCreate: true,
    allowUpdate: true,
    allowDelete: true,
    orderBy: { createdAt: "desc" },
    fields: [
      { key: "userId", label: "用户ID", kind: "string", required: true },
      { key: "roleId", label: "角色ID", kind: "string", required: true }
    ]
  },
  sysUserPost: {
    key: "sysUserPost",
    label: "用户岗位关系",
    model: "sysUserPost",
    allowCreate: true,
    allowUpdate: true,
    allowDelete: true,
    orderBy: { createdAt: "desc" },
    fields: [
      { key: "userId", label: "用户ID", kind: "string", required: true },
      { key: "postId", label: "岗位ID", kind: "string", required: true }
    ]
  },
  sysRoleMenu: {
    key: "sysRoleMenu",
    label: "角色菜单关系",
    model: "sysRoleMenu",
    allowCreate: true,
    allowUpdate: true,
    allowDelete: true,
    orderBy: { createdAt: "desc" },
    fields: [
      { key: "roleId", label: "角色ID", kind: "string", required: true },
      { key: "menuId", label: "菜单ID", kind: "string", required: true }
    ]
  },
  sysDataRule: {
    key: "sysDataRule",
    label: "数据规则",
    model: "sysDataRule",
    allowCreate: true,
    allowUpdate: true,
    allowDelete: true,
    orderBy: { createdAt: "desc" },
    fields: [
      { key: "ruleCode", label: "规则编码", kind: "string", required: true },
      { key: "ruleName", label: "规则名称", kind: "string", required: true },
      { key: "target", label: "目标对象", kind: "string", required: true },
      { key: "conditionJson", label: "条件JSON", kind: "json", required: false },
      { key: "status", label: "状态", kind: "enum", required: false, options: SYS_STATUS_OPTIONS },
      { key: "remark", label: "备注", kind: "string", required: false }
    ]
  },
  sysRoleDataRule: {
    key: "sysRoleDataRule",
    label: "角色数据规则关系",
    model: "sysRoleDataRule",
    allowCreate: true,
    allowUpdate: true,
    allowDelete: true,
    orderBy: { createdAt: "desc" },
    fields: [
      { key: "roleId", label: "角色ID", kind: "string", required: true },
      { key: "dataRuleId", label: "规则ID", kind: "string", required: true }
    ]
  },
  sysDictType: {
    key: "sysDictType",
    label: "字典类型",
    model: "sysDictType",
    allowCreate: true,
    allowUpdate: true,
    allowDelete: true,
    orderBy: { createdAt: "asc" },
    fields: [
      { key: "dictCode", label: "字典编码", kind: "string", required: true },
      { key: "dictName", label: "字典名称", kind: "string", required: true },
      { key: "status", label: "状态", kind: "enum", required: false, options: SYS_STATUS_OPTIONS },
      { key: "remark", label: "备注", kind: "string", required: false }
    ]
  },
  sysDictValue: {
    key: "sysDictValue",
    label: "字典值",
    model: "sysDictValue",
    allowCreate: true,
    allowUpdate: true,
    allowDelete: true,
    orderBy: [{ sort: "asc" }, { createdAt: "asc" }],
    fields: [
      { key: "dictTypeId", label: "字典类型ID", kind: "string", required: true },
      { key: "dictLabel", label: "显示文本", kind: "string", required: true },
      { key: "dictValue", label: "字典值", kind: "string", required: true },
      { key: "isDefault", label: "默认值", kind: "boolean", required: false },
      { key: "sort", label: "排序", kind: "number", required: false },
      { key: "status", label: "状态", kind: "enum", required: false, options: SYS_STATUS_OPTIONS },
      { key: "remark", label: "备注", kind: "string", required: false }
    ]
  },
  sysConfig: {
    key: "sysConfig",
    label: "系统参数",
    model: "sysConfig",
    allowCreate: true,
    allowUpdate: true,
    allowDelete: true,
    orderBy: { createdAt: "asc" },
    fields: [
      { key: "configKey", label: "参数键", kind: "string", required: true },
      { key: "configValue", label: "参数值", kind: "string", required: true },
      { key: "valueType", label: "值类型", kind: "string", required: false },
      { key: "remark", label: "备注", kind: "string", required: false },
      { key: "status", label: "状态", kind: "enum", required: false, options: SYS_STATUS_OPTIONS }
    ]
  },
  sysSchedule: {
    key: "sysSchedule",
    label: "调度任务",
    model: "sysSchedule",
    allowCreate: true,
    allowUpdate: true,
    allowDelete: true,
    orderBy: { createdAt: "desc" },
    fields: [
      { key: "scheduleName", label: "任务名称", kind: "string", required: true },
      { key: "cronExpression", label: "Cron表达式", kind: "string", required: true },
      { key: "invokeTarget", label: "执行目标", kind: "string", required: true },
      { key: "payload", label: "任务负载JSON", kind: "json", required: false },
      { key: "status", label: "状态", kind: "enum", required: false, options: SYS_STATUS_OPTIONS },
      { key: "lastRunAt", label: "上次执行时间", kind: "date", required: false },
      { key: "nextRunAt", label: "下次执行时间", kind: "date", required: false },
      { key: "failCount", label: "失败次数", kind: "number", required: false },
      { key: "remark", label: "备注", kind: "string", required: false }
    ]
  },
  sysFolder: {
    key: "sysFolder",
    label: "文件目录",
    model: "sysFolder",
    allowCreate: true,
    allowUpdate: true,
    allowDelete: true,
    orderBy: [{ sort: "asc" }, { createdAt: "asc" }],
    fields: [
      { key: "folderName", label: "目录名", kind: "string", required: true },
      { key: "folderPath", label: "目录路径", kind: "string", required: true },
      { key: "parentId", label: "上级目录ID", kind: "string", required: false },
      { key: "sort", label: "排序", kind: "number", required: false },
      { key: "status", label: "状态", kind: "enum", required: false, options: SYS_STATUS_OPTIONS }
    ]
  },
  sysFile: {
    key: "sysFile",
    label: "文件中心",
    model: "sysFile",
    allowCreate: true,
    allowUpdate: true,
    allowDelete: true,
    orderBy: { createdAt: "desc" },
    fields: [
      { key: "folderId", label: "目录ID", kind: "string", required: false },
      { key: "fileName", label: "文件名", kind: "string", required: true },
      { key: "fileKey", label: "文件键", kind: "string", required: true },
      { key: "fileExt", label: "扩展名", kind: "string", required: false },
      { key: "fileSize", label: "文件大小", kind: "number", required: true },
      { key: "mimeType", label: "MIME", kind: "string", required: false },
      { key: "uploaderId", label: "上传人ID", kind: "string", required: false },
      { key: "status", label: "状态", kind: "enum", required: false, options: SYS_STATUS_OPTIONS }
    ]
  },
  sysLoginCount: {
    key: "sysLoginCount",
    label: "登录统计",
    model: "sysLoginCount",
    allowCreate: true,
    allowUpdate: true,
    allowDelete: true,
    orderBy: { statDate: "desc" },
    fields: [
      { key: "statDate", label: "统计日期", kind: "date", required: true },
      { key: "loginCount", label: "登录次数", kind: "number", required: false }
    ]
  },
  sysLog: {
    key: "sysLog",
    label: "系统日志",
    model: "sysLog",
    allowCreate: false,
    allowUpdate: false,
    allowDelete: true,
    orderBy: { createdAt: "desc" },
    fields: [
      { key: "userId", label: "用户ID", kind: "string", required: false },
      { key: "module", label: "模块", kind: "string", required: false },
      { key: "action", label: "动作", kind: "string", required: true },
      { key: "requestUrl", label: "请求URL", kind: "string", required: false },
      { key: "requestMethod", label: "请求方法", kind: "string", required: false },
      { key: "requestIp", label: "请求IP", kind: "string", required: false },
      { key: "userAgent", label: "UA", kind: "string", required: false },
      { key: "requestBody", label: "请求体JSON", kind: "json", required: false },
      { key: "responseBody", label: "响应体JSON", kind: "json", required: false },
      { key: "isSuccess", label: "成功", kind: "boolean", required: false },
      { key: "errorMessage", label: "错误信息", kind: "string", required: false }
    ]
  }
};

function parseNumber(value: unknown, field: string): number {
  const num = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(num)) {
    throw new Error(`字段 ${field} 不是有效数字`);
  }
  return num;
}

function parseBoolean(value: unknown, field: string): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") return true;
    if (normalized === "false" || normalized === "0") return false;
  }
  throw new Error(`字段 ${field} 不是有效布尔值`);
}

function parseDate(value: unknown, field: string): Date {
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    throw new Error(`字段 ${field} 不是有效日期`);
  }
  return date;
}

function normalizeFieldValue(field: SystemFieldMeta, value: unknown): unknown {
  if (value === undefined) return undefined;
  if (value === null) return null;

  if (field.kind === "string" || field.kind === "enum") {
    return String(value).trim();
  }
  if (field.kind === "number") {
    return parseNumber(value, field.key);
  }
  if (field.kind === "boolean") {
    return parseBoolean(value, field.key);
  }
  if (field.kind === "date") {
    return parseDate(value, field.key);
  }
  if (typeof value === "string") {
    const text = value.trim();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`字段 ${field.key} 不是有效 JSON`);
    }
  }
  return value;
}

function assertPayload(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("请求体必须为对象");
  }
  return payload as Record<string, unknown>;
}

function shouldMutateField(field: SystemFieldMeta, mode: "create" | "update") {
  const mutable = field.mutable ?? "both";
  return mutable === "both" || mutable === mode;
}

function buildMutationData(entity: SystemEntityConfig, payload: unknown, mode: "create" | "update") {
  const input = assertPayload(payload);
  const data: Record<string, unknown> = {};

  for (const field of entity.fields) {
    if (!shouldMutateField(field, mode)) continue;

    const hasKey = Object.prototype.hasOwnProperty.call(input, field.key);
    if (!hasKey) {
      if (mode === "create" && field.required) {
        throw new Error(`缺少必填字段: ${field.key}`);
      }
      continue;
    }

    const normalized = normalizeFieldValue(field, input[field.key]);
    if ((normalized === "" || normalized === null) && field.required) {
      throw new Error(`字段 ${field.key} 不能为空`);
    }
    if (normalized === "") {
      data[field.key] = null;
      continue;
    }
    data[field.key] = normalized;
  }

  if (mode === "update" && Object.keys(data).length === 0) {
    throw new Error("没有可更新的字段");
  }

  return data;
}

function toJsonSafe(value: unknown): unknown {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "bigint") {
    return value.toString();
  }
  if (Array.isArray(value)) {
    return value.map((item) => toJsonSafe(item));
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, toJsonSafe(v)]);
    return Object.fromEntries(entries);
  }
  return value;
}

function getModelClient(model: string) {
  const client = (store.client as unknown as Record<string, unknown>)[model];
  if (!client || typeof client !== "object") {
    throw new Error(`实体模型不存在: ${model}`);
  }
  return client as {
    findMany: (arg: Record<string, unknown>) => Promise<unknown[]>;
    findUnique: (arg: Record<string, unknown>) => Promise<unknown | null>;
    create: (arg: Record<string, unknown>) => Promise<unknown>;
    update: (arg: Record<string, unknown>) => Promise<unknown>;
    delete: (arg: Record<string, unknown>) => Promise<unknown>;
  };
}

export function listSystemEntityMetas(): SystemEntityMeta[] {
  return Object.values(entityConfigs).map(({ model: _model, orderBy: _orderBy, ...meta }) => meta);
}

export function resolveEntity(entityKey: string): SystemEntityMeta {
  const entity = entityConfigs[entityKey];
  if (!entity) {
    throw new Error(`未知系统实体: ${entityKey}`);
  }
  const { model: _model, orderBy: _orderBy, ...meta } = entity;
  return meta;
}

function resolveEntityConfig(entityKey: string): SystemEntityConfig {
  const entity = entityConfigs[entityKey];
  if (!entity) {
    throw new Error(`未知系统实体: ${entityKey}`);
  }
  return entity;
}

export async function listSystemEntityRows(entityKey: string) {
  const entity = resolveEntityConfig(entityKey);
  const model = getModelClient(entity.model);
  const rows = await model.findMany({ orderBy: entity.orderBy ?? { createdAt: "desc" }, take: 500 });
  return toJsonSafe(rows);
}

export async function getSystemEntityRow(entityKey: string, id: string) {
  const entity = resolveEntityConfig(entityKey);
  const model = getModelClient(entity.model);
  const row = await model.findUnique({ where: { id } });
  return row ? toJsonSafe(row) : null;
}

export async function createSystemEntityRow(entityKey: string, payload: unknown) {
  const entity = resolveEntityConfig(entityKey);
  if (!entity.allowCreate) {
    throw new Error(`实体 ${entityKey} 不支持新增`);
  }
  const model = getModelClient(entity.model);
  const data = buildMutationData(entity, payload, "create");
  const created = await model.create({ data });
  return toJsonSafe(created);
}

export async function updateSystemEntityRow(entityKey: string, id: string, payload: unknown) {
  const entity = resolveEntityConfig(entityKey);
  if (!entity.allowUpdate) {
    throw new Error(`实体 ${entityKey} 不支持编辑`);
  }
  const model = getModelClient(entity.model);
  const data = buildMutationData(entity, payload, "update");
  const updated = await model.update({ where: { id }, data });
  return toJsonSafe(updated);
}

export async function deleteSystemEntityRow(entityKey: string, id: string) {
  const entity = resolveEntityConfig(entityKey);
  if (!entity.allowDelete) {
    throw new Error(`实体 ${entityKey} 不支持删除`);
  }
  const model = getModelClient(entity.model);
  const deleted = await model.delete({ where: { id } });
  return toJsonSafe(deleted);
}

// Keep explicit reference to PrismaClient for compile-time guard around model names.
void (PrismaClient as unknown);
