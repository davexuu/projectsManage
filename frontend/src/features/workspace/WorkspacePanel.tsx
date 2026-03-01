import { Card, Col, List, Row, Tag, Typography } from 'antd';

interface ProjectOption {
  id: string;
  projectName: string;
}

interface Props {
  mode: 'my-projects' | 'todo-alerts' | 'milestone-calendar';
  projects: ProjectOption[];
  dashboard: Record<string, unknown> | null;
}

export function WorkspacePanel({ mode, projects, dashboard }: Props) {
  if (mode === 'my-projects') {
    return (
      <Card title="我的项目">
        <List
          dataSource={projects}
          renderItem={(item) => (
            <List.Item>
              <Typography.Text>{item.projectName}</Typography.Text>
            </List.Item>
          )}
        />
      </Card>
    );
  }

  if (mode === 'todo-alerts') {
    const kpis = (dashboard?.kpis as Record<string, unknown> | undefined) || {};
    return (
      <Card title="待办 / 风险预警">
        <Row gutter={[12, 12]}>
          <Col span={8}>
            <Card size="small">
              <Typography.Text>逾期任务</Typography.Text>
              <Typography.Title level={4}>{Number(kpis.taskOverdue ?? 0)}</Typography.Title>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Typography.Text>开放风险</Typography.Text>
              <Typography.Title level={4}>{Number(kpis.openRiskCount ?? 0)}</Typography.Title>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Typography.Text>升级风险</Typography.Text>
              <Typography.Title level={4}>{Number(kpis.escalatedRiskCount ?? 0)}</Typography.Title>
            </Card>
          </Col>
        </Row>
      </Card>
    );
  }

  const trend = (dashboard?.progressTrend as Array<{ period: string; progress: number }> | undefined) || [];
  return (
    <Card title="里程碑日历">
      <List
        dataSource={trend}
        locale={{ emptyText: '暂无里程碑日历数据' }}
        renderItem={(item) => (
          <List.Item>
            <Typography.Text>{String(item.period).slice(0, 10)}</Typography.Text>
            <Tag color="processing">进度 {Number(item.progress)}%</Tag>
          </List.Item>
        )}
      />
    </Card>
  );
}
