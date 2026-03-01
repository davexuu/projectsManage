import { Button, Card, Space } from 'antd';

interface Props {
  onNavigate: (path: string) => void;
}

export function QuickActions({ onNavigate }: Props) {
  return (
    <Card size="small" title="快捷动作">
      <Space wrap>
        <Button type="primary" onClick={() => onNavigate('/planning-studio')}>
          录入WBS
        </Button>
        <Button onClick={() => onNavigate('/module/progressRecords')}>新增推进记录</Button>
        <Button onClick={() => onNavigate('/module/risks')}>处理风险</Button>
        <Button onClick={() => onNavigate('/process/monitor')}>进入监控过程</Button>
      </Space>
    </Card>
  );
}
