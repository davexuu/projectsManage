import { Button, Card, Empty, Space, Typography } from 'antd';

interface Props {
  processKey: 'start' | 'plan' | 'execute' | 'monitor' | 'close';
  onNavigate: (path: string) => void;
  projectId: string;
}

const PROCESS_CONFIG: Record<Props['processKey'], { title: string; links: Array<{ label: string; path: string }> }> = {
  start: {
    title: '启动过程',
    links: [
      { label: '项目立项卡', path: '/module/projects' }
    ]
  },
  plan: {
    title: '规划过程',
    links: [
      { label: '计划编排工作台', path: '/planning-studio' }
    ]
  },
  execute: {
    title: '执行过程',
    links: [
      { label: '任务看板', path: '/kanban' },
      { label: '推进记录', path: '/module/progressRecords' }
    ]
  },
  monitor: {
    title: '监控过程',
    links: [
      { label: '燃尽图', path: '/burndown' },
      { label: '周报月报', path: '/process/monitor/reports' },
      { label: '状态评估', path: '/module/statusAssessments' },
      { label: '风险问题台账', path: '/module/risks' },
      { label: '变更申请', path: '/module/changes' }
    ]
  },
  close: {
    title: '收尾过程',
    links: [{ label: '项目复盘（状态评估）', path: '/module/statusAssessments' }]
  }
};

export function ProcessWorkspace({ processKey, onNavigate, projectId }: Props) {
  if (!projectId) {
    return (
      <Card>
        <Empty description="请先选择项目后查看过程工作区" />
      </Card>
    );
  }
  const config = PROCESS_CONFIG[processKey];
  return (
    <Card title={config.title}>
      <Typography.Paragraph type="secondary">按过程组织页面，减少在一级菜单中来回跳转。</Typography.Paragraph>
      <Space wrap>
        {config.links.map((link) => (
          <Button key={link.path} type="primary" onClick={() => onNavigate(link.path)}>
            {link.label}
          </Button>
        ))}
      </Space>
    </Card>
  );
}
