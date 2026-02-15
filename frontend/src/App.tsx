import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ApartmentOutlined,
  AppstoreOutlined,
  BarsOutlined,
  DashboardOutlined,
  FileSyncOutlined,
  LogoutOutlined,
  LineChartOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  TeamOutlined
} from "@ant-design/icons";
import { Button, Card, Cascader, DatePicker, Layout, Menu, Modal, Select, Space, Spin, Typography, message } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { api, SystemEntityMeta } from "./api/client";
import { DynamicForm } from "./components/DynamicForm";
import { EntityTable } from "./components/EntityTable";
import type { LoginUser } from "./features/auth/LoginPanel";
import type { DictionaryItem } from "./features/system/DictionaryManager";
import type { OrganizationNode } from "./features/system/OrganizationManager";
import { FieldType, FormField, FormSchemaMap, ModuleConfig } from "./types";
import { getErrorMessage } from "./utils/errors";

const { Header, Sider, Content } = Layout;
const { RangePicker } = DatePicker;

const LoginPanel = lazy(() => import("./features/auth/LoginPanel").then((m) => ({ default: m.LoginPanel })));
const ProjectDashboard = lazy(() => import("./features/dashboard/ProjectDashboard").then((m) => ({ default: m.ProjectDashboard })));
const ImportPanel = lazy(() => import("./features/import/ImportPanel").then((m) => ({ default: m.ImportPanel })));
const KanbanBoard = lazy(() => import("./features/kanban/KanbanBoard").then((m) => ({ default: m.KanbanBoard })));
const BurndownChart = lazy(() => import("./features/charts/BurndownChart").then((m) => ({ default: m.BurndownChart })));
const GanttChart = lazy(() => import("./features/charts/GanttChart").then((m) => ({ default: m.GanttChart })));
const ProjectMemberAccess = lazy(() => import("./features/access/ProjectMemberAccess").then((m) => ({ default: m.ProjectMemberAccess })));
const DictionaryManager = lazy(() => import("./features/system/DictionaryManager").then((m) => ({ default: m.DictionaryManager })));
const OrganizationManager = lazy(() => import("./features/system/OrganizationManager").then((m) => ({ default: m.OrganizationManager })));
const SystemEntityManager = lazy(() => import("./features/system/SystemEntityManager").then((m) => ({ default: m.SystemEntityManager })));

const modules: ModuleConfig[] = [
  { key: "projects", label: "项目立项卡", endpoint: "projects" },
  { key: "wbs", label: "WBS任务分解", endpoint: "wbs" },
  { key: "milestones", label: "里程碑计划", endpoint: "milestones" },
  { key: "progressRecords", label: "推进记录", endpoint: "progress-records" },
  { key: "statusAssessments", label: "项目状态评估", endpoint: "status-assessments" },
  { key: "risks", label: "风险问题台账", endpoint: "risks" },
  { key: "changes", label: "变更申请", endpoint: "changes" }
];

type SearchMode = "text" | "select" | "user" | "multi-user" | "year";

interface SearchFieldConfig {
  key: string;
  mode: SearchMode;
}

const moduleSearchFields: Record<string, SearchFieldConfig[]> = {
  projects: [
    { key: "projectName", mode: "text" },
    { key: "year", mode: "year" },
    { key: "leadDepartment", mode: "select" },
    { key: "projectOwner", mode: "user" },
    { key: "participants", mode: "multi-user" }
  ]
};

const extraColumnLabels: Record<string, string> = {
  id: "ID",
  projectId: "项目ID",
  createdAt: "创建时间",
  updatedAt: "更新时间"
};

function optionsToUnique(options: string[]) {
  return [...new Set(options.map((opt) => opt.trim()).filter(Boolean))];
}

