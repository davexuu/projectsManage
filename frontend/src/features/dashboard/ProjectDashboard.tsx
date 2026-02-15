import { Card, Col, Empty, Row, Statistic, Typography } from "antd";

interface Props {
  dashboard: Record<string, unknown> | null;
}

export function ProjectDashboard({ dashboard }: Props) {
  const kpis = (dashboard?.kpis as Record<string, unknown> | undefined) || {};
  const latestStatus = (dashboard?.latestStatus as Record<string, unknown> | null) || null;

  return (
    <Card title="项目总览">
      <Row gutter={[12, 12]}>
        <Col xs={24} md={8} lg={6}>
          <Statistic title="任务完成率" value={Number(kpis.taskCompletionRate ?? 0)} suffix="%" />
        </Col>
        <Col xs={24} md={8} lg={6}>
          <Statistic title="里程碑完成率" value={Number(kpis.milestoneCompletionRate ?? 0)} suffix="%" />
        </Col>
        <Col xs={24} md={8} lg={6}>
          <Statistic title="逾期任务" value={Number(kpis.taskOverdue ?? 0)} />
        </Col>
        <Col xs={24} md={8} lg={6}>
          <Statistic title="开放风险" value={Number(kpis.openRiskCount ?? 0)} />
        </Col>
        <Col xs={24} md={8} lg={6}>
          <Statistic title="升级风险" value={Number(kpis.escalatedRiskCount ?? 0)} />
        </Col>
      </Row>

      <Typography.Title level={5} style={{ marginTop: 16 }}>
        最新状态评估
      </Typography.Title>
      {latestStatus ? <pre>{JSON.stringify(latestStatus, null, 2)}</pre> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无状态评估数据" />}
    </Card>
  );
}

