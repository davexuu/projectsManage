import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  ApartmentOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  BarsOutlined,
  CompassOutlined,
  DashboardOutlined,
  FileSyncOutlined,
  FlagOutlined,
  HomeOutlined,
  LogoutOutlined,
  LineChartOutlined,
  NotificationOutlined,
  RocketOutlined,
  SettingOutlined,
  TeamOutlined
} from "@ant-design/icons";
import { Button, Card, DatePicker, Layout, Menu, Select, Space, Spin, Typography, message } from "antd";
import type { Dayjs } from "dayjs";
import { api, SystemEntityMeta } from "./api/client";
import type { LoginUser } from "./features/auth/LoginPanel";
import type { DictionaryItem } from "./features/system/DictionaryManager";
import type { OrganizationNode } from "./features/system/OrganizationManager";
import { ModuleRoute } from "./features/module/ModuleRoute";
import { PROCESS_NAVIGATION, type ProcessKey, resolveProcessMenuKey } from "./features/process/navigation-config";
import { FormSchemaMap, ModuleConfig } from "./types";
import { getErrorMessage } from "./utils/errors";

const { Header, Sider, Content } = Layout;
const { RangePicker } = DatePicker;

const LoginPanel = lazy(() => import("./features/auth/LoginPanel").then((m) => ({ default: m.LoginPanel })));
const ImportPanel = lazy(() => import("./features/import/ImportPanel").then((m) => ({ default: m.ImportPanel })));
const KanbanBoard = lazy(() => import("./features/kanban/KanbanBoard").then((m) => ({ default: m.KanbanBoard })));
const BurndownChart = lazy(() => import("./features/charts/BurndownChart").then((m) => ({ default: m.BurndownChart })));
const GanttChart = lazy(() => import("./features/charts/GanttChart").then((m) => ({ default: m.GanttChart })));
const DictionaryManager = lazy(() => import("./features/system/DictionaryManager").then((m) => ({ default: m.DictionaryManager })));
const OrganizationManager = lazy(() => import("./features/system/OrganizationManager").then((m) => ({ default: m.OrganizationManager })));
const SystemEntityManager = lazy(() => import("./features/system/SystemEntityManager").then((m) => ({ default: m.SystemEntityManager })));
const UserManager = lazy(() => import("./features/system/UserManager").then((m) => ({ default: m.UserManager })));
const MissionControlPage = lazy(() =>
  import("./features/mission-control/MissionControlPage").then((m) => ({ default: m.MissionControlPage }))
);
const WorkspacePanel = lazy(() =>
  import("./features/workspace/WorkspacePanel").then((m) => ({ default: m.WorkspacePanel }))
);
const ProcessWorkspace = lazy(() =>
  import("./features/process/ProcessWorkspace").then((m) => ({ default: m.ProcessWorkspace }))
);
const ProjectReportEditor = lazy(() =>
  import("./features/reports/ProjectReportEditor").then((m) => ({ default: m.ProjectReportEditor }))
);
const PlanningStudio = lazy(() =>
  import("./features/planning/PlanningStudio").then((m) => ({ default: m.PlanningStudio }))
);

const modules: ModuleConfig[] = [
  { key: "projects", label: "项目立项卡", endpoint: "projects" },
  { key: "wbs", label: "WBS任务分解", endpoint: "wbs" },
  { key: "milestones", label: "里程碑计划", endpoint: "milestones" },
  { key: "progressRecords", label: "推进记录", endpoint: "progress-records" },
  { key: "statusAssessments", label: "项目状态评估", endpoint: "status-assessments" },
  { key: "risks", label: "风险问题台账", endpoint: "risks" },
  { key: "changes", label: "变更申请", endpoint: "changes" }
];

function optionsToUnique(options: string[]) {
  return [...new Set(options.map((opt) => opt.trim()).filter(Boolean))];
}

