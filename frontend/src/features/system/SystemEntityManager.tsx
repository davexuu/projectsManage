import { useMemo, useState } from "react";
import { Button, Card, Modal, Select, Space, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { AppTable } from "../../components/AppTable";
import { DynamicForm } from "../../components/DynamicForm";
import { FormField } from "../../types";
import { SystemEntityMeta } from "../../api/client";
import { getErrorMessage } from "../../utils/errors";

interface Props {
  visible: boolean;
  entities: SystemEntityMeta[];
  activeEntityKey: string;
  rows: Array<Record<string, unknown>>;
  onChangeEntity: (entityKey: string) => Promise<void>;
  onCreate: (entityKey: string, payload: Record<string, unknown>) => Promise<void>;
  onUpdate: (entityKey: string, id: string, payload: Record<string, unknown>) => Promise<void>;
  onDelete: (entityKey: string, id: string) => Promise<void>;
}

function mapFieldType(kind: SystemEntityMeta["fields"][number]["kind"]): FormField["type"] {
  if (kind === "number") return "number";
  if (kind === "date") return "date";
  if (kind === "json") return "textarea";
  if (kind === "boolean" || kind === "enum") return "select";
  return "text";
}

function toLabelMap(entity?: SystemEntityMeta): Record<string, string> {
  if (!entity) return {};
  return Object.fromEntries([
    ["id", "ID"],
    ["createdAt", "创建时间"],
    ["updatedAt", "更新时间"],
    ...entity.fields.map((field) => [field.key, field.label])
  ]);
}

export function SystemEntityManager({
  visible,
  entities,
  activeEntityKey,
  rows,
  onChangeEntity,
  onCreate,
  onUpdate,
  onDelete
}: Props) {
  const [editingRow, setEditingRow] = useState<Record<string, unknown> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const activeEntity = entities.find((item) => item.key === activeEntityKey) ?? entities[0];

  const formFields = useMemo<FormField[]>(
    () =>
      (activeEntity?.fields ?? []).map((field) => {
        const options = field.kind === "boolean" ? ["true", "false"] : field.options;
        return {
          key: field.key,
          label: field.label,
          type: mapFieldType(field.kind),
          required: field.required,
          options,
          hint: field.kind === "json" ? "可输入 JSON 字符串" : undefined
        };
      }),
    [activeEntity]
  );

  const labelMap = useMemo(() => toLabelMap(activeEntity), [activeEntity]);
  const tableColumns = useMemo(() => {
    if (!rows[0]) return [];
    const columns: ColumnsType<Record<string, unknown>> = Object.keys(rows[0]).map((col) => ({
      title: labelMap[col] ?? col,
      dataIndex: col,
      key: col,
      render: (value: unknown) => String(value ?? "")
    }));
    if (activeEntity?.allowUpdate || activeEntity?.allowDelete) {
      columns.push({
        title: "操作",
        key: "__action",
        render: (_: unknown, row: Record<string, unknown>) => (
          <Space>
            {activeEntity.allowUpdate ? (
              <Button size="small" onClick={() => {
                setEditingRow(row);
                setDialogOpen(true);
              }}>
                编辑
              </Button>
            ) : null}
            {activeEntity.allowDelete ? (
              <Button
                size="small"
                danger
                onClick={() =>
                  Modal.confirm({
                    title: "确认删除该记录？",
                    onOk: () => onDelete(activeEntity.key, String(row.id)).catch((err) => message.error(getErrorMessage(err)))
                  })
                }
              >
                删除
              </Button>
            ) : null}
          </Space>
        )
      });
    }
    return columns;
  }, [rows, labelMap, activeEntity, onDelete]);

  if (!visible) return <Card>仅管理员或项目经理可维护系统实体。</Card>;
  if (!activeEntity) return <Card>暂无系统实体配置。</Card>;

  return (
    <>
      <Card
        title="系统实体管理"
        extra={
          <Space>
            <Select
              style={{ width: 220 }}
              value={activeEntity.key}
              options={entities.map((item) => ({ label: item.label, value: item.key }))}
              onChange={(value) => {
                setDialogOpen(false);
                setEditingRow(null);
                onChangeEntity(value).catch((err) => message.error(getErrorMessage(err)));
              }}
            />
            {activeEntity.allowCreate ? (
              <Button
                type="primary"
                onClick={() => {
                  setEditingRow(null);
                  setDialogOpen(true);
                }}
              >
                新增记录
              </Button>
            ) : null}
          </Space>
        }
      >
        <AppTable
          rowKey={(row) => String(row.id)}
          columns={tableColumns}
          dataSource={rows}
          pagination={{ pageSize: 20, showSizeChanger: true }}
          scroll={{ x: 1000 }}
          locale={{ emptyText: "暂无数据" }}
        />
      </Card>

      <Modal
        open={dialogOpen}
        title={editingRow ? `编辑${activeEntity.label}` : `新增${activeEntity.label}`}
        footer={null}
        onCancel={() => setDialogOpen(false)}
        width={900}
        destroyOnClose
      >
        <DynamicForm
          fields={formFields}
          title={editingRow ? `编辑${activeEntity.label}` : `新增${activeEntity.label}`}
          submitText={editingRow ? "保存" : "创建"}
          initialValues={editingRow ?? undefined}
          onCancel={() => setDialogOpen(false)}
          onSubmit={async (payload) => {
            if (editingRow?.id) {
              await onUpdate(activeEntity.key, String(editingRow.id), payload);
            } else {
              await onCreate(activeEntity.key, payload);
            }
            setDialogOpen(false);
            setEditingRow(null);
          }}
        />
      </Modal>
    </>
  );
}
