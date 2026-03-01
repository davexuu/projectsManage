import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { Button, Card, Cascader, Modal, Popconfirm, Select, Space, Tag, Upload, message } from "antd";
import { api, ProjectAttachmentItem } from "../../api/client";
import type { UploadProps } from "antd";
import { AppTable } from "../../components/AppTable";
import { DynamicForm } from "../../components/DynamicForm";
import { EntityTable } from "../../components/EntityTable";
import { moduleFeatureFlags } from "./featureFlags";
import type { DictionaryItem } from "../system/DictionaryManager";
import type { OrganizationNode } from "../system/OrganizationManager";
import { FieldType, FormField, FormSchemaMap, ModuleConfig } from "../../types";
import { getErrorMessage } from "../../utils/errors";

type SearchMode = "text" | "select" | "user" | "multi-user" | "year";

interface SearchFieldConfig {
  key: string;
  mode: SearchMode;
}

const moduleSearchFields: Record<string, SearchFieldConfig[]> = {
  projects: []
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

type ProjectAttachmentCategory = "prototype" | "prd" | "kickoff" | "other";

const attachmentCategoryOptions: Array<{ label: string; value: ProjectAttachmentCategory; color: string }> = [
  { label: "原型", value: "prototype", color: "geekblue" },
  { label: "PRD", value: "prd", color: "cyan" },
  { label: "启动资料", value: "kickoff", color: "gold" },
  { label: "其他", value: "other", color: "default" }
];

function formatAttachmentSize(sizeText: string) {
  const size = Number(sizeText);
  if (!Number.isFinite(size) || size < 0) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
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

interface Props {
  moduleMap: Map<string, ModuleConfig>;
  schemas: FormSchemaMap;
  projects: Array<{ id: string; projectName: string }>;
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
  onReload: (moduleKey: string) => Promise<void>;
  canManageProjectMembers: boolean;
  memberUserOptions: Array<{ id: string; displayName: string; role: string }>;
}

export function ModuleRoute({
  moduleMap,
  schemas,
  projects,
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
  onDelete,
  onReload,
  canManageProjectMembers,
  memberUserOptions
}: Props) {
  const params = useParams();
  const location = useLocation();
  const moduleKey = params.moduleKey || "projects";
  const module = moduleMap.get(moduleKey);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<Record<string, unknown> | null>(null);
  const [searchValues, setSearchValues] = useState<Record<string, string | string[]>>({});
  const [departmentPath, setDepartmentPath] = useState<string[]>([]);
  const [memberModal, setMemberModal] = useState<{ open: boolean; projectId: string; projectName: string }>({
    open: false,
    projectId: "",
    projectName: ""
  });
  const [projectMemberRows, setProjectMemberRows] = useState<Array<{
    userId: string;
    displayName: string;
    role: string;
    accessRole: "OWNER" | "EDITOR" | "VIEWER";
  }>>([]);
  const [memberSubmitting, setMemberSubmitting] = useState(false);
  const [attachmentModal, setAttachmentModal] = useState<{ open: boolean; projectId: string; projectName: string }>({
    open: false,
    projectId: "",
    projectName: ""
  });
  const [attachmentRows, setAttachmentRows] = useState<ProjectAttachmentItem[]>([]);
  const [attachmentLoading, setAttachmentLoading] = useState(false);
  const [attachmentCategory, setAttachmentCategory] = useState<ProjectAttachmentCategory>("prototype");
  const [attachmentUploading, setAttachmentUploading] = useState(false);

  useEffect(() => {
    if (module) {
      onModuleChange(moduleKey);
      setDialogOpen(false);
      setEditingRow(null);
      setSearchValues({});
      setDepartmentPath([]);
      setMemberModal({ open: false, projectId: "", projectName: "" });
      setProjectMemberRows([]);
      setAttachmentModal({ open: false, projectId: "", projectName: "" });
      setAttachmentRows([]);
      setAttachmentCategory("prototype");
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
    const query = new URLSearchParams(location.search);
    const baseRows = rows.filter((row) => {
      if (module.key === "wbs" && query.get("overdue") === "true") {
        const end = new Date(String(row.plannedEndDate ?? "")).getTime();
        return String(row.currentStatus ?? "") !== "已完成" && Number.isFinite(end) && end < Date.now();
      }
      if (module.key === "risks") {
        if (query.get("onlyOpen") === "true" && String(row.currentStatus ?? "") === "已完成") return false;
        if (query.get("escalated") === "true" && String(row.escalateToManagement ?? "") !== "是") return false;
      }
      if (module.key === "statusAssessments" && query.get("latest") === "true") {
        return row === rows[0];
      }
      return true;
    });

    const projectRows =
      module.key === "projects"
        ? baseRows.filter((row) => String(row.year ?? "").trim() === String(new Date().getFullYear()))
        : baseRows;
    if (searchFieldConfigs.length === 0) return projectRows;
    return projectRows.filter((row) =>
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
  }, [rows, searchFieldConfigs, searchValues, departmentPath, departmentLookup, location.search, module.key]);

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

  const moduleFields = useMemo<FormField[]>(() => {
    if (module.key === "projects") return dynamicFields;
    if (module.key === "wbs") {
      return fields.map((field) => {
        if (field.key === "projectId" && projects.length > 0) {
          return {
            ...field,
            label: "项目名称",
            type: "select" as FieldType,
            options: projects.map((project) => ({ label: project.projectName, value: project.id }))
          };
        }
        if (field.key === "taskOwner" && userOptions.length > 0) {
          return { ...field, type: "select" as FieldType, options: userOptions };
        }
        return field;
      });
    }
    return fields;
  }, [module.key, dynamicFields, fields, userOptions, projects]);

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

  const openMemberModal = async (row: Record<string, unknown>) => {
    const projectId = String(row.id ?? "").trim();
    if (!projectId) {
      message.warning("项目ID无效");
      return;
    }
    const projectName = String(row.projectName ?? "").trim() || "未命名项目";
    try {
      const members = await api.projectMembers(projectId);
      const existedRoleMap = new Map<string, "OWNER" | "EDITOR" | "VIEWER">(
        members.map((item) => [item.userId, item.accessRole as "OWNER" | "EDITOR" | "VIEWER"])
      );
      const ownerName = String(row.projectOwner ?? "").trim();
      const participantNames = splitUserValues(row.participants);
      const declaredNames = optionsToUnique([ownerName, ...participantNames]);
      const declaredUsers = memberUserOptions.filter((item) => declaredNames.includes(item.displayName));
      const declaredUserIds = new Set(declaredUsers.map((item) => item.id));
      members.forEach((item) => declaredUserIds.add(item.userId));
      const modalRows = Array.from(declaredUserIds)
        .map((userId) => {
          const user = memberUserOptions.find((item) => item.id === userId);
          return {
            userId,
            displayName: user?.displayName ?? userId,
            role: user?.role ?? "-",
            accessRole: existedRoleMap.get(userId) ?? "VIEWER"
          };
        })
        .sort((a, b) => a.displayName.localeCompare(b.displayName, "zh-CN"));
      setProjectMemberRows(modalRows);
      setMemberModal({ open: true, projectId, projectName });
      const unresolvedNames = declaredNames.filter((name) => !declaredUsers.some((user) => user.displayName === name));
      if (unresolvedNames.length > 0) {
        message.warning(`以下成员未匹配系统用户：${unresolvedNames.join("、")}`);
      }
    } catch (e) {
      message.error(getErrorMessage(e));
    }
  };

  const saveProjectMembers = async () => {
    if (!memberModal.projectId) return;
    if (projectMemberRows.length === 0) return;
    try {
      setMemberSubmitting(true);
      await Promise.all(
        projectMemberRows.map((member) =>
          api.upsertProjectMember(memberModal.projectId, {
            userId: member.userId,
            accessRole: member.accessRole
          })
        )
      );
      message.success("成员权限已保存");
    } catch (e) {
      message.error(getErrorMessage(e));
    } finally {
      setMemberSubmitting(false);
    }
  };

  const loadProjectAttachments = async (projectId: string) => {
    try {
      setAttachmentLoading(true);
      setAttachmentRows(await api.listProjectAttachments(projectId));
    } catch (e) {
      message.error(getErrorMessage(e));
    } finally {
      setAttachmentLoading(false);
    }
  };

  const openAttachmentModal = async (row: Record<string, unknown>) => {
    const projectId = String(row.id ?? "").trim();
    if (!projectId) {
      message.warning("项目ID无效");
      return;
    }
    const projectName = String(row.projectName ?? "").trim() || "未命名项目";
    setAttachmentModal({ open: true, projectId, projectName });
    await loadProjectAttachments(projectId);
  };

  const handleAttachmentUpload: NonNullable<UploadProps["customRequest"]> = async (options) => {
    const file = options.file;
    if (!(file instanceof File)) {
      options.onError?.(new Error("仅支持文件上传"));
      return;
    }
    if (!attachmentModal.projectId) {
      options.onError?.(new Error("请选择项目后上传"));
      return;
    }
    try {
      setAttachmentUploading(true);
      await api.uploadProjectAttachment(attachmentModal.projectId, attachmentCategory, file);
      await loadProjectAttachments(attachmentModal.projectId);
      message.success(`已上传：${file.name}`);
      options.onSuccess?.({}, file);
    } catch (e) {
      const err = e instanceof Error ? e : new Error("上传失败");
      message.error(getErrorMessage(e));
      options.onError?.(err);
    } finally {
      setAttachmentUploading(false);
    }
  };

  const handleAttachmentDownload = async (row: ProjectAttachmentItem) => {
    try {
      const { blob, fileName } = await api.downloadProjectAttachment(row.projectId, row.id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName || row.fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      message.error(getErrorMessage(e));
    }
  };

  const handleAttachmentDelete = async (row: ProjectAttachmentItem) => {
    try {
      await api.deleteProjectAttachment(row.projectId, row.id);
      await loadProjectAttachments(row.projectId);
      message.success("附件已删除");
    } catch (e) {
      message.error(getErrorMessage(e));
    }
  };

  return (
    <>
      {needProject && !selectedProjectId ? <Card style={{ marginBottom: 16 }}>请选择项目后再录入该模块。</Card> : null}

      {searchFieldConfigs.length > 0 ? (
        <Card title="筛选" style={{ marginBottom: 16 }}>
          <Space wrap>
            {searchFieldConfigs.map((config) =>
              config.mode === "select" ? (
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

      {moduleFields.length > 0 ? (
        <Card style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            disabled={needProject && !selectedProjectId}
            onClick={() => {
              setEditingRow(null);
              setDialogOpen(true);
            }}
          >
            新增记录
          </Button>
        </Card>
      ) : null}

      <EntityTable
        title={`${module.label}列表`}
        rows={filteredRows}
        columnLabels={columnLabels}
        tableVariant={moduleFeatureFlags.elementLikeTableTheme && module.key === "wbs" ? "element-like" : "default"}
        onEdit={moduleFields.length > 0 ? (row) => { setEditingRow(row); setDialogOpen(true); } : undefined}
        onDelete={moduleFields.length > 0 ? handleDeleteOne : undefined}
        onBatchDelete={moduleFields.length > 0 ? handleBatchDelete : undefined}
        extraRowActions={
          module.key === "projects" && canManageProjectMembers
            ? (row) => (
                <>
                  <Button type="link" size="small" onClick={() => openAttachmentModal(row)}>
                    启动附件
                  </Button>
                  <Button type="link" size="small" onClick={() => openMemberModal(row)}>
                    成员权限
                  </Button>
                </>
              )
            : module.key === "projects"
              ? (row) => (
                  <Button type="link" size="small" onClick={() => openAttachmentModal(row)}>
                    启动附件
                  </Button>
                )
            : undefined
        }
      />

      <Modal open={dialogOpen} onCancel={() => setDialogOpen(false)} footer={null} width={980} destroyOnClose>
        <DynamicForm
          fields={moduleFields}
          moduleKey={module.key}
          title={
            module.key === "wbs"
              ? editingRow
                ? "编辑WBS分解项"
                : moduleFeatureFlags.wbsEnhancedEntry
                  ? "WBS任务分解录入（批量）"
                  : "新增WBS分解项"
              : editingRow
                ? "编辑记录"
                : "新增记录"
          }
          submitText={editingRow ? "保存" : "提交"}
          initialValues={initialValues}
          enableDraft={module.key === "projects" || (module.key === "wbs" && moduleFeatureFlags.wbsEnhancedEntry)}
          draftStorageKey={`pmp:${module.key}:${selectedProjectId || "global"}:create-draft`}
          departmentCascaderOptions={module.key === "projects" ? departmentCascaderOptions : undefined}
          departmentNamePathMap={module.key === "projects" ? departmentLookup.namePaths : undefined}
          departmentIdNameMap={module.key === "projects" ? departmentLookup.names : undefined}
          onBatchSubmit={
            module.key === "wbs" && moduleFeatureFlags.wbsEnhancedEntry && !editingRow
              ? async (payloads) => {
                  const projectId = String(payloads[0]?.projectId ?? selectedProjectId ?? "").trim();
                  if (!projectId) {
                    message.warning("请先选择项目后再批量提交");
                    return;
                  }
                  const normalized = payloads.map((payload) => ({ ...payload, projectId }));
                  const validation = await api.validateWbsPlan({ projectId, items: normalized });
                  if (!validation.ok) {
                    const first = validation.conflicts[0];
                    message.warning(first ? `第 ${first.rowIndex + 1} 行：${first.message}` : "存在计划冲突，请检查后重试");
                    return;
                  }
                  await api.batchCreateWbs({ projectId, items: normalized });
                  await onReload(module.key);
                  setDialogOpen(false);
                  setEditingRow(null);
                  message.success(`已提交 ${payloads.length} 条WBS分解项`);
                }
              : undefined
          }
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

      <Modal
        open={memberModal.open}
        title={`成员权限 - ${memberModal.projectName}`}
        onCancel={() => setMemberModal({ open: false, projectId: "", projectName: "" })}
        onOk={saveProjectMembers}
        okText="保存全部"
        confirmLoading={memberSubmitting}
        destroyOnClose
      >
        <AppTable
          rowKey="userId"
          columns={[
            {
              title: "成员",
              dataIndex: "displayName",
              key: "displayName"
            },
            { title: "系统角色", dataIndex: "role", key: "role", width: 140 },
            {
              title: "项目权限",
              key: "accessRole",
              width: 200,
              render: (_, row: { userId: string; accessRole: "OWNER" | "EDITOR" | "VIEWER" }) => (
                <Select
                  value={row.accessRole}
                  options={[
                    { label: "OWNER", value: "OWNER" },
                    { label: "EDITOR", value: "EDITOR" },
                    { label: "VIEWER", value: "VIEWER" }
                  ]}
                  style={{ width: 160 }}
                  onChange={(value) =>
                    setProjectMemberRows((prev) =>
                      prev.map((item) =>
                        item.userId === row.userId
                          ? { ...item, accessRole: value as "OWNER" | "EDITOR" | "VIEWER" }
                          : item
                      )
                    )
                  }
                />
              )
            }
          ]}
          dataSource={projectMemberRows}
          pagination={{ pageSize: 8 }}
        />
      </Modal>

      <Modal
        open={attachmentModal.open}
        title={`启动附件 - ${attachmentModal.projectName}`}
        onCancel={() => setAttachmentModal({ open: false, projectId: "", projectName: "" })}
        footer={null}
        width={920}
        destroyOnClose
      >
        <Card size="small" style={{ marginBottom: 12 }}>
          <Space wrap>
            <Select
              value={attachmentCategory}
              style={{ width: 180 }}
              options={attachmentCategoryOptions.map((item) => ({ label: item.label, value: item.value }))}
              onChange={(value) => setAttachmentCategory(value as ProjectAttachmentCategory)}
            />
            <Upload
              showUploadList={false}
              customRequest={handleAttachmentUpload}
              disabled={attachmentUploading || attachmentLoading}
            >
              <Button type="primary" loading={attachmentUploading}>
                上传附件
              </Button>
            </Upload>
          </Space>
        </Card>

        <AppTable
          rowKey="id"
          loading={attachmentLoading}
          columns={[
            {
              title: "类别",
              key: "category",
              width: 120,
              render: (_, row: ProjectAttachmentItem) => {
                const category = attachmentCategoryOptions.find((item) => item.value === row.category);
                return <Tag color={category?.color}>{category?.label ?? row.category}</Tag>;
              }
            },
            { title: "文件名", dataIndex: "fileName", key: "fileName" },
            {
              title: "大小",
              key: "fileSize",
              width: 120,
              render: (_, row: ProjectAttachmentItem) => formatAttachmentSize(row.fileSize)
            },
            {
              title: "上传时间",
              dataIndex: "createdAt",
              key: "createdAt",
              width: 180,
              render: (value: unknown) => {
                const date = new Date(String(value ?? ""));
                if (Number.isNaN(date.getTime())) return "-";
                return date.toLocaleString("zh-CN", { hour12: false });
              }
            },
            {
              title: "操作",
              key: "actions",
              width: 160,
              render: (_, row: ProjectAttachmentItem) => (
                <Space size={6}>
                  <Button type="link" size="small" onClick={() => handleAttachmentDownload(row)}>
                    下载
                  </Button>
                  <Popconfirm
                    title="确认删除该附件？"
                    onConfirm={() => handleAttachmentDelete(row)}
                    okButtonProps={{ danger: true }}
                  >
                    <Button type="link" size="small" danger>
                      删除
                    </Button>
                  </Popconfirm>
                </Space>
              )
            }
          ]}
          dataSource={attachmentRows}
          pagination={{ pageSize: 8 }}
        />
      </Modal>
    </>
  );
}