function splitUserValues(value: unknown) {
  return String(value ?? "")
    .split(/[;,，、]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function asString(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

interface DepartmentCascaderOption {
  value: string;
  label: string;
  children?: DepartmentCascaderOption[];
}

function toDepartmentCascaderOptions(nodes: OrganizationNode[]): DepartmentCascaderOption[] {
  return nodes.map((node) => ({
    value: node.id,
    label: node.name,
    children: toDepartmentCascaderOptions(node.children ?? [])
  }));
}

function buildDepartmentLookup(nodes: OrganizationNode[]) {
  const descendants = new Map<string, string[]>();
  const names = new Map<string, string>();
  const namePaths = new Map<string, string[]>();

  const walk = (list: OrganizationNode[], parentPath: string[] = []): string[] => {
    const acc: string[] = [];
    list.forEach((node) => {
      const currentPath = [...parentPath, node.id];
      names.set(node.id, node.name);
      if (!namePaths.has(node.name)) {
        namePaths.set(node.name, currentPath);
      }
      const childNames = walk(node.children ?? [], currentPath);
      const inScope = optionsToUnique([node.name, ...childNames]);
      descendants.set(node.id, inScope);
      acc.push(...inScope);
    });
    return optionsToUnique(acc);
  };

  walk(nodes);
  return { descendants, names, namePaths };
}

interface ProjectOption {
  id: string;
  projectName: string;
}

interface ModuleRouteProps {
  moduleMap: Map<string, ModuleConfig>;
  schemas: FormSchemaMap;
  dictItems: DictionaryItem[];
  departmentOptions: string[];
  departmentTree: OrganizationNode[];
  userOptions: string[];
  yearOptions: string[];
  selectedProjectId: string;
  rows: Record<string, unknown>[];
  onModuleChange: (moduleKey: string) => void;
  onCreate: (payload: Record<string, unknown>, moduleKey: string) => Promise<void>;
  onUpdate: (payload: Record<string, unknown>, moduleKey: string, id: string) => Promise<void>;
  onDelete: (moduleKey: string, id: string, projectId?: string) => Promise<void>;
}

function ModuleRoute({
  moduleMap,
  schemas,
  dictItems,
  departmentOptions,
  departmentTree,
  userOptions,
  yearOptions,
  selectedProjectId,
  rows,
  onModuleChange,
  onCreate,
  onUpdate,
  onDelete
}: ModuleRouteProps) {
  const params = useParams();
  const moduleKey = params.moduleKey || "projects";
  const module = moduleMap.get(moduleKey);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<Record<string, unknown> | null>(null);
  const [searchValues, setSearchValues] = useState<Record<string, string | string[]>>({});
  const [departmentPath, setDepartmentPath] = useState<string[]>([]);

  useEffect(() => {
    if (module) {
      onModuleChange(moduleKey);
      setDialogOpen(false);
      setEditingRow(null);
      setSearchValues({});
      setDepartmentPath([]);
    }
  }, [moduleKey, module, onModuleChange]);

  if (!module) return <Navigate to="/module/projects" replace />;

  const fields = schemas[module.key] ?? [];
  const searchFieldConfigs = moduleSearchFields[module.key] ?? [];
  const needProject = module.endpoint !== "projects";
  const initialValues = {
    ...(needProject && selectedProjectId ? { projectId: selectedProjectId } : {}),
    ...(editingRow || {})
  };

  const columnLabels = useMemo(
    () => ({
      ...extraColumnLabels,
      ...Object.fromEntries(fields.map((field) => [field.key, field.label]))
    }),
    [fields]
  );
  const departmentCascaderOptions = useMemo(
    () => toDepartmentCascaderOptions(departmentTree),
    [departmentTree]
  );
  const departmentLookup = useMemo(() => buildDepartmentLookup(departmentTree), [departmentTree]);

  const filteredRows = useMemo(() => {
    if (searchFieldConfigs.length === 0) return rows;
    return rows.filter((row) =>
      searchFieldConfigs.every((config) => {
        if (config.key === "leadDepartment") {
          if (departmentPath.length === 0) return true;
          const value = String(row[config.key] ?? "").trim();
          if (!value) return false;
          const selectedNodeId = departmentPath[departmentPath.length - 1];
          const candidates = departmentLookup.descendants.get(selectedNodeId) ?? [];
          if (candidates.length > 0) return candidates.includes(value);
          const selectedName = departmentLookup.names.get(selectedNodeId) ?? "";
          return selectedName ? value === selectedName : false;
        }
        if (config.mode === "multi-user") {
          const rawValue = searchValues[config.key];
          const selectedUsers: string[] = Array.isArray(rawValue) ? rawValue : [];
          if (selectedUsers.length === 0) return true;
          const rowUsers = splitUserValues(row[config.key]);
          return selectedUsers.some((user: string) => rowUsers.includes(user));
        }
        const text = asString(searchValues[config.key]).trim();
        if (!text) return true;
        const value = String(row[config.key] ?? "");
        if (config.mode === "select") return value === text;
        return value.toLowerCase().includes(text.toLowerCase());
      })
    );
  }, [rows, searchFieldConfigs, searchValues, departmentPath, departmentLookup]);

  const searchableOptions = useMemo(() => {
    const out: Record<string, string[]> = {};
    searchFieldConfigs.forEach((config) => {
      const values =
        config.mode === "multi-user"
          ? optionsToUnique(rows.flatMap((r) => splitUserValues(r[config.key])))
          : [...new Set(rows.map((r) => String(r[config.key] ?? "").trim()).filter(Boolean))];
      const fromDict = dictItems.find((item) => item.key === config.key)?.options ?? [];
      if (config.key === "year") out[config.key] = optionsToUnique([...yearOptions, ...values]).sort((a, b) => Number(b) - Number(a));
      else if (fromDict.length > 0) out[config.key] = fromDict;
      else if (config.key === "leadDepartment" && departmentOptions.length > 0) out[config.key] = departmentOptions;
      else if (config.key === "projectOwner" && userOptions.length > 0) out[config.key] = userOptions;
      else out[config.key] = values;
    });
    return out;
  }, [rows, searchFieldConfigs, dictItems, departmentOptions, userOptions, yearOptions]);

  const dynamicFields = useMemo<FormField[]>(() => {
    if (module.key !== "projects") return fields;
    const dictMap = new Map(dictItems.map((item) => [item.key, item.options]));
    return fields.map((field) => {
      const dictOptions = dictMap.get(field.key);
      if (field.key === "projectType" && dictOptions) return { ...field, type: "select" as FieldType, options: dictOptions };
      if (field.key === "year") return { ...field, type: "select" as FieldType, options: yearOptions };
      if (field.key === "leadDepartment") return { ...field, type: "select" as FieldType, options: departmentOptions };
      if (field.key === "projectOwner") return { ...field, type: "select" as FieldType, options: userOptions };
      if (field.key === "participants") return { ...field, type: "multiselect" as FieldType, options: userOptions };
      return field;
    });
  }, [module.key, fields, dictItems, departmentOptions, userOptions, yearOptions]);

  const handleDeleteOne = (row: Record<string, unknown>) => {
    const rowId = String(row.id ?? "");
    if (!rowId) return;
    const projectId =
      module.key === "projects" ? undefined : String(row.projectId ?? selectedProjectId ?? "").trim() || undefined;
    Modal.confirm({
      title: "确认删除该记录？",
      content: "删除后不可恢复。",
      okButtonProps: { danger: true },
      onOk: () => onDelete(module.key, rowId, projectId).catch((e) => message.error(getErrorMessage(e)))
    });
  };

  const handleBatchDelete = (selectedRows: Record<string, unknown>[]) => {
    const ids = selectedRows
      .map((row) => ({
        id: String(row.id ?? "").trim(),
        projectId: module.key === "projects" ? undefined : String(row.projectId ?? selectedProjectId ?? "").trim() || undefined
      }))
      .filter((item) => Boolean(item.id));
    const tasks = ids.map((item) => () => onDelete(module.key, item.id, item.projectId));
    if (tasks.length === 0) return;
    Modal.confirm({
      title: `确认删除选中的 ${tasks.length} 条记录？`,
      content: "删除后不可恢复。",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await Promise.all(tasks.map((fn) => fn()));
          message.success(`已删除 ${tasks.length} 条记录`);
        } catch (e) {
          message.error(getErrorMessage(e));
        }
      }
    });
  };

  return (
    <>
      {needProject && !selectedProjectId ? <Card style={{ marginBottom: 16 }}>请选择项目后再录入该模块。</Card> : null}

      {searchFieldConfigs.length > 0 ? (
        <Card title="筛选" style={{ marginBottom: 16 }}>
          <Space wrap>
            {searchFieldConfigs.map((config) =>
              config.mode === "year" ? (
                <DatePicker
                  key={config.key}
                  picker="year"
                  allowClear
                  style={{ width: 220 }}
                  placeholder={columnLabels[config.key] ?? config.key}
                  value={asString(searchValues[config.key]) ? dayjs(asString(searchValues[config.key]), "YYYY") : null}
                  onChange={(value) =>
                    setSearchValues((prev) => ({ ...prev, [config.key]: value ? value.format("YYYY") : "" }))
                  }
                />
              ) : config.mode === "select" ? (
                config.key === "leadDepartment" ? (
                  <Cascader
                    key={config.key}
                    style={{ width: 220 }}
                    placeholder={columnLabels[config.key] ?? config.key}
                    allowClear
                    showSearch
                    changeOnSelect
                    value={departmentPath.length > 0 ? departmentPath : undefined}
                    options={departmentCascaderOptions}
                    onChange={(value) => setDepartmentPath((value as string[]) ?? [])}
                  />
                ) : (
                  <Select
                    key={config.key}
                    style={{ width: 220 }}
                    placeholder={columnLabels[config.key] ?? config.key}
                    allowClear
                    value={asString(searchValues[config.key]) || undefined}
                    options={(searchableOptions[config.key] ?? []).map((opt) => ({ label: opt, value: opt }))}
                    onChange={(value) => setSearchValues((prev) => ({ ...prev, [config.key]: value || "" }))}
                  />
                )
              ) : config.mode === "multi-user" ? (
                <Select
                  key={config.key}
                  mode="multiple"
                  showSearch
                  allowClear
                  style={{ width: 320 }}
                  placeholder={`请选择${columnLabels[config.key] ?? config.key}`}
                  value={Array.isArray(searchValues[config.key]) ? searchValues[config.key] : []}
                  options={(searchableOptions[config.key] ?? []).map((opt) => ({ label: opt, value: opt }))}
                  optionFilterProp="label"
                  filterOption={(input, option) => String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                  onChange={(value) => setSearchValues((prev) => ({ ...prev, [config.key]: value ?? [] }))}
                />
              ) : config.mode === "user" ? (
                <Select
                  key={config.key}
                  showSearch
                  allowClear
                  style={{ width: 220 }}
                  placeholder={`请输入${columnLabels[config.key] ?? config.key}`}
                  value={asString(searchValues[config.key]) || undefined}
                  options={(searchableOptions[config.key] ?? []).map((opt) => ({ label: opt, value: opt }))}
                  optionFilterProp="label"
                  filterOption={(input, option) => String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                  onChange={(value) => setSearchValues((prev) => ({ ...prev, [config.key]: value || "" }))}
                />
              ) : (
                <Select
                  key={config.key}
                  showSearch
                  allowClear
                  style={{ width: 220 }}
                  placeholder={`请输入${columnLabels[config.key] ?? config.key}`}
                  value={asString(searchValues[config.key]) || undefined}
                  options={(searchableOptions[config.key] ?? []).map((opt) => ({ label: opt, value: opt }))}
                  onChange={(value) => setSearchValues((prev) => ({ ...prev, [config.key]: value || "" }))}
                />
              )
            )}
          </Space>
        </Card>
      ) : null}

      {dynamicFields.length > 0 ? (
        <Card style={{ marginBottom: 16 }}>
          <Button type="primary" onClick={() => { setEditingRow(null); setDialogOpen(true); }}>
            新增记录
          </Button>
        </Card>
      ) : null}

      <EntityTable
        title={`${module.label}列表`}
        rows={filteredRows}
        columnLabels={columnLabels}
        onEdit={dynamicFields.length > 0 ? (row) => { setEditingRow(row); setDialogOpen(true); } : undefined}
        onDelete={dynamicFields.length > 0 ? handleDeleteOne : undefined}
        onBatchDelete={dynamicFields.length > 0 ? handleBatchDelete : undefined}
      />

      <Modal open={dialogOpen} onCancel={() => setDialogOpen(false)} footer={null} width={980} destroyOnClose>
        <DynamicForm
          fields={dynamicFields}
          title={editingRow ? "编辑记录" : "新增记录"}
          submitText={editingRow ? "保存" : "提交"}
          initialValues={initialValues}
          enableDraft={module.key === "projects"}
          draftStorageKey={`pmp:${module.key}:create-draft`}
          departmentCascaderOptions={module.key === "projects" ? departmentCascaderOptions : undefined}
          departmentNamePathMap={module.key === "projects" ? departmentLookup.namePaths : undefined}
          departmentIdNameMap={module.key === "projects" ? departmentLookup.names : undefined}
          onCancel={() => setDialogOpen(false)}
          onSubmit={async (payload) => {
            if (needProject && !payload.projectId) payload.projectId = selectedProjectId;
            if (module.key === "projects") {
              const projectName = String(payload.projectName ?? "").trim();
              const duplicate = rows.some(
                (row) => String(row.projectName ?? "").trim() === projectName && String(row.id) !== String(editingRow?.id ?? "")
              );
              if (duplicate) {
                message.warning("项目名称已存在，请保持唯一。");
                return;
              }
              const yearNum = Number(payload.year);
              payload.year = Number.isNaN(yearNum) ? undefined : yearNum;
            }
            if (editingRow?.id) await onUpdate(payload, module.key, String(editingRow.id));
            else await onCreate(payload, module.key);
            setDialogOpen(false);
            setEditingRow(null);
          }}
        />
      </Modal>
    </>
  );
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [schemas, setSchemas] = useState<FormSchemaMap>({});
  const [activeModuleKey, setActiveModuleKey] = useState<string>("projects");
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [user, setUser] = useState<LoginUser | null>(null);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [orgTree, setOrgTree] = useState<OrganizationNode[]>([]);
  const [dictItems, setDictItems] = useState<DictionaryItem[]>([]);
  const [systemEntities, setSystemEntities] = useState<SystemEntityMeta[]>([]);
  const [activeSystemEntityKey, setActiveSystemEntityKey] = useState("");
  const [systemRows, setSystemRows] = useState<Array<Record<string, unknown>>>([]);
  const [dashboard, setDashboard] = useState<Record<string, unknown> | null>(null);
  const [users, setUsers] = useState<Array<{ id: string; displayName: string; role: string }>>([]);
  const [members, setMembers] = useState<Array<{ id: string; userId: string; accessRole: string }>>([]);
  const [memberForm, setMemberForm] = useState<{ userId: string; accessRole: "OWNER" | "EDITOR" | "VIEWER" }>({
    userId: "",
    accessRole: "VIEWER"
  });
  const [importPath, setImportPath] = useState("/Users/xucong/Desktop/PMP项目管理工具模板.xlsx");
  const [importSummary, setImportSummary] = useState<Record<string, unknown> | null>(null);
  const [commitResult, setCommitResult] = useState<Record<string, unknown> | null>(null);
  const [stageFilter, setStageFilter] = useState<string>("");
  const [timeRange, setTimeRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);

  const moduleMap = useMemo(() => new Map(modules.map((m) => [m.key, m])), []);
  const activeModule = moduleMap.get(activeModuleKey) || modules[0];
  const currentYear = new Date().getFullYear();

  const pageTitle = useMemo(() => {
    if (location.pathname.startsWith("/dashboard")) return "项目总览";
    if (location.pathname.startsWith("/kanban")) return "任务看板";
    if (location.pathname.startsWith("/burndown")) return "燃尽图";
    if (location.pathname.startsWith("/gantt")) return "甘特图";
    if (location.pathname.startsWith("/import")) return "导入与同步";
    if (location.pathname.startsWith("/access")) return "成员权限";
    if (location.pathname.startsWith("/org")) return "组织机构维护";
    if (location.pathname.startsWith("/dict")) return "字典表维护";
    if (location.pathname.startsWith("/system-entities")) return "系统实体管理";
    return activeModule.label;
  }, [location.pathname, activeModule.label]);
  const isChartPage =
    location.pathname.startsWith("/kanban") ||
    location.pathname.startsWith("/burndown") ||
    location.pathname.startsWith("/gantt");
  const needsProjectToolbar =
    isChartPage ||
    location.pathname.startsWith("/dashboard") ||
    (location.pathname.startsWith("/module/") && !location.pathname.startsWith("/module/projects"));

  const departmentOptions = useMemo(() => {
    const names: string[] = [];
    const walk = (nodes: OrganizationNode[]) => {
      nodes.forEach((node) => {
        names.push(node.name);
        walk(node.children);
      });
    };
    walk(orgTree);
    return optionsToUnique(names);
  }, [orgTree]);
  const userOptions = useMemo(() => optionsToUnique(users.map((u) => u.displayName)), [users]);
  const yearOptions = useMemo(() => {
    const generated = Array.from({ length: 9 }, (_, idx) => String(currentYear - 2 + idx));
    return optionsToUnique(generated).sort((a, b) => Number(b) - Number(a));
  }, [currentYear]);

  const loadProjects = async () => {
    const list = (await api.list("projects")) as ProjectOption[];
    setProjects(list);
    if (!selectedProjectId && list[0]?.id) setSelectedProjectId(list[0].id);
  };

  const loadRows = async (moduleKey = activeModuleKey) => {
    const current = moduleMap.get(moduleKey) || modules[0];
    const needProjectFilter = current.endpoint !== "projects";
    const list = await api.list(current.endpoint, needProjectFilter ? selectedProjectId || undefined : undefined);
    setRows(list as Record<string, unknown>[]);
  };

  const loadDashboard = async () => {
    if (!selectedProjectId) {
      setDashboard(null);
      return;
    }
    setDashboard(await api.dashboard(selectedProjectId));
  };

  const loadMembers = async () => {
    if (!selectedProjectId || (user?.role !== "ADMIN" && user?.role !== "PM")) {
      setMembers([]);
      return;
    }
    const [ms, us] = await Promise.all([api.projectMembers(selectedProjectId), api.users()]);
    setMembers(ms);
    setUsers(us.map((u) => ({ id: u.id, displayName: u.displayName, role: u.role })));
    if (!memberForm.userId && us[0]?.id) setMemberForm((prev) => ({ ...prev, userId: us[0].id }));
  };

  const loadUserDirectory = async (role?: string) => {
    if (role !== "ADMIN" && role !== "PM") {
      setUsers([]);
      return;
    }
    const us = await api.users();
    setUsers(us.map((u) => ({ id: u.id, displayName: u.displayName, role: u.role })));
  };

  const loadSystemMeta = async (role?: string) => {
    if (role !== "ADMIN" && role !== "PM") {
      setOrgTree([]);
      setDictItems([]);
      return;
    }
    const [org, dict] = await Promise.all([api.orgTree(), api.dictItems()]);
    setOrgTree(org);
    setDictItems(dict.map((item) => ({ ...item, options: optionsToUnique(item.options) })));
  };

  const loadSystemEntities = async (role?: string, preferredKey?: string) => {
    if (role !== "ADMIN" && role !== "PM") {
      setSystemEntities([]);
      setActiveSystemEntityKey("");
      setSystemRows([]);
      return;
    }
    const metas = await api.systemEntitiesMeta();
    setSystemEntities(metas);
    if (metas.length === 0) {
      setActiveSystemEntityKey("");
      setSystemRows([]);
      return;
    }
    const selectedKey = preferredKey && metas.some((item) => item.key === preferredKey) ? preferredKey : metas[0].key;
    setActiveSystemEntityKey(selectedKey);
    setSystemRows(await api.listSystemEntityRows(selectedKey));
  };

  const init = async () => {
    const me = await api.me();
    setUser(me);
    setSchemas(await api.getFormSchemas());
    await Promise.all([loadProjects(), loadUserDirectory(me.role), loadSystemMeta(me.role), loadSystemEntities(me.role)]);
  };

  useEffect(() => {
    if (!localStorage.getItem("pmp_token")) return;
    init().catch(() => {
      localStorage.removeItem("pmp_token");
      setUser(null);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    loadRows().catch((e) => message.error(getErrorMessage(e)));
  }, [activeModuleKey, user, selectedProjectId]);

  useEffect(() => {
    if (!user) return;
    loadDashboard().catch((e) => message.error(getErrorMessage(e)));
    loadMembers().catch((e) => message.error(getErrorMessage(e)));
  }, [selectedProjectId, user]);

  useEffect(() => {
    if (!user) return;
    loadUserDirectory(user.role).catch((e) => message.error(getErrorMessage(e)));
    loadSystemMeta(user.role).catch((e) => message.error(getErrorMessage(e)));
    loadSystemEntities(user.role, activeSystemEntityKey).catch((e) => message.error(getErrorMessage(e)));
  }, [user]);

  const createRecord = async (payload: Record<string, unknown>, moduleKey: string) => {
    const current = moduleMap.get(moduleKey) || modules[0];
    await api.create(current.endpoint, payload);
    if (current.endpoint === "projects") await loadProjects();
    await loadRows(moduleKey);
    await loadDashboard();
  };

  const updateRecord = async (payload: Record<string, unknown>, moduleKey: string, id: string) => {
    const current = moduleMap.get(moduleKey) || modules[0];
    await api.update(current.endpoint, id, payload);
    if (current.endpoint === "projects") await loadProjects();
    await loadRows(moduleKey);
    await loadDashboard();
  };

  const deleteRecord = async (moduleKey: string, id: string, projectId?: string) => {
    const current = moduleMap.get(moduleKey) || modules[0];
    await api.delete(current.endpoint, id, projectId);
    if (current.endpoint === "projects") await loadProjects();
    await loadRows(moduleKey);
    await loadDashboard();
  };

  const logout = () => {
    localStorage.removeItem("pmp_token");
    setUser(null);
    setSchemas({});
    setRows([]);
    setDashboard(null);
    setOrgTree([]);
    setDictItems([]);
    setSystemEntities([]);
    setActiveSystemEntityKey("");
    setSystemRows([]);
  };

  if (!user) {
    return (
      <Suspense fallback={<Card><Spin /></Card>}>
        <LoginPanel
          onLogin={(u) => {
            setUser(u);
            api
              .getFormSchemas()
              .then(async (nextSchemas) => {
                setSchemas(nextSchemas);
                await Promise.all([loadProjects(), loadUserDirectory(u.role), loadSystemMeta(u.role), loadSystemEntities(u.role)]);
              })
              .catch((e) => message.error(getErrorMessage(e)));
          }}
        />
      </Suspense>
    );
  }

  const selectedMenuKey =
    location.pathname.startsWith("/module/") ? location.pathname : location.pathname === "/" ? "/dashboard" : location.pathname;

  const menuItems = [
    { key: "/dashboard", icon: <DashboardOutlined />, label: "项目总览" },
    { key: "/kanban", icon: <ApartmentOutlined />, label: "任务看板" },
    { key: "/burndown", icon: <LineChartOutlined />, label: "燃尽图" },
    { key: "/gantt", icon: <BarsOutlined />, label: "甘特图" },
    ...modules.map((m) => ({ key: `/module/${m.key}`, icon: <AppstoreOutlined />, label: m.label })),
    {
      key: "system",
      icon: <SettingOutlined />,
      label: "系统功能",
      children: [
        { key: "/import", icon: <FileSyncOutlined />, label: "导入与同步" },
        ...(user.role === "ADMIN" || user.role === "PM"
          ? [
              { key: "/org", icon: <TeamOutlined />, label: "组织机构维护" },
              { key: "/dict", icon: <AppstoreOutlined />, label: "字典表维护" },
              { key: "/access", icon: <SafetyCertificateOutlined />, label: "成员权限" },
              { key: "/system-entities", icon: <SettingOutlined />, label: "系统实体管理" }
            ]
          : [])
      ]
    }
  ];

  const startDate = timeRange[0] ? timeRange[0].format("YYYY-MM-DD") : undefined;
  const endDate = timeRange[1] ? timeRange[1].format("YYYY-MM-DD") : undefined;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={260}>
        <div style={{ color: "#fff", padding: 16, fontWeight: 700 }}>PMP 管理系统</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedMenuKey]}
          defaultOpenKeys={["system"]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: "#1677ff",
            paddingInline: 20,
            paddingBlock: 10,
            height: "auto",
            lineHeight: "normal",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16
          }}
        >
          <div style={{ minWidth: 0 }}>
            <Typography.Title level={4} style={{ margin: 0, color: "#fff" }}>
              PMP 项目管理系统
            </Typography.Title>
            <Typography.Text style={{ color: "rgba(255,255,255,0.92)" }}>
              {pageTitle} | 当前用户：{user.displayName}（{user.role}）
            </Typography.Text>
          </div>
          <Button icon={<LogoutOutlined />} onClick={logout} ghost>
            退出登录
          </Button>
        </Header>
        <Content style={{ padding: 16 }}>
          {needsProjectToolbar ? (
            <Card style={{ marginBottom: 16 }}>
              <Space wrap>
                <Typography.Text>项目</Typography.Text>
                <Select
                  style={{ width: 320 }}
                  value={selectedProjectId || undefined}
                  allowClear
                  placeholder="请选择项目"
                  options={projects.map((p) => ({ label: p.projectName, value: p.id }))}
                  onChange={(value) => setSelectedProjectId(value || "")}
                />
                {isChartPage ? (
                  <>
                    <Typography.Text>阶段</Typography.Text>
                    <Select
                      style={{ width: 180 }}
                      value={stageFilter || undefined}
                      allowClear
                      placeholder="全部阶段"
                      options={["启动", "规划", "执行", "验收"].map((item) => ({ label: item, value: item }))}
                      onChange={(value) => setStageFilter(value || "")}
                    />
                    <Typography.Text>时间范围</Typography.Text>
                    <RangePicker value={timeRange} onChange={(value) => setTimeRange(value ?? [null, null])} />
                  </>
                ) : null}
              </Space>
            </Card>
          ) : null}

          <Suspense fallback={<Card><Spin /></Card>}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<ProjectDashboard dashboard={dashboard} />} />
              <Route
                path="/kanban"
                element={<KanbanBoard projectId={selectedProjectId} stage={stageFilter || undefined} startDate={startDate} endDate={endDate} />}
              />
              <Route
                path="/burndown"
                element={<BurndownChart projectId={selectedProjectId} stage={stageFilter || undefined} startDate={startDate} endDate={endDate} />}
              />
              <Route
                path="/gantt"
                element={<GanttChart projectId={selectedProjectId} stage={stageFilter || undefined} startDate={startDate} endDate={endDate} />}
              />
            <Route
              path="/access"
              element={
                <ProjectMemberAccess
                  visible={(user.role === "ADMIN" || user.role === "PM") && !!selectedProjectId}
                  users={users}
                  members={members}
                  memberForm={memberForm}
                  setMemberForm={setMemberForm}
                  onSave={() => api.upsertProjectMember(selectedProjectId, memberForm).then(loadMembers).catch((e) => message.error(getErrorMessage(e)))}
                />
              }
            />
            <Route
              path="/import"
              element={
                <ImportPanel
                  importPath={importPath}
                  setImportPath={setImportPath}
                  importSummary={importSummary}
                  commitResult={commitResult}
                  onPreview={() => api.previewImport(importPath).then((r) => setImportSummary(r.summary)).catch((e) => message.error(getErrorMessage(e)))}
                  onCommit={() =>
                    api
                      .commitImport(importPath)
                      .then((r) => {
                        setCommitResult(r as unknown as Record<string, unknown>);
                        return Promise.all([loadProjects(), loadRows(), loadDashboard()]);
                      })
                      .catch((e) => message.error(getErrorMessage(e)))
                  }
                />
              }
            />
            <Route
              path="/org"
              element={
                <OrganizationManager
                  visible={user.role === "ADMIN" || user.role === "PM"}
                  tree={orgTree}
                  onAddRoot={async (name) => {
                    await api.createOrgNode({ name });
                    await loadSystemMeta(user.role);
                  }}
                  onAddChild={async (parentId, name) => {
                    await api.createOrgNode({ name, parentId });
                    await loadSystemMeta(user.role);
                  }}
                  onRename={async (id, name) => {
                    await api.renameOrgNode(id, name);
                    await loadSystemMeta(user.role);
                  }}
                  onDelete={async (id) => {
                    await api.deleteOrgNode(id);
                    await loadSystemMeta(user.role);
                  }}
                />
              }
            />
            <Route
              path="/dict"
              element={
                <DictionaryManager
                  visible={user.role === "ADMIN" || user.role === "PM"}
                  items={dictItems}
                  onAddOption={async (dictKey, value) => {
                    await api.addDictOption(dictKey, value);
                    await loadSystemMeta(user.role);
                  }}
                  onRemoveOption={async (dictKey, value) => {
                    await api.removeDictOption(dictKey, value);
                    await loadSystemMeta(user.role);
                  }}
                />
              }
            />
            <Route
              path="/system-entities"
              element={
                <SystemEntityManager
                  visible={user.role === "ADMIN" || user.role === "PM"}
                  entities={systemEntities}
                  activeEntityKey={activeSystemEntityKey}
                  rows={systemRows}
                  onChangeEntity={async (entityKey) => {
                    setActiveSystemEntityKey(entityKey);
                    setSystemRows(await api.listSystemEntityRows(entityKey));
                  }}
                  onCreate={async (entityKey, payload) => {
                    await api.createSystemEntityRow(entityKey, payload);
                    setSystemRows(await api.listSystemEntityRows(entityKey));
                  }}
                  onUpdate={async (entityKey, id, payload) => {
                    await api.updateSystemEntityRow(entityKey, id, payload);
                    setSystemRows(await api.listSystemEntityRows(entityKey));
                  }}
                  onDelete={async (entityKey, id) => {
                    await api.deleteSystemEntityRow(entityKey, id);
                    setSystemRows(await api.listSystemEntityRows(entityKey));
                  }}
                />
              }
            />
            <Route
              path="/module/:moduleKey"
              element={
                <ModuleRoute
                  moduleMap={moduleMap}
                  schemas={schemas}
                  dictItems={dictItems}
                  departmentOptions={departmentOptions}
                  departmentTree={orgTree}
                  userOptions={userOptions}
                  yearOptions={yearOptions}
                  selectedProjectId={selectedProjectId}
                  rows={rows}
                  onModuleChange={setActiveModuleKey}
                  onCreate={createRecord}
                  onUpdate={updateRecord}
                  onDelete={deleteRecord}
                />
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </Content>
      </Layout>
    </Layout>
  );
}
