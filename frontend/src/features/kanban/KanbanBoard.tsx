import { useEffect, useMemo, useState } from "react";
import { Card, Col, Empty, Row, Spin, Tag, Typography, message } from "antd";
import { api } from "../../api/client";
import { getErrorMessage } from "../../utils/errors";

type TaskStatus = "未开始" | "进行中" | "延期" | "已完成";

interface WbsTaskRow extends Record<string, unknown> {
  id: string;
  projectId: string;
  taskName: string;
  level2WorkPackage: string;
  taskOwner: string;
  currentStatus: TaskStatus;
}

interface Props {
  projectId: string;
  stage?: string;
  startDate?: string;
  endDate?: string;
}

const STATUS_COLUMNS: Array<{ key: TaskStatus; title: string; color: string }> = [
  { key: "未开始", title: "未开始", color: "default" },
  { key: "进行中", title: "进行中", color: "processing" },
  { key: "延期", title: "延期", color: "error" },
  { key: "已完成", title: "已完成", color: "success" }
];

function inDateRange(start: string, end: string, rangeStart?: string, rangeEnd?: string) {
  if (!rangeStart && !rangeEnd) return true;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const rs = rangeStart ? new Date(rangeStart).getTime() : Number.NEGATIVE_INFINITY;
  const re = rangeEnd ? new Date(rangeEnd).getTime() : Number.POSITIVE_INFINITY;
  return e >= rs && s <= re;
}

export function KanbanBoard({ projectId, stage, startDate, endDate }: Props) {
  const [tasks, setTasks] = useState<WbsTaskRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [draggingId, setDraggingId] = useState<string>("");

  const loadTasks = async () => {
    if (!projectId) {
      setTasks([]);
      return;
    }
    setLoading(true);
    try {
      const rows = (await api.list("wbs", projectId)) as WbsTaskRow[];
      setTasks(rows);
    } catch (e) {
      message.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks().catch((e) => message.error(getErrorMessage(e)));
  }, [projectId]);

  const grouped = useMemo(() => {
    const filtered = tasks.filter((task) => {
      const hitStage = !stage || String(task.level1Stage ?? "") === stage;
      const hitDate = inDateRange(String(task.plannedStartDate ?? ""), String(task.plannedEndDate ?? ""), startDate, endDate);
      return hitStage && hitDate;
    });

    const map: Record<TaskStatus, WbsTaskRow[]> = {
      未开始: [],
      进行中: [],
      延期: [],
      已完成: []
    };
    filtered.forEach((task) => {
      map[task.currentStatus]?.push(task);
    });
    return map;
  }, [tasks, stage, startDate, endDate]);

  const moveTask = async (taskId: string, targetStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.currentStatus === targetStatus) return;

    const previous = tasks;
    const next = tasks.map((t) => (t.id === taskId ? { ...t, currentStatus: targetStatus } : t));
    setTasks(next);

    try {
      await api.update("wbs", taskId, {
        ...task,
        currentStatus: targetStatus
      });
      message.success(`任务已更新为「${targetStatus}」`);
    } catch (e) {
      setTasks(previous);
      message.error(getErrorMessage(e));
    }
  };

  if (!projectId) {
    return <Card><Empty description="请先选择项目后查看看板" /></Card>;
  }

  return (
    <Card title="任务看板（WBS）">
      <Spin spinning={loading}>
        <Row gutter={12} align="top">
          {STATUS_COLUMNS.map((column) => (
            <Col key={column.key} xs={24} md={12} lg={6}>
              <Card
                size="small"
                title={
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{column.title}</span>
                    <Tag color={column.color}>{grouped[column.key].length}</Tag>
                  </div>
                }
                style={{ minHeight: 420, background: "#fafafa" }}
                bodyStyle={{ display: "flex", flexDirection: "column", gap: 8 }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => moveTask(draggingId, column.key).catch((e) => message.error(getErrorMessage(e)))}
              >
                {grouped[column.key].length === 0 ? (
                  <Typography.Text type="secondary">暂无任务</Typography.Text>
                ) : (
                  grouped[column.key].map((task) => (
                    <Card
                      key={task.id}
                      size="small"
                      hoverable
                      draggable
                      onDragStart={() => setDraggingId(task.id)}
                      onDragEnd={() => setDraggingId("")}
                      style={{ cursor: "grab" }}
                    >
                      <Typography.Text strong>{String(task.taskName ?? "")}</Typography.Text>
                      <br />
                      <Typography.Text type="secondary">
                        工作包：{String(task.level2WorkPackage ?? "-")}
                      </Typography.Text>
                      <br />
                      <Typography.Text type="secondary">
                        责任人：{String(task.taskOwner ?? "-")}
                      </Typography.Text>
                    </Card>
                  ))
                )}
              </Card>
            </Col>
          ))}
        </Row>
      </Spin>
    </Card>
  );
}
