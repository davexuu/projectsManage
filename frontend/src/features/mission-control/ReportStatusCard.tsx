import { Badge, Button, Card, Space, Typography } from 'antd';
import { ReportSummaryItem } from './types';

interface Props {
  title: string;
  reportType: 'WEEKLY' | 'MONTHLY';
  summary: ReportSummaryItem | null;
  onOpen: (reportType: 'WEEKLY' | 'MONTHLY') => void;
  onGenerateDraft: (reportType: 'WEEKLY' | 'MONTHLY') => void;
}

function statusText(status: 'DRAFT' | 'SUBMITTED') {
  return status === 'SUBMITTED' ? '已提交' : '草稿';
}

export function ReportStatusCard({ title, reportType, summary, onOpen, onGenerateDraft }: Props) {
  return (
    <Card size="small" title={title}>
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        {summary ? (
          <>
            <Badge status={summary.status === 'SUBMITTED' ? 'success' : 'processing'} text={`状态：${statusText(summary.status)}`} />
            <Typography.Text type="secondary">周期：{summary.period}</Typography.Text>
            <Typography.Text type="secondary">更新时间：{new Date(summary.updatedAt).toLocaleString()}</Typography.Text>
          </>
        ) : (
          <Typography.Text type="secondary">暂无报告</Typography.Text>
        )}
        <Space>
          <Button type="primary" onClick={() => onOpen(reportType)}>
            打开报告
          </Button>
          <Button onClick={() => onGenerateDraft(reportType)}>自动草拟</Button>
        </Space>
      </Space>
    </Card>
  );
}
