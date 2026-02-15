import { useCallback, useEffect, useMemo, useState } from "react";
import type { S2DataConfig, TargetCellInfo } from "@antv/s2";
import { SheetComponent } from "@antv/s2-react";
import { Button, Card, Pagination, Space, Typography } from "antd";

interface Props {
  title: string;
  rows: Record<string, unknown>[];
  columnLabels?: Record<string, string>;
  onEdit?: (row: Record<string, unknown>) => void;
  onDelete?: (row: Record<string, unknown>) => void;
  onBatchDelete?: (selectedRows: Record<string, unknown>[]) => void;
}

const EDIT_FIELD = "__action_edit";
const DELETE_FIELD = "__action_delete";

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

export function EntityTable({ title, rows, columnLabels, onEdit, onDelete, onBatchDelete }: Props) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const columns = rows.length === 0 ? [] : Object.keys(rows[0]).filter((c) => c !== "id");

  const actionFields = useMemo(() => {
    const fields: string[] = [];
    if (onEdit) fields.push(EDIT_FIELD);
    if (onDelete) fields.push(DELETE_FIELD);
    return fields;
  }, [onEdit, onDelete]);

  const tableColumns = useMemo(() => [...columns, ...actionFields], [columns, actionFields]);

  const rowMap = useMemo(() => {
    const map = new Map<string, Record<string, unknown>>();
    rows.forEach((row) => map.set(getRowKey(row), row));
    return map;
  }, [rows]);

  const selectedRows = useMemo(
    () => selectedRowKeys.map((key) => rowMap.get(key)).filter((row): row is Record<string, unknown> => !!row),
    [selectedRowKeys, rowMap]
  );

  const s2Rows = useMemo(
    () =>
      rows.map((row) => {
        const out: Record<string, unknown> = {};
        columns.forEach((col) => {
          out[col] = formatCell(col, row[col]);
        });
        if (onEdit) out[EDIT_FIELD] = "编辑";
        if (onDelete) out[DELETE_FIELD] = "删除";
        out.id = row.id;
        return out;
      }),
    [rows, columns, onEdit, onDelete]
  );

  const dataCfg = useMemo<S2DataConfig>(
    () => ({
      data: s2Rows as S2DataConfig["data"],
      fields: {
        columns: tableColumns
      },
      meta: tableColumns.map((field) => ({
        field,
        name:
          field === EDIT_FIELD
            ? "编辑"
            : field === DELETE_FIELD
              ? "删除"
              : columnLabels?.[field] ?? field
      }))
    }),
    [s2Rows, tableColumns, columnLabels]
  );

  const s2Options = useMemo(
    () => ({
      height: 420,
      seriesNumber: { enable: false },
      pagination: {
        current: 1,
        pageSize: 20
      }
    }),
    []
  );

  useEffect(() => {
    const validKeys = new Set(rows.map((row) => getRowKey(row)));
    setSelectedRowKeys((prev) => prev.filter((key) => validKeys.has(key)));
  }, [rows]);

  const resolveClickedRow = useCallback(
    (info: TargetCellInfo): Record<string, unknown> | null => {
      const rawData = (info.viewMeta as { data?: unknown }).data;
      if (rawData && typeof rawData === "object" && !Array.isArray(rawData)) {
        const key = getRowKey(rawData as Record<string, unknown>);
        return rowMap.get(key) ?? (rawData as Record<string, unknown>);
      }
      const rowIndex = Number((info.viewMeta as { rowIndex?: number }).rowIndex ?? -1);
      if (rowIndex >= 0 && rowIndex < rows.length) return rows[rowIndex];
      return null;
    },
    [rowMap, rows]
  );

  const handleDataCellClick = useCallback(
    (info: TargetCellInfo) => {
      const valueField = String((info.viewMeta as { valueField?: unknown }).valueField ?? "");
      const row = resolveClickedRow(info);
      if (!row) return;

      if (valueField === EDIT_FIELD && onEdit) {
        onEdit(row);
        return;
      }
      if (valueField === DELETE_FIELD && onDelete) {
        onDelete(row);
        return;
      }

      const key = getRowKey(row);
      setSelectedRowKeys((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));
    },
    [onEdit, onDelete, resolveClickedRow]
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
      <div className="entity-s2">
        <SheetComponent
          sheetType="table"
          dataCfg={dataCfg}
          options={s2Options}
          adaptive={{ width: true, height: false }}
          onDataCellClick={handleDataCellClick}
        >
          {({ pagination }) => (
            <div className="entity-s2-footer">
              <Pagination
                size="small"
                current={pagination.current || 1}
                pageSize={pagination.pageSize || 20}
                total={pagination.total || rows.length}
                showSizeChanger
                showTotal={(total) => `共 ${total} 条`}
                onChange={(page, pageSize) => pagination.onChange?.(page, pageSize)}
                onShowSizeChange={(current, pageSize) => pagination.onShowSizeChange?.(current, pageSize)}
              />
            </div>
          )}
        </SheetComponent>
      </div>
    </Card>
  );
}
