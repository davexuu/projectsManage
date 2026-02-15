import { useEffect, useMemo, useRef, useState } from "react";
import { Card, Empty, Select, Space, Spin, Typography, message } from "antd";
import Gantt, { GanttTask } from "frappe-gantt";
import { api } from "../../api/client";
import { getErrorMessage } from "../../utils/errors";

interface WbsTaskRow extends Record<string, unknown> {
  id: string;
  taskName: string;
  level2WorkPackage: string;
  level1Stage: string;
  plannedStartDate: string;
  plannedEndDate: string;
  isCritical: "是" | "否";
  currentStatus: "未开始" | "进行中" | "延期" | "已完成";
}

interface MilestoneRow extends Record<string, unknown> {
  id: string;
  milestoneCode: string;
  milestoneName: string;
  level1Stage: string;
  plannedFinishDate: string;
  currentStatus: "未开始" | "进行中" | "延期" | "已完成";
}

interface Props {
  projectId: string;
  stage?: string;
  startDate?: string;
  endDate?: string;
}

type GanttViewMode = "Day" | "Week" | "Month";

function statusToProgress(status: WbsTaskRow["currentStatus"]) {
  if (status === "已完成") return 100;
  if (status === "进行中") return 60;
  if (status === "延期") return 35;
  return 10;
}

function statusClass(status: WbsTaskRow["currentStatus"]) {
  if (status === "已完成") return "gantt-status-done";
  if (status === "进行中") return "gantt-status-doing";
  if (status === "延期") return "gantt-status-delay";
  return "gantt-status-todo";
}

function taskClass(status: WbsTaskRow["currentStatus"], isCritical: "是" | "否") {
  const base = statusClass(status);
  return isCritical === "是" ? `${base}-critical` : `${base}-normal`;
}

function inRange(start: string, end: string, rangeStart?: string, rangeEnd?: string) {
  if (!rangeStart && !rangeEnd) return true;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const rs = rangeStart ? new Date(rangeStart).getTime() : Number.NEGATIVE_INFINITY;
  const re = rangeEnd ? new Date(rangeEnd).getTime() : Number.POSITIVE_INFINITY;
  return e >= rs && s <= re;
}

export function GanttChart({ projectId, stage, startDate, endDate }: Props) {
  const [rows, setRows] = useState<WbsTaskRow[]>([]);
  const [milestones, setMilestones] = useState<MilestoneRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<GanttViewMode>("Week");
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const ganttRef = useRef<Gantt | null>(null);

  const loadData = async () => {
    if (!projectId) {
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      const [wbs, ms] = await Promise.all([
        api.list("wbs", projectId),
        api.list("milestones", projectId)
      ]);
      setRows(wbs as WbsTaskRow[]);
      setMilestones(ms as MilestoneRow[]);
    } catch (e) {
      message.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData().catch((e) => message.error(getErrorMessage(e)));
  }, [projectId]);

  const tasks = useMemo<GanttTask[]>(
    () => {
      const wbsTasks = rows
        .filter((row) => row.plannedStartDate && row.plannedEndDate)
        .filter((row) => !stage || row.level1Stage === stage)
        .filter((row) => inRange(String(row.plannedStartDate), String(row.plannedEndDate), startDate, endDate))
        .map((row) => ({
          id: String(row.id),
          name: String(row.taskName || row.level2WorkPackage || "未命名任务"),
          start: String(row.plannedStartDate).slice(0, 10),
          end: String(row.plannedEndDate).slice(0, 10),
          progress: statusToProgress(row.currentStatus),
          custom_class: taskClass(row.currentStatus, row.isCritical)
        }));

      const milestoneTasks = milestones
        .filter((row) => row.plannedFinishDate)
        .filter((row) => !stage || row.level1Stage === stage)
        .filter((row) => inRange(String(row.plannedFinishDate), String(row.plannedFinishDate), startDate, endDate))
        .map((row) => ({
          id: `ms-${String(row.id)}`,
          name: `◆ ${String(row.milestoneCode)} ${String(row.milestoneName)}`,
          start: String(row.plannedFinishDate).slice(0, 10),
          end: String(row.plannedFinishDate).slice(0, 10),
          progress: statusToProgress(row.currentStatus),
          custom_class: "gantt-milestone"
        }));

      return [...wbsTasks, ...milestoneTasks];
    },
    [rows, milestones, stage, startDate, endDate]
  );

  useEffect(() => {
    if (!wrapperRef.current) return;
    wrapperRef.current.innerHTML = "";
    if (tasks.length === 0) return;

    ganttRef.current = new Gantt(wrapperRef.current, tasks, {
      view_mode: viewMode,
      language: "zh",
      date_format: "YYYY-MM-DD",
      readonly: true,
      on_click: (task) => {
        const row = rows.find((r) => String(r.id) === String(task.id));
        if (row) {
          message.info(`${row.taskName}（${row.currentStatus}${row.isCritical === "是" ? "，关键任务" : ""}）`);
          return;
        }
        const ms = milestones.find((m) => `ms-${String(m.id)}` === String(task.id));
        if (ms) {
          message.info(`里程碑 ${ms.milestoneCode}（${ms.currentStatus}）`);
        }
      }
    });
  }, [tasks, viewMode, rows, milestones]);

  if (!projectId) {
    return <Card><Empty description="请先选择项目后查看甘特图" /></Card>;
  }

  return (
    <Card
      title="甘特图（WBS 计划）"
      extra={
        <Space>
          <Typography.Text type="secondary">视图</Typography.Text>
          <Select<GanttViewMode>
            value={viewMode}
            style={{ width: 120 }}
            onChange={setViewMode}
            options={[
              { label: "日", value: "Day" },
              { label: "周", value: "Week" },
              { label: "月", value: "Month" }
            ]}
          />
        </Space>
      }
    >
      <Spin spinning={loading}>
        {tasks.length === 0 ? (
          <Empty description="暂无可用计划数据，无法生成甘特图" />
        ) : (
          <div>
            <div ref={wrapperRef} style={{ overflowX: "auto" }} />
            <Space wrap style={{ marginTop: 12 }}>
              <Typography.Text type="secondary">图例：</Typography.Text>
              <span className="gantt-legend gantt-status-todo">未开始</span>
              <span className="gantt-legend gantt-status-doing">进行中</span>
              <span className="gantt-legend gantt-status-delay">延期</span>
              <span className="gantt-legend gantt-status-done">已完成</span>
              <span className="gantt-legend gantt-milestone-legend">里程碑</span>
              <span className="gantt-legend gantt-critical-legend">关键路径</span>
            </Space>
          </div>
        )}
      </Spin>
    </Card>
  );
}
