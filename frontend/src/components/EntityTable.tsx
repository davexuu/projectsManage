import { useEffect, useMemo, useState } from "react";
import type { Key } from "react";
import { Button, Card, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

interface Props {
  title: string;
  rows: Record<string, unknown>[];
  columnLabels?: Record<string, string>;
  onEdit?: (row: Record<string, unknown>) => void;
}

export function EntityTable({ title, rows, columnLabels, onEdit }: Props) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const columns = rows.length === 0 ? [] : Object.keys(rows[0]).filter((c) => c !== "id");
  const formatCell = (col: string, value: unknown) => {
    const text = String(value ?? "");
    if ((col === "createdAt" || col === "updatedAt") && text) {
      const date = new Date(text);
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleString("zh-CN", { hour12: false });
      }
    }
    return text;
  };

  const tableColumns: ColumnsType<Record<string, unknown>> = columns.map((col) => ({
    title: columnLabels?.[col] ?? col,
    dataIndex: col,
    key: col,
    render: (value: unknown) => formatCell(col, value)
  }));

  if (onEdit) {
    tableColumns.push({
      title: "操作",
      key: "__action",
      render: (_: unknown, row: Record<string, unknown>) => (
        <Button size="small" onClick={() => onEdit(row)}>
          编辑
        </Button>
      )
    });
  }

  useEffect(() => {
    const validKeys = new Set(rows.map((row) => String(row.id ?? JSON.stringify(row))));
    setSelectedRowKeys((prev) => prev.filter((key) => validKeys.has(String(key))));
  }, [rows]);

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
        </Space>
      }
    >
      <Table
        className="entity-table"
        size="middle"
        rowKey={(row) => String(row.id ?? JSON.stringify(row))}
        columns={tableColumns}
        dataSource={rows}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys)
        }}
        locale={{ emptyText: "暂无数据" }}
        pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
        scroll={{ x: 900 }}
      />
    </Card>
  );
}