interface ProjectOption {
  id: string;
  projectName: string;
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
  const [importPath, setImportPath] = useState("/Users/xucong/Desktop/PMP项目管理工具模板.xlsx");
  const [importSummary, setImportSummary] = useState<Record<string, unknown> | null>(null);
  const [commitResult, setCommitResult] = useState<Record<string, unknown> | null>(null);
  const [stageFilter, setStageFilter] = useState<string>("");
  const [timeRange, setTimeRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);

  const moduleMap = useMemo(() => new Map(modules.map((m) => [m.key, m])), []);
  const activeModule = moduleMap.get(activeModuleKey) || modules[0];
  const currentYear = new Date().getFullYear();

  const pageTitle = useMemo(() => {
    if (location.pathname.startsWith("/mission-control")) return "Mission Control";
    if (location.pathname.startsWith("/workspace/my-projects")) return "工作台 / 我的项目";
    if (location.pathname.startsWith("/workspace/todo-alerts")) return "工作台 / 待办与风险预警";
    if (location.pathname.startsWith("/workspace/milestone-calendar")) return "工作台 / 里程碑日历";
    if (location.pathname.startsWith("/process/start")) return "启动过程";
    if (location.pathname.startsWith("/process/plan")) return "规划过程";
    if (location.pathname.startsWith("/process/execute")) return "执行过程";
    if (location.pathname.startsWith("/process/monitor/reports")) return "监控过程 / 周报月报";
    if (location.pathname.startsWith("/process/monitor")) return "监控过程";
    if (location.pathname.startsWith("/process/close")) return "收尾过程";
    if (location.pathname.startsWith("/planning-studio")) return "计划编排工作台";
    if (location.pathname.startsWith("/dashboard")) return "项目总览";
    if (location.pathname.startsWith("/kanban")) return "任务看板";
    if (location.pathname.startsWith("/burndown")) return "燃尽图";
    if (location.pathname.startsWith("/gantt")) return "甘特图";
    if (location.pathname.startsWith("/import")) return "导入与同步";
    if (location.pathname.startsWith("/org")) return "组织机构维护";
    if (location.pathname.startsWith("/dict")) return "字典表维护";
    if (location.pathname.startsWith("/user-mgmt")) return "用户管理";
    if (location.pathname.startsWith("/system-entities")) return "系统实体管理";
    return activeModule.label;
  }, [location.pathname, activeModule.label]);
  const isChartPage =
    location.pathname.startsWith("/kanban") ||
    location.pathname.startsWith("/burndown") ||
    location.pathname.startsWith("/gantt");
  const isProjectSpacePage =
    location.pathname.startsWith("/mission-control") ||
    location.pathname.startsWith("/planning-studio") ||
    location.pathname.startsWith("/process/") ||
    (location.pathname.startsWith("/module/") && !location.pathname.startsWith("/module/projects")) ||
    location.pathname.startsWith("/kanban") ||
    location.pathname.startsWith("/burndown") ||
    location.pathname.startsWith("/gantt");
  const needsProjectToolbar =
    isChartPage ||
    location.pathname.startsWith("/dashboard") ||
    isProjectSpacePage;

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
    setSelectedProjectId((prev) => {
      if (list.some((item) => item.id === prev)) return prev;
      return list[0]?.id ?? "";
    });
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
  }, [selectedProjectId, user]);

  useEffect(() => {
    if (!user) return;
    loadUserDirectory(user.role).catch((e) => message.error(getErrorMessage(e)));
    loadSystemMeta(user.role).catch((e) => message.error(getErrorMessage(e)));
    loadSystemEntities(user.role, activeSystemEntityKey).catch((e) => message.error(getErrorMessage(e)));
  }, [user]);

  useEffect(() => {
    const queryProjectId = new URLSearchParams(location.search).get("projectId");
    if (!queryProjectId) return;
    setSelectedProjectId((prev) => (prev === queryProjectId ? prev : queryProjectId));
  }, [location.search]);

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
    if (current.endpoint === "projects") {
      await loadProjects();
      await loadRows(moduleKey);
      return;
    }
    await loadRows(moduleKey);
    await loadDashboard();
  };

  const reloadModuleData = async (moduleKey: string) => {
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

  const processBasePathByKey: Record<ProcessKey, string> = {
    start: "/process/start",
    plan: "/process/plan",
    execute: "/process/execute",
    monitor: "/process/monitor",
    close: "/process/close"
  };
  const processIconByKey: Record<ProcessKey, JSX.Element> = {
    start: <FlagOutlined />,
    plan: <BarsOutlined />,
    execute: <RocketOutlined />,
    monitor: <LineChartOutlined />,
    close: <ApartmentOutlined />
  };
  const processSubMenuItems = (Object.keys(PROCESS_NAVIGATION) as ProcessKey[]).map((processKey) => {
    const section = PROCESS_NAVIGATION[processKey];
    const processPath = processBasePathByKey[processKey];
    return {
      key: processPath,
      icon: processIconByKey[processKey],
      label: section.title.replace("过程", ""),
      children: section.groups.flatMap((group) =>
        group.items.map((item) => ({
          key: `${processPath}::${item.key}`,
          icon: <AppstoreOutlined />,
          label: item.label,
          routePath: item.path
        }))
      )
    };
  });
  const processSubMenuKeyToPath = new Map<string, string>(
    processSubMenuItems.flatMap((processItem) =>
      (processItem.children ?? []).map((child) => [String(child.key), String((child as { routePath: string }).routePath)] as const)
    )
  );

  const selectedMenuKey = (() => {
    if (location.pathname.startsWith("/workspace/")) return location.pathname;
    if (location.pathname.startsWith("/mission-control")) return "/mission-control";
    const matchedProcessEntry = Array.from(processSubMenuKeyToPath.entries())
      .filter(([, path]) => location.pathname === path || location.pathname.startsWith(`${path}/`))
      .sort((a, b) => b[1].length - a[1].length)[0];
    if (matchedProcessEntry) return matchedProcessEntry[0];
    if (location.pathname.startsWith("/process/")) return resolveProcessMenuKey(location.pathname);
    if (location.pathname.startsWith("/dashboard")) return "/mission-control";
    return location.pathname === "/" ? "/mission-control" : location.pathname;
  })();

  const menuItems = [
    {
      key: "workspace",
      icon: <HomeOutlined />,
      label: "工作台",
      children: [
        { key: "/workspace/my-projects", icon: <AppstoreOutlined />, label: "我的项目" },
        { key: "/workspace/todo-alerts", icon: <NotificationOutlined />, label: "待办/风险预警" },
        { key: "/workspace/milestone-calendar", icon: <CalendarOutlined />, label: "里程碑日历" }
      ]
    },
    {
      key: "project-space",
      icon: <CompassOutlined />,
      label: "项目空间",
      children: [
        { key: "/mission-control", icon: <DashboardOutlined />, label: "Mission Control" },
        ...processSubMenuItems
      ]
    },
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
              { key: "/user-mgmt", icon: <TeamOutlined />, label: "用户管理" },
              { key: "/system-entities", icon: <SettingOutlined />, label: "系统实体管理" }
            ]
          : [])
      ]
    }
  ];

  const startDate = timeRange[0] ? timeRange[0].format("YYYY-MM-DD") : undefined;
  const endDate = timeRange[1] ? timeRange[1].format("YYYY-MM-DD") : undefined;

  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      <Sider width={260} style={{ height: "100vh", overflow: "auto" }}>
        <div style={{ color: "#fff", padding: 16, fontWeight: 700 }}>PMP 管理系统</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedMenuKey]}
          defaultOpenKeys={[
            "workspace",
            "project-space",
            "system",
            "/process/start",
            "/process/plan",
            "/process/execute",
            "/process/monitor",
            "/process/close"
          ]}
          items={menuItems}
          onClick={({ key }) => navigate(processSubMenuKeyToPath.get(String(key)) || String(key))}
        />
      </Sider>
      <Layout style={{ minWidth: 0, overflow: "hidden" }}>
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
        <Content style={{ padding: 16, overflow: "auto" }}>
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
                    <RangePicker
                      value={timeRange}
                      placeholder={["开始日期", "结束日期"]}
                      onChange={(value) => setTimeRange(value ?? [null, null])}
                    />
                  </>
                ) : null}
              </Space>
            </Card>
          ) : null}

          <Suspense fallback={<Card><Spin /></Card>}>
            <Routes>
              <Route path="/" element={<Navigate to="/mission-control" replace />} />
              <Route path="/workspace/my-projects" element={<WorkspacePanel mode="my-projects" projects={projects} dashboard={dashboard} />} />
              <Route path="/workspace/todo-alerts" element={<WorkspacePanel mode="todo-alerts" projects={projects} dashboard={dashboard} />} />
              <Route
                path="/workspace/milestone-calendar"
                element={<WorkspacePanel mode="milestone-calendar" projects={projects} dashboard={dashboard} />}
              />
              <Route
                path="/mission-control"
                element={
                  <MissionControlPage
                    role={user.role as "ADMIN" | "PM" | "MEMBER"}
                    projectId={selectedProjectId}
                    dashboard={dashboard}
                    onNavigate={navigate}
                  />
                }
              />
              <Route
                path="/planning-studio"
                element={<PlanningStudio projectId={selectedProjectId} projects={projects} schemas={schemas} />}
              />
              <Route path="/module/wbs" element={<Navigate to="/planning-studio" replace />} />
              <Route path="/module/milestones" element={<Navigate to="/planning-studio" replace />} />
              <Route path="/process/start" element={<ProcessWorkspace processKey="start" projectId={selectedProjectId} onNavigate={navigate} />} />
              <Route path="/process/plan" element={<ProcessWorkspace processKey="plan" projectId={selectedProjectId} onNavigate={navigate} />} />
              <Route
                path="/process/execute"
                element={<ProcessWorkspace processKey="execute" projectId={selectedProjectId} onNavigate={navigate} />}
              />
              <Route
                path="/process/monitor"
                element={<ProcessWorkspace processKey="monitor" projectId={selectedProjectId} onNavigate={navigate} />}
              />
              <Route
                path="/process/monitor/reports"
                element={
                  <ProjectReportEditor
                    projectId={selectedProjectId}
                    reportType={(new URLSearchParams(location.search).get("reportType") as "WEEKLY" | "MONTHLY" | null) || undefined}
                    period={new URLSearchParams(location.search).get("period") || undefined}
                  />
                }
              />
              <Route path="/process/close" element={<ProcessWorkspace processKey="close" projectId={selectedProjectId} onNavigate={navigate} />} />
              <Route path="/dashboard" element={<Navigate to="/mission-control" replace />} />
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
            <Route path="/legacy/dashboard" element={<Navigate to="/mission-control" replace />} />
            <Route path="/legacy/wbs" element={<Navigate to="/planning-studio" replace />} />
            <Route path="/legacy/milestones" element={<Navigate to="/planning-studio" replace />} />
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
              path="/user-mgmt"
              element={
                <UserManager
                  visible={user.role === "ADMIN" || user.role === "PM"}
                  role={user.role as "ADMIN" | "PM" | "MEMBER"}
                  orgTree={orgTree}
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
                  projects={projects}
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
                  onReload={reloadModuleData}
                  canManageProjectMembers={user.role === "ADMIN" || user.role === "PM"}
                  memberUserOptions={users}
                />
              }
            />
            <Route path="/legacy/kanban" element={<Navigate to="/kanban" replace />} />
            <Route path="/legacy/burndown" element={<Navigate to="/burndown" replace />} />
            <Route path="/legacy/gantt" element={<Navigate to="/planning-studio" replace />} />
            <Route path="*" element={<Navigate to="/mission-control" replace />} />
            </Routes>
          </Suspense>
        </Content>
      </Layout>
    </Layout>
  );
}
