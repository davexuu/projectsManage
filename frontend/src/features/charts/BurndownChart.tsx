import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Card, Empty, Spin, Table, Typography, message } from "antd";
import { api } from "../../api/client";
import { getErrorMessage } from "../../utils/errors";

const ReactECharts = lazy(() => import("echarts-for-react"));

interface ProgressRecordRow extends Record<string, unknown> {
  id: string;
  statPeriod: string;
  overallProgressPct: number;
}

interface Props {
  projectId: string;
  stage?: string;
  startDate?: string;
  endDate?: string;
}

function toDayText(value: string) {
  if (!value) return "";
  return value.length >= 10 ? value.slice(0, 10) : value;
}

function inDateRange(value: string, rangeStart?: string, rangeEnd?: string) {
  if (!rangeStart && !rangeEnd) return true;
  const v = new Date(value).getTime();
  const rs = rangeStart ? new Date(rangeStart).getTime() : Number.NEGATIVE_INFINITY;
  const re = rangeEnd ? new Date(rangeEnd).getTime() : Number.POSITIVE_INFINITY;
  return v >= rs && v <= re;
}

export function BurndownChart({ projectId, stage, startDate, endDate }: Props) {
  const [rows, setRows] = useState<ProgressRecordRow[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    if (!projectId) {
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      const list = (await api.list("progress-records", projectId)) as ProgressRecordRow[];
      const filtered = list.filter((row) => {
        const hitStage = !stage || String(row.currentStage ?? "") === stage;
        const hitDate = inDateRange(String(row.statPeriod ?? ""), startDate, endDate);
        return hitStage && hitDate;
      });
      const sorted = [...filtered].sort((a, b) => String(a.statPeriod).localeCompare(String(b.statPeriod)));
      setRows(sorted);
    } catch (e) {
      message.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData().catch((e) => message.error(getErrorMessage(e)));
  }, [projectId, stage, startDate, endDate]);

  const chartData = useMemo(() => {
    const x = rows.map((r) => toDayText(String(r.statPeriod ?? "")));
    const actualRemaining = rows.map((r) => Math.max(0, 100 - Number(r.overallProgressPct ?? 0)));
    const count = rows.length;
    const idealRemaining =
      count <= 1
        ? rows.map(() => 100)
        : rows.map((_, idx) => Number((100 - (100 * idx) / (count - 1)).toFixed(2)));
    return { x, actualRemaining, idealRemaining };
  }, [rows]);

  const option = useMemo(
    () => ({
      tooltip: { trigger: "axis" },
      legend: { data: ["实际剩余工作", "理想燃尽线"] },
      grid: { left: 40, right: 24, top: 48, bottom: 36 },
      xAxis: { type: "category", data: chartData.x },
      yAxis: { type: "value", name: "剩余工作(%)", min: 0, max: 100 },
      series: [
        {
          name: "实际剩余工作",
          type: "line",
          smooth: true,
          data: chartData.actualRemaining
        },
        {
          name: "理想燃尽线",
          type: "line",
          smooth: true,
          lineStyle: { type: "dashed" },
          data: chartData.idealRemaining
        }
      ]
    }),
    [chartData]
  );

  if (!projectId) {
    return <Card><Empty description="请先选择项目后查看燃尽图" /></Card>;
  }

  return (
    <Card title="燃尽图（基于推进记录）">
      <Spin spinning={loading}>
        {rows.length === 0 ? (
          <Empty description="暂无推进记录，无法生成燃尽图" />
        ) : (
          <>
            <Suspense fallback={<Spin />}>
              <ReactECharts option={option} style={{ height: 360 }} />
            </Suspense>
            <Typography.Title level={5}>数据明细</Typography.Title>
            <Table
              rowKey="id"
              columns={[
                { title: "统计周期", dataIndex: "statPeriod", key: "statPeriod", render: (v: unknown) => toDayText(String(v ?? "")) },
                { title: "整体进度(%)", dataIndex: "overallProgressPct", key: "overallProgressPct" },
                {
                  title: "实际剩余工作(%)",
                  key: "remaining",
                  render: (_: unknown, row: ProgressRecordRow) => Math.max(0, 100 - Number(row.overallProgressPct ?? 0))
                }
              ]}
              dataSource={rows}
              pagination={{ pageSize: 10 }}
            />
          </>
        )}
      </Spin>
    </Card>
  );
}
