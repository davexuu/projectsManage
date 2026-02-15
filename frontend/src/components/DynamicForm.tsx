import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Cascader, Col, DatePicker, Form, Input, InputNumber, Row, Select, Space } from "antd";
import dayjs from "dayjs";
import { FormField } from "../types";
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
  departmentCascaderOptions?: DepartmentCascaderOption[];
  departmentNamePathMap?: Map<string, string[]>;
  departmentIdNameMap?: Map<string, string>;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
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

export function DynamicForm({
  fields,
  title = "新增记录",
  submitText = "提交",
  initialValues,
  enableDraft = false,
  draftStorageKey,
  departmentCascaderOptions,
  departmentNamePathMap,
  departmentIdNameMap,
  onSubmit,
  onCancel
}: Props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [draftSaved, setDraftSaved] = useState(false);

  const isEditMode = Boolean(initialValues?.id);

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
  }, [form, formInitialValues]);

  const saveDraft = () => {
    if (!enableDraft || !draftStorageKey || isEditMode) return;
    const values = form.getFieldsValue(true);
    const payload: Record<string, unknown> = {};
    fields.forEach((field) => {
      payload[field.key] = serializeDraftValue(field, values[field.key]);
    });
    localStorage.setItem(draftStorageKey, JSON.stringify(payload));
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 1500);
  };

  const clearForm = () => {
    form.resetFields();
    setSubmitError("");
    setFieldErrors({});
    if (enableDraft && draftStorageKey && !isEditMode) {
      localStorage.removeItem(draftStorageKey);
    }
  };

  const handleFinish = async (values: Record<string, unknown>) => {
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
      if (field.type === "date") {
        payload[field.key] = raw ? dayjs(raw as dayjs.Dayjs).format("YYYY-MM-DD") : "";
        return;
      }
      payload[field.key] = raw;
    });

    try {
      setLoading(true);
      setSubmitError("");
      setFieldErrors({});
      await onSubmit(payload);
      if (enableDraft && draftStorageKey && !isEditMode) {
        localStorage.removeItem(draftStorageKey);
      }
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

  return (
    <Form layout="vertical" form={form} onFinish={handleFinish} initialValues={formInitialValues}>
      <h3>{title}</h3>
      {submitError ? <Alert type="error" message={submitError} showIcon style={{ marginBottom: 12 }} /> : null}
      <Row gutter={12}>
        {fields.map((field) => {
          const rules = field.required ? [{ required: true, message: `请填写${field.label}` }] : undefined;
          const colSpan = field.type === "textarea" ? 24 : 12;
          const extra = fieldErrors[field.key] ? undefined : field.hint;

          return (
            <Col span={colSpan} key={field.key}>
              <Form.Item name={field.key} label={field.label} rules={rules} extra={extra}>
                {field.key === "year" ? (
                  <DatePicker picker="year" style={{ width: "100%" }} format="YYYY" placeholder="请选择所属年度" />
                ) : field.key === "leadDepartment" && (departmentCascaderOptions?.length ?? 0) > 0 ? (
                  <Cascader
                    style={{ width: "100%" }}
                    placeholder="请选择"
                    allowClear
                    showSearch
                    changeOnSelect
                    options={departmentCascaderOptions}
                  />
                ) : field.type === "textarea" ? (
                  <Input.TextArea rows={3} />
                ) : field.type === "select" ? (
                  <Select
                    showSearch
                    allowClear
                    options={(field.options ?? []).map((opt) => ({ label: opt, value: opt }))}
                    optionFilterProp="label"
                    filterOption={(input, option) => String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                    placeholder="请选择"
                  />
                ) : field.type === "multiselect" ? (
                  <Select
                    mode="multiple"
                    showSearch
                    allowClear
                    options={(field.options ?? []).map((opt) => ({ label: opt, value: opt }))}
                    optionFilterProp="label"
                    filterOption={(input, option) => String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                    placeholder="请选择"
                  />
                ) : field.type === "number" ? (
                  <InputNumber style={{ width: "100%" }} />
                ) : field.type === "date" ? (
                  <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                ) : (
                  <Input />
                )}
              </Form.Item>
            </Col>
          );
        })}
      </Row>
      <Space style={{ width: "100%", justifyContent: "flex-end" }}>
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
        <Button type="primary" htmlType="submit" loading={loading}>
          {submitText}
        </Button>
      </Space>
      {draftSaved ? <div style={{ marginTop: 8, color: "#52c41a", textAlign: "right" }}>草稿已暂存</div> : null}
    </Form>
  );
}
