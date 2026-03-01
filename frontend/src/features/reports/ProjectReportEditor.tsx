import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Empty, Form, Input, Select, Space, Tag, Typography, message } from 'antd';
import { api, ProjectReportItem } from '../../api/client';
import { getErrorMessage } from '../../utils/errors';

interface Props {
  projectId: string;
  reportType?: 'WEEKLY' | 'MONTHLY';
  period?: string;
}

function defaultPeriod(type: 'WEEKLY' | 'MONTHLY') {
  const now = new Date();
  if (type === 'MONTHLY') {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  const start = new Date(now);
  start.setDate(now.getDate() - 6);
  return `${start.toISOString().slice(0, 10)}~${now.toISOString().slice(0, 10)}`;
}

export function ProjectReportEditor({ projectId, reportType, period }: Props) {
  const [loading, setLoading] = useState(false);
  const [activeType, setActiveType] = useState<'WEEKLY' | 'MONTHLY'>(reportType || 'WEEKLY');
  const [activePeriod, setActivePeriod] = useState(period || defaultPeriod(reportType || 'WEEKLY'));
  const [status, setStatus] = useState<'DRAFT' | 'SUBMITTED'>('DRAFT');
  const [content, setContent] = useState('');
  const [sourceSnapshot, setSourceSnapshot] = useState<unknown>(null);

  const title = useMemo(() => (activeType === 'WEEKLY' ? '周报' : '月报'), [activeType]);

  const load = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const rows = await api.listProjectReports(projectId, activeType);
      const hit = rows.find((row) => row.period === activePeriod);
      if (hit) {
        setStatus(hit.status);
        setContent(hit.content);
        setSourceSnapshot(hit.sourceSnapshot ?? null);
      } else {
        setStatus('DRAFT');
        setContent('');
        setSourceSnapshot(null);
      }
    } catch (e) {
      message.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch((e) => message.error(getErrorMessage(e)));
  }, [projectId, activeType, activePeriod]);

  if (!projectId) {
    return (
      <Card>
        <Empty description="请先选择项目后编写报告" />
      </Card>
    );
  }

  return (
    <Card title={`${title}编辑`} loading={loading}>
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <Space wrap>
          <Typography.Text>报告类型</Typography.Text>
          <Select<'WEEKLY' | 'MONTHLY'>
            style={{ width: 140 }}
            value={activeType}
            options={[
              { label: '周报', value: 'WEEKLY' },
              { label: '月报', value: 'MONTHLY' }
            ]}
            onChange={(value) => {
              setActiveType(value);
              setActivePeriod(defaultPeriod(value));
            }}
          />
          <Typography.Text>周期</Typography.Text>
          <Input style={{ width: 260 }} value={activePeriod} onChange={(e) => setActivePeriod(e.target.value)} />
          <Tag color={status === 'SUBMITTED' ? 'success' : 'processing'}>{status === 'SUBMITTED' ? '已提交' : '草稿'}</Tag>
        </Space>
        <Input.TextArea value={content} rows={14} placeholder="请输入报告内容" onChange={(e) => setContent(e.target.value)} />
        <Space>
          <Button
            onClick={async () => {
              try {
                const report = await api.generateProjectReportDraft({
                  projectId,
                  reportType: activeType,
                  period: activePeriod
                });
                setStatus(report.status);
                setContent(report.content);
                setSourceSnapshot(report.sourceSnapshot ?? null);
                message.success('已自动生成草稿');
              } catch (e) {
                message.error(getErrorMessage(e));
              }
            }}
          >
            自动草拟
          </Button>
          <Button
            type="default"
            onClick={async () => {
              try {
                await api.upsertProjectReport({
                  projectId,
                  reportType: activeType,
                  period: activePeriod,
                  status: 'DRAFT',
                  content: content || '（空白草稿）',
                  sourceSnapshot
                });
                setStatus('DRAFT');
                message.success('已保存草稿');
              } catch (e) {
                message.error(getErrorMessage(e));
              }
            }}
          >
            保存草稿
          </Button>
          <Button
            type="primary"
            onClick={async () => {
              try {
                await api.upsertProjectReport({
                  projectId,
                  reportType: activeType,
                  period: activePeriod,
                  status: 'SUBMITTED',
                  content: content || '（空白提交）',
                  sourceSnapshot
                });
                setStatus('SUBMITTED');
                message.success('已提交报告');
              } catch (e) {
                message.error(getErrorMessage(e));
              }
            }}
          >
            提交报告
          </Button>
        </Space>
        {sourceSnapshot ? (
          <Form.Item label="自动草拟来源快照">
            <Input.TextArea value={JSON.stringify(sourceSnapshot, null, 2)} rows={8} readOnly />
          </Form.Item>
        ) : null}
      </Space>
    </Card>
  );
}
