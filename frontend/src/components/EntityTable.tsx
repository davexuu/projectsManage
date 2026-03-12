import { useEffect, useMemo, useState } from "react";
import type { Key, ReactNode } from "react";
import { Button, Card, Space, Typography } from "antd";
import type { TableColumnsType, TableProps } from "antd";
import { AppTable } from "./AppTable";

interface Props {
  title: string;
  rows: Record<string, unknown>[];
  columnLabels?: Record<string, string>;
  tableVariant?: "default" | "element-like";
  onView?: (row: Record<string, unknown>) => void;
  onEdit?: (row: Record<string, unknown>) => void;
  onDelete?: (row: Record<string, unknown>) => void;
  onBatchDelete?: (selectedRows: Record<string, unknown>[]) => void;
  extraRowActions?: (row: Record<string, unknown>) => ReactNode;
}

function getRowKey(row: Record<string, unknown>) {
  return String(row.id ?? JSON.stringify(row));
}

function formatCell(col: string, value: unknown) {
  const text = String(value ?? "");
  if ((col === "createdAt" || col === "updatedAt") && text) {
    const date = new Date(text);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString("zh-CN", { hour12: false });
    }
  }
  return value ?? "";
}

export function EntityTable({
  title,
  rows,
  columnLabels,
  tableVariant = "default",
  onView,
  onEdit,
  onDelete,
  onBatchDelete,
  extraRowActions
}: Props) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const dataFields = rows.length === 0 ? [] : Object.keys(rows[0]).filter((c) => c !== "id");

  const rowMap = useMemo(() => {
    const map = new Map<string, Record<string, unknown>>();
    rows.forEach((row) => map.set(getRowKey(row), row));
    return map;
  }, [rows]);

  const selectedRows = useMemo(
    () => selectedRowKeys.map((key) => rowMap.get(key)).filter((row): row is Record<string, unknown> => !!row),
    [selectedRowKeys, rowMap]
  );

  const tableData = useMemo(
    () =>
      rows.map((row) => {
        const out: Record<string, unknown> = { key: getRowKey(row), _raw: row };
        dataFields.forEach((col) => {
          out[col] = formatCell(col, row[col]);
        });
        return out;
      }),
    [rows, dataFields]
  );

  useEffect(() => {
    const validKeys = new Set(rows.map((row) => getRowKey(row)));
    setSelectedRowKeys((prev) => prev.filter((key) => validKeys.has(key)));
  }, [rows]);

  const tableColumns = useMemo<TableColumnsType<Record<string, unknown>>>(() => {
    const cols: TableColumnsType<Record<string, unknown>> = dataFields.map((field) => ({
      title: columnLabels?.[field] ?? field,
      dataIndex: field,
      key: field,
      ellipsis: true
    }));
    if (onView || onEdit || onDelete || extraRowActions) {
      cols.push({
        title: "操作",
        key: "actions",
        width: 320,
        fixed: "right",
        render: (_, record) => {
          const row = (record._raw ?? null) as Record<string, unknown> | null;
          if (!row) return null;
          return (
            <Space size={8}>
              {onView ? (
                <Button type="link" size="small" onClick={() => onView(row)}>
                  详情
                </Button>
              ) : null}
              {extraRowActions ? extraRowActions(row) : null}
              {onEdit ? (
                <Button type="link" size="small" onClick={() => onEdit(row)}>
                  编辑
                </Button>
              ) : null}
              {onDelete ? (
                <Button type="link" size="small" danger onClick={() => onDelete(row)}>
                  删除
                </Button>
              ) : null}
            </Space>
          );
        }
      });
    }
    return cols;
  }, [dataFields, columnLabels, onView, onEdit, onDelete, extraRowActions]);

  const rowSelection = useMemo<NonNullable<TableProps<Record<string, unknown>>["rowSelection"]>>(
    () => ({
      selectedRowKeys,
      onChange: (keys: Key[]) => setSelectedRowKeys(keys.map(String))
    }),
    [selectedRowKeys]
  );

  const selectionLabel = useMemo(() => `已选择 ${selectedRowKeys.length} 项`, [selectedRowKeys.length]);

  return (
    <Card
      title={title}
      extra={
        <Space>
          <Typography.Text type="secondary">{selectionLabel}</Typography.Text>
          <Button size="small" onClick={() => setSelectedRowKeys([])} disabled={selectedRowKeys.length === 0}>
            清空选择
          </Button>
          {onBatchDelete ? (
            <Button size="small" danger onClick={() => onBatchDelete(selectedRows)} disabled={selectedRows.length === 0}>
              批量删除
            </Button>
          ) : null}
        </Space>
      }
    >
      <div className="entity-table">
        <AppTable
          variant={tableVariant}
          size="small"
          rowSelection={rowSelection}
          columns={tableColumns}
          dataSource={tableData}
          scroll={{ x: "max-content", y: 420 }}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            defaultPageSize: 20
          }}
        />
      </div>
    </Card>
  );
}
