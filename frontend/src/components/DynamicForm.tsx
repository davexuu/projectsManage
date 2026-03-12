import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  Alert,
  Button,
  Cascader,
  Card,
  Checkbox,
  Modal,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { InfoCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { ApiError } from "../api/client";
import type { FormField, FormFieldOption } from "../types";
import { parseFormError } from "../utils/errors";

interface DepartmentCascaderOption {
  value: string;
  label: string;
  children?: DepartmentCascaderOption[];
}

interface Props {
  fields: FormField[];
  title?: string;
  submitText?: string;
  initialValues?: Record<string, unknown>;
  enableDraft?: boolean;
  draftStorageKey?: string;
  moduleKey?: string;
  departmentCascaderOptions?: DepartmentCascaderOption[];
  departmentNamePathMap?: Map<string, string[]>;
  departmentIdNameMap?: Map<string, string>;
  onSubmit?: (payload: Record<string, unknown>) => Promise<void>;
  onBatchSubmit?: (payloads: Record<string, unknown>[]) => Promise<void>;
  onBatchValidate?: (payloads: Record<string, unknown>[]) => Promise<{
    ok: boolean;
    conflicts: Array<{ rowIndex: number; field: string; message: string; relatedTaskId?: string }>;
  }>;
  onGenerateWbsSuggestions?: (
    prompt: string,
    options?: {
      mode: SuggestionMode;
      itemType: SuggestionItemType;
      plannedStartDate: string;
      plannedEndDate: string;
    }
  ) => Promise<{
    itemType?: SuggestionItemType;
    intent: string;
    requirementSummary?: string;
    todos?: Array<{
      title: string;
      workPackage: string;
      stage: string;
      detail: string;
      deliverable: string;
    }>;
    mode?: "light" | "standard" | "complete";
    reason: string;
    wbsDrafts?: Record<string, unknown>[];
    items: Record<string, unknown>[];
  }>;
  predecessorOptions?: Array<{ label: string; value: string }>;
  onCancel?: () => void;
}

function toFormValue(field: FormField, value: unknown, departmentNamePathMap?: Map<string, string[]>) {
  if (value === null || value === undefined) return undefined;
  if (field.key === "leadDepartment" && departmentNamePathMap) {
    const text = String(value).trim();
    return text ? departmentNamePathMap.get(text) : undefined;
  }
  if (field.key === "year") {
    const text = String(value).trim();
    return text ? dayjs(text, "YYYY") : undefined;
  }
  if (field.type === "date") {
    const text = String(value);
    return text ? dayjs(text) : undefined;
  }
  if (field.type === "multiselect") {
    if (Array.isArray(value)) return value.map(String);
    return String(value)
      .split(/[;,，、]/)
      .map((v) => v.trim())
      .filter(Boolean);
  }
  if (field.key === "predecessorTaskIds") {
    if (Array.isArray(value)) return value.map(String);
    return String(value)
      .split(/[;,，、\s]+/)
      .map((v) => v.trim())
      .filter(Boolean);
  }
  if (field.type === "number") return Number(value);
  return String(value);
}

function buildInitialValues(fields: FormField[], source?: Record<string, unknown>, departmentNamePathMap?: Map<string, string[]>) {
  const out: Record<string, unknown> = {};
  fields.forEach((f) => {
    out[f.key] = toFormValue(f, source?.[f.key], departmentNamePathMap);
  });
  return out;
}

function serializeDraftValue(field: FormField, value: unknown): unknown {
  if (value === null || value === undefined) return undefined;
  if (field.key === "year" && dayjs.isDayjs(value)) return value.format("YYYY");
  if (field.type === "date" && dayjs.isDayjs(value)) return value.format("YYYY-MM-DD");
  if (field.key === "leadDepartment") return Array.isArray(value) ? value.map(String) : undefined;
  if (field.type === "multiselect") return Array.isArray(value) ? value.map(String) : undefined;
  return value;
}

function serializePayload(
  fields: FormField[],
  values: Record<string, unknown>,
  departmentIdNameMap?: Map<string, string>
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  fields.forEach((field) => {
    const raw = values[field.key];
    if (field.key === "leadDepartment" && departmentIdNameMap) {
      const path = Array.isArray(raw) ? raw.map(String) : [];
      const selectedId = path[path.length - 1];
      payload[field.key] = selectedId ? departmentIdNameMap.get(selectedId) ?? "" : "";
      return;
    }
    if (field.key === "year") {
      payload[field.key] = raw ? Number(dayjs(raw as dayjs.Dayjs).format("YYYY")) : undefined;
      return;
    }
    if (field.type === "multiselect") {
      payload[field.key] = Array.isArray(raw) ? raw.join("、") : "";
      return;
    }
    if (field.key === "predecessorTaskIds") {
      if (Array.isArray(raw)) {
        payload[field.key] = raw.map((item) => String(item).trim()).filter(Boolean);
        return;
      }
      payload[field.key] = String(raw ?? "")
        .split(/[;,，、\s]+/)
        .map((item) => item.trim())
        .filter(Boolean);
      return;
    }
    if (field.key === "sortOrder") {
      payload[field.key] = raw === undefined || raw === null || raw === "" ? undefined : Number(raw);
      return;
    }
    if (field.type === "date") {
      payload[field.key] = raw ? dayjs(raw as dayjs.Dayjs).format("YYYY-MM-DD") : "";
      return;
    }
    payload[field.key] = raw;
  });
  return payload;
}

function matchesVisibleWhen(field: FormField, values: Record<string, unknown>) {
  const rule = field.visibleWhen;
  if (!rule) return true;
  const current = values[rule.key];
  const text = current === null || current === undefined ? "" : String(current);
  if (rule.equals !== undefined) return text === rule.equals;
  if (rule.notEquals !== undefined) return text !== rule.notEquals;
  if (rule.isTruthy) return Boolean(current);
  return true;
}

function formatFieldGuidance(field: FormField) {
  const parts = [field.helpText ?? field.hint, field.example ? `示例：${field.example}` : ""].filter(Boolean);
  return parts.join(" | ");
}

function normalizeFieldOptions(options?: FormField["options"]): FormFieldOption[] {
  if (!options || options.length === 0) return [];
  return options.map((opt) => (typeof opt === "string" ? { label: opt, value: opt } : opt));
}

function getPriorityTag(field: FormField) {
  if (field.priority === "auto") return <Tag color="blue">自动带入</Tag>;
  if (field.priority === "recommended") return <Tag color="gold">建议填</Tag>;
  if (field.priority === "optional") return <Tag>可选</Tag>;
  return null;
}

function cloneRowForForm(row: Record<string, unknown>, fields: FormField[]) {
  const out: Record<string, unknown> = {};
  fields.forEach((field) => {
    out[field.key] = toFormValue(field, row[field.key]);
  });
  return out;
}

interface WbsNotice {
  type: "info" | "warning" | "error";
  title: string;
  lines: string[];
}

interface SuggestionTodoItem {
  title: string;
  workPackage: string;
  stage: string;
  detail: string;
  deliverable: string;
}

type SuggestionMode = "light" | "standard" | "complete";
type SuggestionItemType = "功能开发" | "数据处理" | "材料编写" | "会议协调" | "排查修复" | "其他事项";

const suggestionItemTypeOptions: Array<{ label: string; value: SuggestionItemType }> = [
  { label: "功能开发", value: "功能开发" },
  { label: "数据处理", value: "数据处理" },
  { label: "材料编写", value: "材料编写" },
  { label: "会议协调", value: "会议协调" },
  { label: "排查修复", value: "排查修复" },
  { label: "其他事项", value: "其他事项" }
];

interface DraftDependencyDialogState {
  open: boolean;
  rowIndex: number;
  refs: string[];
}

export function DynamicForm({
  fields,
  title = "新增记录",
  submitText = "提交",
  initialValues,
  enableDraft = false,
  draftStorageKey,
  moduleKey,
  departmentCascaderOptions,
  departmentNamePathMap,
  departmentIdNameMap,
  onSubmit,
  onBatchSubmit,
  onBatchValidate,
  onGenerateWbsSuggestions,
  predecessorOptions,
  onCancel
}: Props) {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [draftSaved, setDraftSaved] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [wbsRows, setWbsRows] = useState<Record<string, unknown>[]>([]);
  const [wbsEditingIndex, setWbsEditingIndex] = useState<number | null>(null);
  const [wbsRowErrorMap, setWbsRowErrorMap] = useState<Record<number, string[]>>({});
  const [draftRows, setDraftRows] = useState<Record<string, unknown>[]>([]);
  const [draftSelectedKeys, setDraftSelectedKeys] = useState<string[]>([]);
  const [draftRowErrorMap, setDraftRowErrorMap] = useState<Record<number, string[]>>({});
  const [wbsNotice, setWbsNotice] = useState<WbsNotice | null>(null);
  const [quickPrompt, setQuickPrompt] = useState("");
  const [quickMode, setQuickMode] = useState<SuggestionMode>("standard");
  const [quickItemType, setQuickItemType] = useState<SuggestionItemType>("功能开发");
  const [quickDateRange, setQuickDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([dayjs(), dayjs().add(4, "day")]);
  const [quickGenerating, setQuickGenerating] = useState(false);
  const [quickSummary, setQuickSummary] = useState("");
  const [quickTodos, setQuickTodos] = useState<SuggestionTodoItem[]>([]);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [dependencyDialog, setDependencyDialog] = useState<DraftDependencyDialogState>({
    open: false,
    rowIndex: -1,
    refs: []
  });
  const draftKeySeqRef = useRef(1);

  const isEditMode = Boolean(initialValues?.id);
  const isWbsBatchMode = moduleKey === "wbs" && !isEditMode && Boolean(onBatchSubmit);
  const singleSubmitEnabled = !isWbsBatchMode && Boolean(onSubmit);
  const allFormValues = (Form.useWatch([], form) as Record<string, unknown>) ?? {};

  const draftValues = useMemo(() => {
    if (!enableDraft || !draftStorageKey || isEditMode) return {};
    try {
      const raw = localStorage.getItem(draftStorageKey);
      if (!raw) return {};
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      return buildInitialValues(fields, parsed, departmentNamePathMap);
    } catch {
      return {};
    }
  }, [enableDraft, draftStorageKey, isEditMode, fields, departmentNamePathMap]);

  const formInitialValues = useMemo(() => {
    const fromInitial = buildInitialValues(fields, initialValues, departmentNamePathMap);
    const merged: Record<string, unknown> = { ...draftValues };
    Object.entries(fromInitial).forEach(([key, value]) => {
      if (value !== undefined) merged[key] = value;
    });
    return merged;
  }, [fields, initialValues, departmentNamePathMap, draftValues]);

  useEffect(() => {
    form.setFieldsValue(formInitialValues);
    setSubmitError("");
    setFieldErrors({});
    setDraftSaved(false);
    setWbsRowErrorMap({});
    setDraftRowErrorMap({});
    setWbsNotice(null);
    setQuickSummary("");
    setQuickTodos([]);
    setDraftSelectedKeys([]);
  }, [form, formInitialValues]);

  const visibleFields = useMemo(
    () => fields.filter((field) => matchesVisibleWhen(field, allFormValues)),
    [fields, allFormValues]
  );

  const visibleOptionalKeys = useMemo(
    () => visibleFields.filter((f) => f.priority === "optional").map((f) => f.key),
    [visibleFields]
  );

  const hiddenOptionalCount = useMemo(
    () => (showOptionalFields ? 0 : visibleFields.filter((f) => f.priority === "optional").length),
    [showOptionalFields, visibleFields]
  );

  const renderedFields = useMemo(() => {
    if (showOptionalFields) return visibleFields;
    return visibleFields.filter((field) => field.priority !== "optional");
  }, [showOptionalFields, visibleFields]);

  const wbsContextFields = useMemo(
    () => renderedFields.filter((field) => field.section === "context" || field.key === "projectId"),
    [renderedFields]
  );

  const wbsDetailFields = useMemo(
    () =>
      renderedFields.filter(
        (field) => (field.section === "detail" || !field.section) && field.key !== "projectId"
      ),
    [renderedFields]
  );

  const wbsAdvancedFields = useMemo(
    () => renderedFields.filter((field) => field.section === "advanced"),
    [renderedFields]
  );

  const saveDraft = () => {
    if (!enableDraft || !draftStorageKey || isEditMode) return;
    const values = form.getFieldsValue(true);
    const payload: Record<string, unknown> = {};
    fields.forEach((field) => {
      payload[field.key] = serializeDraftValue(field, values[field.key]);
    });
    if (isWbsBatchMode && wbsRows.length > 0) {
      payload.__wbsRows = wbsRows;
    }
    localStorage.setItem(draftStorageKey, JSON.stringify(payload));
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 1500);
  };

  const clearForm = () => {
    form.resetFields();
    setSubmitError("");
    setFieldErrors({});
    setWbsRows([]);
    setDraftRows([]);
    setDraftSelectedKeys([]);
    setWbsEditingIndex(null);
    setWbsRowErrorMap({});
    setDraftRowErrorMap({});
    setWbsNotice(null);
    setQuickSummary("");
    setQuickTodos([]);
    if (enableDraft && draftStorageKey && !isEditMode) {
      localStorage.removeItem(draftStorageKey);
    }
  };

  useEffect(() => {
    if (!isWbsBatchMode || !enableDraft || !draftStorageKey || isEditMode) return;
    try {
      const raw = localStorage.getItem(draftStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const rows = Array.isArray(parsed.__wbsRows) ? (parsed.__wbsRows as Record<string, unknown>[]) : [];
      const drafts = Array.isArray(parsed.__wbsDraftRows) ? (parsed.__wbsDraftRows as Record<string, unknown>[]) : [];
      const maxSeq = drafts
        .map((item) => String(item.__draftKey ?? ""))
        .map((value) => {
          const parts = value.split("-");
          return Number(parts[parts.length - 1]);
        })
        .filter((value) => Number.isFinite(value))
        .reduce((max, value) => Math.max(max, Number(value)), 0);
      draftKeySeqRef.current = maxSeq + 1;
      setWbsRows(rows);
      setDraftRows(drafts);
    } catch {
      setWbsRows([]);
      setDraftRows([]);
    }
  }, [isWbsBatchMode, enableDraft, draftStorageKey, isEditMode]);

  useEffect(() => {
    if (!isWbsBatchMode || !enableDraft || !draftStorageKey || isEditMode) return;
    try {
      const raw = localStorage.getItem(draftStorageKey);
      const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
      parsed.__wbsRows = wbsRows;
      parsed.__wbsDraftRows = draftRows;
      localStorage.setItem(draftStorageKey, JSON.stringify(parsed));
    } catch {
      // ignore draft persistence failures
    }
  }, [wbsRows, draftRows, isWbsBatchMode, enableDraft, draftStorageKey, isEditMode]);

  const buildFieldRules = (field: FormField) => {
    const rules = [];
    if (field.required) {
      rules.push({ required: true, message: `请填写${field.label}` });
    }
    if (field.key === "plannedEndDate") {
      rules.push({
        validator: async (_: unknown, value: unknown) => {
          const start = form.getFieldValue("plannedStartDate") as dayjs.Dayjs | undefined;
          if (!value || !start) return;
          const end = value as dayjs.Dayjs;
          if (dayjs(end).isBefore(dayjs(start), "day")) {
            throw new Error("计划完成时间不得早于计划开始时间");
          }
        }
      });
    }
    return rules;
  };

  const renderInput = (field: FormField) => {
    const commonPlaceholder = field.placeholder ?? (field.type === "select" || field.type === "multiselect" ? "请选择" : "请输入");
    if (field.key === "wbsCode" && isWbsBatchMode) {
      return <Input placeholder={field.placeholder ?? "系统自动生成"} disabled />;
    }
    if (field.key === "predecessorTaskIds" && isWbsBatchMode) {
      return (
        <Select
          mode="multiple"
          showSearch
          allowClear
          options={predecessorOptions ?? []}
          optionFilterProp="label"
          filterOption={(input, option) => String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
          placeholder={field.placeholder ?? "可选，按任务名称选择前置任务"}
        />
      );
    }
    if (field.key === "year") {
      return <DatePicker picker="year" style={{ width: "100%" }} format="YYYY" placeholder={field.placeholder ?? "请选择所属年度"} />;
    }
    if (field.key === "leadDepartment" && (departmentCascaderOptions?.length ?? 0) > 0) {
      return (
        <Cascader
          style={{ width: "100%" }}
          placeholder={commonPlaceholder}
          allowClear
          showSearch
          changeOnSelect
          options={departmentCascaderOptions}
        />
      );
    }
    if (field.type === "textarea") {
      return <Input.TextArea rows={3} placeholder={commonPlaceholder} />;
    }
    if (field.type === "select") {
      const options = normalizeFieldOptions(field.options);
      return (
        <Select
          showSearch
          allowClear
          options={options}
          optionFilterProp="label"
          filterOption={(input, option) => String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
          placeholder={commonPlaceholder}
        />
      );
    }
    if (field.type === "multiselect") {
      const options = normalizeFieldOptions(field.options);
      return (
        <Select
          mode="multiple"
          showSearch
          allowClear
          options={options}
          optionFilterProp="label"
          filterOption={(input, option) => String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
          placeholder={commonPlaceholder}
        />
      );
    }
    if (field.type === "number") {
      return <InputNumber style={{ width: "100%" }} placeholder={commonPlaceholder} />;
    }
    if (field.type === "date") {
      return <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" placeholder={commonPlaceholder} />;
    }
    return <Input placeholder={commonPlaceholder} />;
  };

  const renderField = (field: FormField) => {
    const colSpan = field.type === "textarea" ? 24 : 12;
    const guidance = formatFieldGuidance(field);
    const labelNode = (
      <Space size={6} wrap>
        <span>{field.label}</span>
        {field.required ? <Tag color="red">必填</Tag> : null}
        {getPriorityTag(field)}
        {guidance ? (
          <Tooltip title={guidance} placement="topLeft">
            <InfoCircleOutlined style={{ color: "#94a3b8", fontSize: 13 }} />
          </Tooltip>
        ) : null}
      </Space>
    );
    return (
      <Col span={colSpan} key={field.key}>
        <Form.Item
          name={field.key}
          label={labelNode}
          rules={buildFieldRules(field)}
          help={fieldErrors[field.key] ? fieldErrors[field.key] : undefined}
          validateStatus={fieldErrors[field.key] ? "error" : undefined}
        >
          {renderInput(field)}
        </Form.Item>
      </Col>
    );
  };

  const applyPostAddDefaults = (payload: Record<string, unknown>) => {
    const nextValues: Record<string, unknown> = {};
    fields.forEach((field) => {
      if (field.key === "projectId") {
        nextValues[field.key] = toFormValue(field, payload[field.key], departmentNamePathMap);
        return;
      }
      if (field.inheritable || field.defaultValueResolver === "previousRow") {
        nextValues[field.key] = toFormValue(field, payload[field.key], departmentNamePathMap);
        return;
      }
      nextValues[field.key] = undefined;
    });
    form.setFieldsValue(nextValues);
  };

  const buildNextDraftKey = () => {
    const key = `draft-${draftKeySeqRef.current}`;
    draftKeySeqRef.current += 1;
    return key;
  };

  const parseDependencyRefs = (values: string[] | undefined) => {
    const refs = values ?? [];
    const serverIds = refs.filter((item) => !item.startsWith("draft:"));
    const draftKeys = refs.filter((item) => item.startsWith("draft:")).map((item) => item.slice(6));
    return {
      serverIds,
      draftKeys,
      refs
    };
  };

  const draftDependencyOptions = useMemo(() => {
    const fromDraft = draftRows.map((row) => {
      const key = String(row.__draftKey ?? "");
      const label = String(row.taskName || row.level2WorkPackage || "未命名草稿任务");
      return { label: `${label}（草稿）`, value: `draft:${key}` };
    });
    return [...fromDraft, ...(predecessorOptions ?? [])];
  }, [draftRows, predecessorOptions]);

  const toDraftSuccessorText = (row: Record<string, unknown>) => {
    const key = String(row.__draftKey ?? "");
    if (!key) return "无";
    const successors = draftRows
      .filter((item) => item !== row)
      .filter((item) => {
        const refs = Array.isArray(item.__dependencyRefs) ? item.__dependencyRefs.map((value) => String(value)) : [];
        return refs.includes(`draft:${key}`);
      })
      .map((item) => String(item.taskName || item.level2WorkPackage || "未命名草稿任务"));
    return successors.length > 0 ? successors.join("；") : "无";
  };

  const validateSelectedDraftRows = (selectedKeys: string[]) => {
    const errors: Record<number, string[]> = {};
    const selectedSet = new Set(selectedKeys);
    const rowByKey = new Map(
      draftRows.map((row, index) => [String(row.__draftKey ?? ""), { row, index }])
    );

    draftRows.forEach((row, index) => {
      const key = String(row.__draftKey ?? "");
      if (!selectedSet.has(key)) return;
      const rowErrors: string[] = [];
      const refs = Array.isArray(row.__dependencyRefs) ? row.__dependencyRefs.map((item) => String(item)) : [];
      if (refs.includes(`draft:${key}`)) {
        rowErrors.push("存在自依赖，请移除本行对自身的前置引用");
      }
      const rowStart = String(row.plannedStartDate ?? "");
      refs
        .filter((ref) => ref.startsWith("draft:"))
        .forEach((ref) => {
          const predecessorKey = ref.slice(6);
          if (!selectedSet.has(predecessorKey)) {
            rowErrors.push("存在草稿前置任务未加入本次批量加入，请同时勾选前置行或移除依赖");
            return;
          }
          const predecessor = rowByKey.get(predecessorKey);
          const predecessorEnd = String(predecessor?.row.plannedEndDate ?? "");
          if (rowStart && predecessorEnd && dayjs(rowStart).isBefore(dayjs(predecessorEnd), "day")) {
            rowErrors.push("计划开始时间早于草稿前置任务完成时间");
          }
        });
      if (rowErrors.length > 0) errors[index] = rowErrors;
    });

    const selectedDraftKeys = selectedKeys.filter((key) => rowByKey.has(key));
    const adjacency = new Map<string, string[]>();
    selectedDraftKeys.forEach((key) => {
      const row = rowByKey.get(key)?.row;
      const refs = Array.isArray(row?.__dependencyRefs) ? row!.__dependencyRefs.map((item) => String(item)) : [];
      adjacency.set(
        key,
        refs.filter((ref) => ref.startsWith("draft:")).map((ref) => ref.slice(6)).filter((dep) => selectedSet.has(dep))
      );
    });
    const color = new Map<string, 0 | 1 | 2>();
    const cycleNodes = new Set<string>();
    const dfs = (key: string, stack: string[]) => {
      const state = color.get(key) ?? 0;
      if (state === 1) {
        stack.forEach((item) => cycleNodes.add(item));
        cycleNodes.add(key);
        return;
      }
      if (state === 2) return;
      color.set(key, 1);
      (adjacency.get(key) ?? []).forEach((next) => dfs(next, [...stack, key]));
      color.set(key, 2);
    };
    selectedDraftKeys.forEach((key) => dfs(key, []));
    cycleNodes.forEach((key) => {
      const index = rowByKey.get(key)?.index;
      if (index === undefined) return;
      const rowErrors = errors[index] ?? [];
      rowErrors.push("检测到循环依赖，请调整紧前任务关系");
      errors[index] = Array.from(new Set(rowErrors));
    });
    return errors;
  };

  const validateAndBuildCurrentPayload = async () => {
    const targetFields = (isWbsBatchMode ? [...wbsContextFields, ...wbsDetailFields, ...wbsAdvancedFields] : renderedFields).map(
      (field) => field.key
    );
    await form.validateFields(targetFields);
    const values = form.getFieldsValue(true) as Record<string, unknown>;
    const payload = serializePayload(fields, values, departmentIdNameMap);
    if (moduleKey === "wbs" && !String(payload.projectId ?? "").trim()) {
      throw new Error("请先选择项目后再录入 WBS 分解项");
    }
    return payload;
  };

  const handleAddOrUpdateWbsRow = async () => {
    try {
      setSubmitError("");
      const payload = await validateAndBuildCurrentPayload();
      setWbsNotice(null);
      setWbsRowErrorMap({});
      setWbsRows((prev) => {
        if (wbsEditingIndex === null) return [...prev, payload];
        return prev.map((row, idx) => (idx === wbsEditingIndex ? payload : row));
      });
      setWbsEditingIndex(null);
      applyPostAddDefaults(payload);
    } catch (error) {
      if (error instanceof Error) {
        setSubmitError(error.message);
      }
    }
  };

  const validateWbsRowsBeforeSubmit = (rows: Record<string, unknown>[]) => {
    const rowErrors: Record<number, string[]> = {};
    rows.forEach((row, idx) => {
      const errors: string[] = [];
      fields.forEach((field) => {
        if (field.required && !String(row[field.key] ?? "").trim()) {
          errors.push(`${field.label}不能为空`);
        }
      });
      const start = String(row.plannedStartDate ?? "");
      const end = String(row.plannedEndDate ?? "");
      if (start && end && dayjs(end).isBefore(dayjs(start), "day")) {
        errors.push("计划完成时间不得早于计划开始时间");
      }
      if (errors.length > 0) rowErrors[idx] = errors;
    });
    return rowErrors;
  };

  const handleSubmitWbsBatch = async () => {
    if (!onBatchSubmit) return;
    if (wbsRows.length === 0) {
      setSubmitError("请先至少加入一条分解项记录");
      return;
    }
    const rowsForSubmit = wbsRows.map((row) => {
      const next = { ...row } as Record<string, unknown>;
      delete next.__draftKey;
      delete next.__dependencyRefs;
      delete next.__draftPredecessorKeys;
      return next;
    });
    const rowErrors = validateWbsRowsBeforeSubmit(rowsForSubmit);
    if (Object.keys(rowErrors).length > 0) {
      setWbsRowErrorMap(rowErrors);
      const lines = Object.entries(rowErrors).flatMap(([idx, errs]) => errs.map((msg) => `第 ${Number(idx) + 1} 行：${msg}`));
      setWbsNotice({ type: "warning", title: "分解项存在可修正问题", lines });
      setSubmitError("存在未通过校验的分解项，请修正后再提交");
      return;
    }
    if (onBatchValidate) {
      const validation = await onBatchValidate(rowsForSubmit);
      if (!validation.ok) {
        const conflictRowErrors: Record<number, string[]> = {};
        validation.conflicts.forEach((conflict) => {
          const list = conflictRowErrors[conflict.rowIndex] || [];
          list.push(conflict.message);
          conflictRowErrors[conflict.rowIndex] = list;
        });
        setWbsRowErrorMap(conflictRowErrors);
        setWbsNotice({
          type: "warning",
          title: "分解项存在依赖或时间冲突",
          lines: validation.conflicts.map((item) => `第 ${item.rowIndex + 1} 行${item.field ? `（${item.field}）` : ""}：${item.message}`)
        });
        setSubmitError("存在计划冲突，请先处理标红行后再提交");
        return;
      }
    }

    try {
      setLoading(true);
      setSubmitError("");
      setFieldErrors({});
      setWbsRowErrorMap({});
      setWbsNotice(null);
      await onBatchSubmit(rowsForSubmit);
      if (enableDraft && draftStorageKey) localStorage.removeItem(draftStorageKey);
      const keepProjectId = form.getFieldValue("projectId");
      form.resetFields();
      if (keepProjectId) form.setFieldValue("projectId", keepProjectId);
      setWbsRows([]);
      setWbsEditingIndex(null);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409 && error.message.includes("存在未审批且影响里程碑/WBS的变更")) {
        const changeCodeMatch = error.message.match(/（([^）]+)）/);
        const changeCode = changeCodeMatch?.[1] || "未知编号";
        Modal.error({
          title: "当前无法提交分解项",
          width: 620,
          content: (
            <Space direction="vertical" size={6}>
              <Typography.Text>问题：检测到未审批且影响 WBS/里程碑基线的变更单（{changeCode}）。</Typography.Text>
              <Typography.Text>影响：系统暂时禁止提交新的 WBS 基线修改。</Typography.Text>
              <Typography.Text>怎么改：请先到“变更申请”完成审批或驳回，再返回当前页面重新提交。</Typography.Text>
            </Space>
          ),
          okText: "我知道了",
          cancelText: "去处理变更单",
          okCancel: true,
          onCancel: () => navigate("/module/changes")
        });
        return;
      }
      const parsed = parseFormError(error);
      setSubmitError(parsed.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinishSingle = async (values: Record<string, unknown>) => {
    if (!onSubmit || isWbsBatchMode) return;
    const payload = serializePayload(fields, values, departmentIdNameMap);
    try {
      setLoading(true);
      setSubmitError("");
      setFieldErrors({});
      await onSubmit(payload);
      if (enableDraft && draftStorageKey && !isEditMode) localStorage.removeItem(draftStorageKey);
      form.resetFields();
    } catch (error) {
      const parsed = parseFormError(error);
      setSubmitError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
      form.setFields(
        Object.entries(parsed.fieldErrors).map(([name, msg]) => ({
          name,
          errors: [msg]
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmitCapture = (event: FormEvent<HTMLFormElement>) => {
    // 批量模式仅允许显式点击“批量提交”，阻止回车触发表单默认提交流程。
    if (!isWbsBatchMode) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const draftTableColumns = useMemo<ColumnsType<Record<string, unknown>>>(() => {
    return [
      {
        title: "选择",
        key: "select",
        width: 70,
        render: (_, row) => {
          const key = String(row.__draftKey ?? "");
          const checked = draftSelectedKeys.includes(key);
          return (
            <Checkbox
              checked={checked}
              onChange={(event) => {
                setDraftSelectedKeys((prev) =>
                  event.target.checked ? Array.from(new Set([...prev, key])) : prev.filter((item) => item !== key)
                );
              }}
            />
          );
        }
      },
      {
        title: "一级阶段",
        dataIndex: "level1Stage",
        key: "level1Stage",
        width: 100
      },
      {
        title: "二级工作包",
        dataIndex: "level2WorkPackage",
        key: "level2WorkPackage",
        width: 160
      },
      {
        title: "任务名称",
        dataIndex: "taskName",
        key: "taskName",
        width: 220,
        ellipsis: true
      },
      {
        title: "计划开始",
        dataIndex: "plannedStartDate",
        key: "plannedStartDate",
        width: 120,
        render: (value) => String(value || "-")
      },
      {
        title: "计划完成",
        dataIndex: "plannedEndDate",
        key: "plannedEndDate",
        width: 120,
        render: (value) => String(value || "-")
      },
      {
        title: "依赖编辑",
        key: "predecessors",
        width: 220,
        render: (_, row, index) => {
          const refs = Array.isArray(row.__dependencyRefs) ? row.__dependencyRefs.map((item) => String(item)) : [];
          return (
            <Space direction="vertical" size={4}>
              <Button
                size="small"
                onClick={() =>
                  setDependencyDialog({
                    open: true,
                    rowIndex: index,
                    refs
                  })
                }
              >
                编辑依赖
              </Button>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                已选 {refs.length} 项
              </Typography.Text>
            </Space>
          );
        }
      },
      {
        title: "紧后任务",
        key: "successors",
        width: 220,
        render: (_, row) => toDraftSuccessorText(row)
      }
    ];
  }, [draftSelectedKeys, draftRows]);

  const wbsTableColumns = useMemo<ColumnsType<Record<string, unknown>>>(() => {
    const previewFields = [
      "level1Stage",
      "level2WorkPackage",
      "taskName",
      "taskOwner",
      "plannedStartDate",
      "plannedEndDate",
      "currentStatus"
    ];
    const cols: ColumnsType<Record<string, unknown>> = previewFields
      .map((key) => fields.find((f) => f.key === key))
      .filter((f): f is FormField => Boolean(f))
      .map((field) => ({
        title: field.label,
        dataIndex: field.key,
        key: field.key,
        ellipsis: true,
        width: field.key === "taskName" ? 220 : 140
      }));

    cols.push({
      title: "紧前任务",
      key: "predecessors",
      width: 220,
      render: (_, row) => {
        const ids = Array.isArray(row.predecessorTaskIds) ? row.predecessorTaskIds.map((item) => String(item)) : [];
        if (ids.length === 0) return <Typography.Text type="secondary">无</Typography.Text>;
        const lookup = new Map((predecessorOptions ?? []).map((item) => [String(item.value), item.label]));
        return ids.map((id) => lookup.get(id) || id).join("；");
      }
    });

    cols.push({
      title: "紧后任务",
      key: "successors",
      width: 220,
      render: (_, row, index) => {
        const rowId = String(row.id ?? "");
        if (!rowId) return <Typography.Text type="secondary">提交后可见</Typography.Text>;
        const successors = wbsRows
          .map((item, idx) => ({ item, idx }))
          .filter(({ item, idx }) => {
            if (idx === index) return false;
            const ids = Array.isArray(item.predecessorTaskIds) ? item.predecessorTaskIds.map((value) => String(value)) : [];
            return ids.includes(rowId);
          })
          .map(({ item }) => String(item.taskName || item.level2WorkPackage || "未命名任务"));
        if (successors.length === 0) return <Typography.Text type="secondary">无</Typography.Text>;
        return successors.join("；");
      }
    });

    cols.push({
      title: "操作",
      key: "actions",
      width: 170,
      fixed: "right",
      render: (_, __, index) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            onClick={() => {
              const row = wbsRows[index];
              if (!row) return;
              form.setFieldsValue(cloneRowForForm(row, fields));
              setWbsEditingIndex(index);
              setSubmitError("");
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              const row = wbsRows[index];
              if (!row) return;
              const newRow: Record<string, unknown> = {};
              fields.forEach((field) => {
                if (field.key === "projectId" || field.inheritable || field.defaultValueResolver === "previousRow") {
                  newRow[field.key] = row[field.key];
                }
              });
              setWbsRows((prev) => [...prev.slice(0, index + 1), newRow, ...prev.slice(index + 1)]);
            }}
          >
            复制
          </Button>
          <Button
            type="link"
            size="small"
            danger
            onClick={() => {
              setWbsRows((prev) => prev.filter((_, idx) => idx !== index));
              if (wbsEditingIndex === index) setWbsEditingIndex(null);
            }}
          >
            删除
          </Button>
        </Space>
      )
    });
    return cols;
  }, [fields, form, predecessorOptions, wbsRows, wbsEditingIndex]);

  const handleGenerateSuggestions = async () => {
    if (!onGenerateWbsSuggestions) return;
    const prompt = quickPrompt.trim();
    if (!prompt) {
      setSubmitError("请先输入“我要做什么”后再生成建议");
      return;
    }
    const plannedStartDate = quickDateRange[0]?.format("YYYY-MM-DD") ?? "";
    const plannedEndDate = quickDateRange[1]?.format("YYYY-MM-DD") ?? "";
    if (!plannedStartDate || !plannedEndDate) {
      setSubmitError("请先选择计划开始时间和计划完成时间");
      return;
    }
    if (dayjs(plannedEndDate).isBefore(dayjs(plannedStartDate), "day")) {
      setSubmitError("计划完成时间不得早于计划开始时间");
      return;
    }
    try {
      setQuickGenerating(true);
      setSubmitError("");
      const response = await onGenerateWbsSuggestions(prompt, {
        mode: quickMode,
        itemType: quickItemType,
        plannedStartDate,
        plannedEndDate
      });
      const rows =
        Array.isArray(response.wbsDrafts) && response.wbsDrafts.length > 0
          ? response.wbsDrafts
          : Array.isArray(response.items)
            ? response.items
            : [];
      if (rows.length === 0) {
        setSubmitError("未生成可用建议，请补充更具体的描述");
        return;
      }
      setQuickSummary(String(response.requirementSummary ?? "").trim());
      setQuickTodos(Array.isArray(response.todos) ? response.todos : []);
      const draftPrepared = rows.map((row) => {
        const next = { ...row } as Record<string, unknown>;
        const draftKey = buildNextDraftKey();
        const refs = Array.isArray(next.predecessorTaskIds) ? next.predecessorTaskIds.map((item) => String(item)) : [];
        const { serverIds, draftKeys } = parseDependencyRefs(refs);
        next.__draftKey = draftKey;
        next.__dependencyRefs = refs;
        next.__draftPredecessorKeys = draftKeys;
        next.predecessorTaskIds = serverIds;
        return next;
      });
      setDraftRows(draftPrepared);
      setDraftSelectedKeys(draftPrepared.map((row) => String(row.__draftKey)));
      setDraftRowErrorMap({});
      setWbsNotice({
        type: "info",
        title: "建议已生成到草稿区，请确认后再加入分解列表",
        lines: [
          response.requirementSummary ? `需求摘要：${response.requirementSummary}` : `已识别需求意图：${response.intent}`,
          `事项类型：${response.itemType ?? quickItemType}；计划窗口：${plannedStartDate} 至 ${plannedEndDate}`,
          `已生成 ${draftPrepared.length} 条轻量 WBS 草稿`,
          Array.isArray(response.todos) && response.todos.length > 0
            ? `候选 to-do：${response.todos.map((item) => item.title).join("；")}`
            : `规则说明：${response.reason}`
        ]
      });
    } catch (error) {
      const parsed = parseFormError(error);
      setSubmitError(parsed.message);
    } finally {
      setQuickGenerating(false);
    }
  };

  const handleDraftDependencyChange = (index: number, refs: string[]) => {
    setDraftRows((prev) =>
      prev.map((row, idx) => {
        if (idx !== index) return row;
        const next = { ...row };
        const { serverIds, draftKeys } = parseDependencyRefs(refs);
        next.__dependencyRefs = refs;
        next.__draftPredecessorKeys = draftKeys;
        next.predecessorTaskIds = serverIds;
        return next;
      })
    );
  };

  const handleSaveDraftDependencies = () => {
    if (dependencyDialog.rowIndex < 0) {
      setDependencyDialog({ open: false, rowIndex: -1, refs: [] });
      return;
    }
    handleDraftDependencyChange(dependencyDialog.rowIndex, dependencyDialog.refs);
    setDependencyDialog({ open: false, rowIndex: -1, refs: [] });
  };

  const handleAddSelectedDraftRows = () => {
    if (draftSelectedKeys.length === 0) {
      setSubmitError("请先勾选至少一条草稿建议后再加入分解列表");
      return;
    }
    const errorMap = validateSelectedDraftRows(draftSelectedKeys);
    const draftByKey = new Map(draftRows.map((row) => [String(row.__draftKey ?? ""), row]));
    const successKeys = draftSelectedKeys.filter((key) => {
      const row = draftByKey.get(key);
      if (!row) return false;
      const index = draftRows.indexOf(row);
      return !errorMap[index];
    });
    const failedKeys = draftSelectedKeys.filter((key) => !successKeys.includes(key));

    if (successKeys.length > 0) {
      const successRows = successKeys
        .map((key) => draftByKey.get(key))
        .filter((row): row is Record<string, unknown> => Boolean(row))
        .map((row) => {
          const next = { ...row } as Record<string, unknown>;
          const refs = Array.isArray(next.__dependencyRefs) ? next.__dependencyRefs.map((item) => String(item)) : [];
          const cleanRefs = refs.filter((item) => !item.startsWith("draft:"));
          next.predecessorTaskIds = cleanRefs;
          delete next.__dependencyRefs;
          delete next.__draftPredecessorKeys;
          return next;
        });
      setWbsRows((prev) => [...prev, ...successRows]);
      setDraftRows((prev) => prev.filter((row) => !successKeys.includes(String(row.__draftKey ?? ""))));
    }

    setDraftSelectedKeys((prev) => prev.filter((key) => failedKeys.includes(key)));
    setDraftRowErrorMap(errorMap);

    if (failedKeys.length > 0) {
      const lines = Object.entries(errorMap).flatMap(([index, msgs]) => msgs.map((msg) => `草稿第 ${Number(index) + 1} 行：${msg}`));
      setWbsNotice({
        type: "warning",
        title: `已加入 ${successKeys.length} 行，${failedKeys.length} 行因依赖冲突保留在草稿区`,
        lines
      });
      return;
    }

    setWbsNotice({
      type: "info",
      title: `已将 ${successKeys.length} 条草稿加入分解列表`,
      lines: ["可继续生成建议，或展开手动填写补充任务。"]
    });
  };

  const renderFieldBlock = (list: FormField[]) => {
    if (list.length === 0) return null;
    return <Row gutter={12}>{list.map((field) => renderField(field))}</Row>;
  };

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={singleSubmitEnabled ? handleFinishSingle : undefined}
      onSubmitCapture={handleFormSubmitCapture}
      initialValues={formInitialValues}
    >
      <h3>{title}</h3>
      {submitError ? <Alert type="error" message={submitError} showIcon style={{ marginBottom: 12 }} /> : null}
      {wbsNotice ? (
        <Alert
          type={wbsNotice.type}
          showIcon
          style={{ marginBottom: 12 }}
          message={wbsNotice.title}
          description={
            <ul style={{ margin: 0, paddingInlineStart: 18 }}>
              {wbsNotice.lines.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          }
        />
      ) : null}

      {hiddenOptionalCount > 0 ? (
        <div style={{ marginBottom: 8 }}>
          <Button type="link" style={{ paddingInline: 0 }} onClick={() => setShowOptionalFields((v) => !v)}>
            {showOptionalFields ? "收起可选字段" : `展开更多字段（${hiddenOptionalCount}项）`}
          </Button>
        </div>
      ) : null}

      {isWbsBatchMode ? (
        <Space direction="vertical" style={{ width: "100%" }} size={12}>
          <Card size="small" title="基础信息（项目上下文）" className="wbs-entry-section">
            {wbsContextFields.length > 0 ? renderFieldBlock(wbsContextFields) : <Typography.Text type="secondary">当前项目将自动带入。</Typography.Text>}
          </Card>

          <Card
            size="small"
            title="分解项明细录入"
            className="wbs-entry-section"
            extra={wbsEditingIndex !== null ? <Tag color="processing">正在编辑第 {wbsEditingIndex + 1} 行</Tag> : null}
          >
            {onGenerateWbsSuggestions ? (
              <Card
                size="small"
                style={{ marginBottom: 12, background: "#f8fbff", border: "1px solid #dbeafe" }}
                title="快速生成建议"
              >
                <Space direction="vertical" style={{ width: "100%" }} size={8}>
                  <Space wrap size={8}>
                    <Select<SuggestionItemType>
                      style={{ width: 140 }}
                      value={quickItemType}
                      onChange={setQuickItemType}
                      options={suggestionItemTypeOptions}
                    />
                    <Select<SuggestionMode>
                      style={{ width: 150 }}
                      value={quickMode}
                      onChange={setQuickMode}
                      options={[
                        { label: "轻量（1-2条）", value: "light" },
                        { label: "标准（2-4条，按阶段）", value: "standard" },
                        { label: "完整（跨阶段）", value: "complete" }
                      ]}
                    />
                    <DatePicker
                      style={{ width: 140 }}
                      value={quickDateRange[0]}
                      format="YYYY-MM-DD"
                      placeholder="开始时间"
                      onChange={(value) => setQuickDateRange((prev) => [value, prev[1]])}
                    />
                    <DatePicker
                      style={{ width: 140 }}
                      value={quickDateRange[1]}
                      format="YYYY-MM-DD"
                      placeholder="完成时间"
                      onChange={(value) => setQuickDateRange((prev) => [prev[0], value])}
                    />
                  </Space>
                  <Space.Compact style={{ width: "100%" }}>
                    <Input
                      placeholder="一句话描述事项：例如 梳理产品列表数据 / 编写汇报材料 / 新增订单导出功能"
                      value={quickPrompt}
                      onChange={(event) => setQuickPrompt(event.target.value)}
                    />
                    <Button type="primary" loading={quickGenerating} onClick={handleGenerateSuggestions}>
                      生成建议
                    </Button>
                  </Space.Compact>
                  <Typography.Text type="secondary">
                    {quickSummary || "先选事项类型、事项描述和计划时间，再生成可确认的轻量 WBS 草稿。"}
                  </Typography.Text>
                  {quickTodos.length > 0 ? (
                    <Typography.Text type="secondary">
                      候选 to-do：{quickTodos.map((item) => item.title).join("；")}
                    </Typography.Text>
                  ) : null}
                </Space>
              </Card>
            ) : null}

            <Card
              size="small"
              title={`建议草稿区（${draftRows.length}）`}
              style={{ marginBottom: 12 }}
              extra={
                <Space>
                  <Button
                    size="small"
                    onClick={() => setDraftSelectedKeys(draftRows.map((row) => String(row.__draftKey ?? "")))}
                    disabled={draftRows.length === 0}
                  >
                    全选
                  </Button>
                  <Button size="small" onClick={() => setDraftSelectedKeys([])} disabled={draftRows.length === 0}>
                    清空选择
                  </Button>
                  <Button type="primary" size="small" onClick={handleAddSelectedDraftRows} disabled={draftRows.length === 0}>
                    批量加入分解列表
                  </Button>
                </Space>
              }
            >
              <Typography.Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
                草稿仅用于确认，不会自动入列。支持在此配置紧前任务并查看紧后反推关系。
              </Typography.Text>
              <div className="entity-table">
                <Table<Record<string, unknown>>
                  className="app-table app-table--element"
                  rowKey={(row) => String(row.__draftKey ?? "")}
                  columns={draftTableColumns}
                  dataSource={draftRows}
                  pagination={{ pageSize: 5, showSizeChanger: false }}
                  scroll={{ x: "max-content" }}
                  locale={{ emptyText: "尚无建议草稿，请先输入“我要做什么”并生成建议" }}
                  rowClassName={(_, index) => (draftRowErrorMap[index] ? "wbs-batch-row-error" : "")}
                  size="small"
                />
              </div>
            </Card>

            <div style={{ marginBottom: 8 }}>
              <Button type="link" style={{ paddingInline: 0 }} onClick={() => setShowManualEntry((value) => !value)}>
                {showManualEntry ? "收起手动填写" : "展开手动填写"}
              </Button>
            </div>

            {showManualEntry ? (
              <>
                <Typography.Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
                  WBS编码由系统自动生成；关键字段说明可通过字段旁信息图标查看。
                </Typography.Text>
                {renderFieldBlock(wbsDetailFields)}
                {wbsAdvancedFields.length > 0 ? (
                  <div style={{ marginTop: 8 }}>
                    <Typography.Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
                      可选补充字段
                    </Typography.Text>
                    {renderFieldBlock(wbsAdvancedFields)}
                  </div>
                ) : null}
                <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                  {wbsEditingIndex !== null ? (
                    <Button
                      onClick={() => {
                        setWbsEditingIndex(null);
                        form.resetFields(
                          fields.filter((f) => f.key !== "projectId").map((f) => f.key)
                        );
                      }}
                      disabled={loading}
                    >
                      取消编辑行
                    </Button>
                  ) : null}
                  <Button onClick={handleAddOrUpdateWbsRow} disabled={loading}>
                    {wbsEditingIndex !== null ? "更新分解项" : "手动加入分解列表"}
                  </Button>
                </Space>
              </>
            ) : (
              <Typography.Text type="secondary">默认隐藏手动填写区。若规则建议不足，可按需展开补录。</Typography.Text>
            )}
          </Card>

          <Card
            size="small"
            title={`分解项列表（${wbsRows.length}）`}
            className="wbs-entry-section"
            extra={<Typography.Text type="secondary">支持编辑 / 复制 / 删除；提交前会再次校验</Typography.Text>}
          >
            <div className="entity-table">
              <Table<Record<string, unknown>>
                className="app-table app-table--element"
                rowKey={(_, idx) => String(idx)}
                columns={wbsTableColumns}
                dataSource={wbsRows}
                pagination={{ pageSize: 5, showSizeChanger: false }}
                scroll={{ x: "max-content" }}
                locale={{ emptyText: "尚未加入分解项，请先在上方录入后加入列表" }}
                rowClassName={(_, index) => (wbsRowErrorMap[index] ? "wbs-batch-row-error" : "")}
                size="small"
              />
            </div>
          </Card>
        </Space>
      ) : (
        <>{renderFieldBlock(renderedFields)}</>
      )}

      <Space style={{ width: "100%", justifyContent: "flex-end", marginTop: 12 }}>
        {enableDraft && !isEditMode ? (
          <>
            <Button onClick={saveDraft} disabled={loading}>
              暂存
            </Button>
            <Button onClick={clearForm} disabled={loading}>
              清空
            </Button>
          </>
        ) : null}
        {onCancel ? (
          <Button onClick={onCancel} disabled={loading}>
            取消
          </Button>
        ) : null}
        {isWbsBatchMode ? (
          <Button type="primary" onClick={handleSubmitWbsBatch} loading={loading}>
            批量提交分解项（{wbsRows.length}）
          </Button>
        ) : singleSubmitEnabled ? (
          <Button type="primary" htmlType="submit" loading={loading}>
            {submitText}
          </Button>
        ) : null}
      </Space>
      {draftSaved ? <div style={{ marginTop: 8, color: "#52c41a", textAlign: "right" }}>草稿已暂存</div> : null}
      {visibleOptionalKeys.length > 0 && !showOptionalFields ? (
        <div style={{ marginTop: 8, color: "#667085", fontSize: 12, textAlign: "right" }}>已隐藏部分可选字段，可按需展开</div>
      ) : null}
      <Modal
        title={dependencyDialog.rowIndex >= 0 ? `编辑依赖 - 草稿第 ${dependencyDialog.rowIndex + 1} 行` : "编辑依赖"}
        open={dependencyDialog.open}
        onCancel={() => setDependencyDialog({ open: false, rowIndex: -1, refs: [] })}
        onOk={handleSaveDraftDependencies}
        okText="保存依赖"
        cancelText="取消"
        width={720}
        destroyOnClose
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Typography.Text type="secondary">
            请选择当前草稿任务的紧前任务；支持选择草稿内任务与已有任务。
          </Typography.Text>
          <Select
            mode="multiple"
            showSearch
            allowClear
            style={{ width: "100%" }}
            value={dependencyDialog.refs}
            options={draftDependencyOptions.filter((item) => {
              const row = draftRows[dependencyDialog.rowIndex];
              const key = String(row?.__draftKey ?? "");
              return item.value !== `draft:${key}`;
            })}
            optionFilterProp="label"
            onChange={(value) =>
              setDependencyDialog((prev) => ({
                ...prev,
                refs: value as string[]
              }))
            }
            placeholder="按任务名称搜索并选择紧前任务"
          />
          <Typography.Text type="secondary">已选择 {dependencyDialog.refs.length} 项依赖</Typography.Text>
        </Space>
      </Modal>
    </Form>
  );
}
