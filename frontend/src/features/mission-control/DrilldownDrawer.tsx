import { useMemo } from 'react';
import { Button, Drawer, Empty, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { KPI_DRILLDOWN_CONFIG } from './config';
import { KpiKey } from './types';

interface Props {
  open: boolean;
  kpiKey: KpiKey | null;
  rows: Record<string, unknown>[];
  loading: boolean;
  onClose: () => void;
  onViewAll: (kpiKey: KpiKey) => void;
}

function asText(value: unknown) {
  if (value === null || value === undefined) return '-';
  return String(value);
}

export function DrilldownDrawer({ open, kpiKey, rows, loading, onClose, onViewAll }: Props) {
  const config = kpiKey ? KPI_DRILLDOWN_CONFIG[kpiKey] : null;
  const columns = useMemo<ColumnsType<Record<string, unknown>>>(() => {
    if (!config) return [];
    return config.summaryFields.map((field) => ({
      title: field,
      dataIndex: field,
      key: field,
      render: (value: unknown) => asText(value)
    }));
  }, [config]);

  return (
    <Drawer
      open={open}
      width={760}
      title={config?.title || '指标明细'}
      onClose={onClose}
      extra={
        kpiKey ? (
          <Space>
            <Button type="primary" onClick={() => onViewAll(kpiKey)}>
              查看全部
            </Button>
          </Space>
        ) : null
      }
    >
      {config ? (
        <>
          <Typography.Paragraph type="secondary">
            当前展示最新 20 条摘要明细，点击“查看全部”进入完整列表。
          </Typography.Paragraph>
          <Table<Record<string, unknown>>
            rowKey={(row) => String(row.id ?? JSON.stringify(row))}
            loading={loading}
            columns={columns}
            dataSource={rows}
            pagination={false}
            locale={{ emptyText: <Empty description="暂无可用明细" /> }}
            size="small"
          />
        </>
      ) : (
        <Empty description="请选择指标后查看明细" />
      )}
    </Drawer>
  );
}
