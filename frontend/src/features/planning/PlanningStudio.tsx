import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, DatePicker, Empty, List, Modal, Radio, Row, Space, Tag, Typography, message } from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { api } from '../../api/client';
import { AppTable } from '../../components/AppTable';
import { DynamicForm } from '../../components/DynamicForm';
import { GanttChart } from '../charts/GanttChart';
import type { FormField, FormSchemaMap } from '../../types';
import { getErrorMessage } from '../../utils/errors';

const { RangePicker } = DatePicker;

interface ProjectOption {
  id: string;
  projectName: string;
}

interface WbsTaskRow extends Record<string, unknown> {
  id: string;
  wbsCode?: string;
  taskName: string;
  level1Stage: string;
  taskOwner: string;
  plannedStartDate: string;
  plannedEndDate: string;
  currentStatus: string;
  predecessorTaskIds?: string[];
}

interface MilestoneRow extends Record<string, unknown> {
  id: string;
  milestoneCode: string;
  milestoneName: string;
  level1Stage: string;
  plannedFinishDate: string;
  currentStatus: string;
  linkWarning?: string;
  linkedTaskSummaries?: Array<{ id: string; taskName: string; wbsCode?: string }>;
}

interface Props {
  projectId: string;
  projects: ProjectOption[];
  schemas: FormSchemaMap;
}

function formatDate(dateValue: unknown) {
  const text = String(dateValue ?? '').trim();
  if (!text) return '-';
  const date = dayjs(text);
  return date.isValid() ? date.format('YYYY-MM-DD') : text.slice(0, 10);
}

export function PlanningStudio({ projectId, projects, schemas }: Props) {
  const [stage, setStage] = useState<string>('');
  const [timeRange, setTimeRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [wbsRows, setWbsRows] = useState<WbsTaskRow[]>([]);
  const [milestoneRows, setMilestoneRows] = useState<MilestoneRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [wbsModalOpen, setWbsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState('');
  const [conflictTaskIds, setConflictTaskIds] = useState<string[]>([]);

  const startDate = timeRange[0] ? timeRange[0].format('YYYY-MM-DD') : undefined;
  const endDate = timeRange[1] ? timeRange[1].format('YYYY-MM-DD') : undefined;

  const loadData = async () => {
    if (!projectId) {
      setWbsRows([]);
      setMilestoneRows([]);
      return;
    }
    setLoading(true);
    try {
      const [wbs, milestones] = await Promise.all([
        api.list('wbs', projectId, { stage: stage || undefined, startDate, endDate }),
        api.list('milestones', projectId, {
          stage: stage || undefined,
          startDate,
          endDate,
          includeTaskSummary: 'true'
        })
      ]);
      setWbsRows(wbs as WbsTaskRow[]);
      setMilestoneRows(milestones as MilestoneRow[]);
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData().catch((error) => message.error(getErrorMessage(error)));
  }, [projectId, stage, startDate, endDate]);

  const wbsFields = useMemo<FormField[]>(() => {
    const fields = schemas.wbs || [];
    return fields.map((field) => {
      if (field.key === 'projectId') {
        return {
          ...field,
          label: '项目名称',
          type: 'select',
          options: projects.map((project) => ({ label: project.projectName, value: project.id }))
        };
      }
      return field;
    });
  }, [schemas.wbs, projects]);

  const wbsColumns = useMemo(
    () => {
      const rowLookup = new Map(wbsRows.map((row) => [row.id, row]));
      const successors = new Map<string, string[]>();
      wbsRows.forEach((row) => {
        const predecessors = Array.isArray(row.predecessorTaskIds) ? row.predecessorTaskIds : [];
        predecessors.forEach((predecessorId) => {
          const list = successors.get(predecessorId) || [];
          list.push(row.taskName);
          successors.set(predecessorId, list);
        });
      });
      return [
      { title: 'WBS编码', dataIndex: 'wbsCode', key: 'wbsCode', width: 120 },
      { title: '任务名称', dataIndex: 'taskName', key: 'taskName', width: 240 },
      { title: '阶段', dataIndex: 'level1Stage', key: 'level1Stage', width: 100 },
      { title: '责任人', dataIndex: 'taskOwner', key: 'taskOwner', width: 120 },
      { title: '计划开始', dataIndex: 'plannedStartDate', key: 'plannedStartDate', width: 130, render: formatDate },
      { title: '计划完成', dataIndex: 'plannedEndDate', key: 'plannedEndDate', width: 130, render: formatDate },
      { title: '状态', dataIndex: 'currentStatus', key: 'currentStatus', width: 100 },
      {
        title: '紧前任务',
        key: 'predecessors',
        width: 220,
        render: (_: unknown, row: WbsTaskRow) => {
          const predecessorNames = (row.predecessorTaskIds ?? [])
            .map((id) => rowLookup.get(id))
            .filter((item): item is WbsTaskRow => Boolean(item))
            .map((item) => item.taskName);
          if (predecessorNames.length === 0) return '-';
          return predecessorNames.join('；');
        }
      },
      {
        title: '紧后任务',
        key: 'successors',
        width: 220,
        render: (_: unknown, row: WbsTaskRow) => {
          const names = successors.get(row.id) || [];
          if (names.length === 0) return '-';
          return names.join('；');
        }
      }
    ];
    },
    [wbsRows]
  );

  const milestoneColumns = useMemo(
    () => [
      { title: '里程碑编号', dataIndex: 'milestoneCode', key: 'milestoneCode', width: 140 },
      { title: '里程碑名称', dataIndex: 'milestoneName', key: 'milestoneName', width: 220 },
      { title: '阶段', dataIndex: 'level1Stage', key: 'level1Stage', width: 100 },
      { title: '计划完成', dataIndex: 'plannedFinishDate', key: 'plannedFinishDate', width: 130, render: formatDate },
      { title: '状态', dataIndex: 'currentStatus', key: 'currentStatus', width: 100 },
      {
        title: '支撑任务',
        key: 'linkedTaskSummaries',
        render: (_: unknown, row: MilestoneRow) => {
          const size = row.linkedTaskSummaries?.length || 0;
          if (size > 0) return <Tag color='processing'>{size} 条</Tag>;
          return <Tag color={row.linkWarning ? 'error' : 'warning'}>{row.linkWarning ? '缺少支撑任务' : '未关联'}</Tag>;
        }
      }
    ],
    []
  );

  const handleBatchSubmit = async (rows: Record<string, unknown>[]) => {
    const targetProjectId = String(projectId || rows[0]?.projectId || '').trim();
    if (!targetProjectId) {
      message.warning('请先选择项目');
      return;
    }
    const normalized = rows.map((row) => ({ ...row, projectId: targetProjectId }));
    await api.batchCreateWbs({ projectId: targetProjectId, items: normalized });
    setConflictTaskIds([]);
    setWbsModalOpen(false);
    await loadData();
    message.success(`已提交 ${rows.length} 条WBS分解项`);
  };

  const handleBatchValidate = async (rows: Record<string, unknown>[]) => {
    const targetProjectId = String(projectId || rows[0]?.projectId || '').trim();
    if (!targetProjectId) {
      return { ok: false, conflicts: [{ rowIndex: 0, field: 'projectId', message: '请先选择项目' }] };
    }
    const normalized = rows.map((row) => ({ ...row, projectId: targetProjectId }));
    const validation = await api.validateWbsPlan({ projectId: targetProjectId, items: normalized });
    if (!validation.ok) {
      const relatedIds = validation.conflicts
        .map((item) => item.relatedTaskId)
        .filter((value): value is string => Boolean(value));
      const currentRowIds = validation.conflicts
        .map((item) => String(rows[item.rowIndex]?.id ?? '').trim())
        .filter(Boolean);
      setConflictTaskIds(Array.from(new Set([...relatedIds, ...currentRowIds])));
      const summary = validation.conflicts
        .slice(0, 3)
        .map((item) => `第 ${item.rowIndex + 1} 行：${item.message}`)
        .join('；');
      if (summary) message.warning(summary);
    } else {
      setConflictTaskIds([]);
    }
    return validation;
  };

  const predecessorOptions = useMemo(
    () =>
      wbsRows.map((row) => ({
        value: row.id,
        label: row.wbsCode ? `${row.wbsCode} ${row.taskName}` : row.taskName
      })),
    [wbsRows]
  );

  if (!projectId) {
    return (
      <Card>
        <Empty description='请先选择项目后进入计划编排工作台' />
      </Card>
    );
  }

  return (
    <Space direction='vertical' style={{ width: '100%' }} size={12}>
      <Card title='计划编排工作台' extra={<Button type='primary' onClick={() => setWbsModalOpen(true)}>快速分解WBS</Button>}>
        <Space wrap>
          <Typography.Text>阶段筛选</Typography.Text>
          <Radio.Group
            optionType='button'
            buttonStyle='solid'
            value={stage || '全部'}
            options={['全部', '启动', '规划', '执行', '验收'].map((item) => ({ label: item, value: item }))}
            onChange={(event) => setStage(event.target.value === '全部' ? '' : String(event.target.value))}
          />
          <Typography.Text>时间范围</Typography.Text>
          <RangePicker
            value={timeRange}
            placeholder={['开始日期', '结束日期']}
            onChange={(value) => setTimeRange(value ?? [null, null])}
          />
        </Space>
      </Card>

      <Row gutter={12}>
        <Col xs={24} xl={14}>
          <Card title={`WBS任务（${wbsRows.length}）`}>
            <AppTable<WbsTaskRow>
              rowKey='id'
              loading={loading}
              columns={wbsColumns}
              dataSource={wbsRows}
              rowClassName={(row) =>
                [
                  row.id === selectedTaskId ? 'planning-row-selected' : '',
                  conflictTaskIds.includes(row.id) ? 'planning-row-conflict' : ''
                ]
                  .filter(Boolean)
                  .join(' ')
              }
              onRow={(row) => ({
                onClick: () => {
                  setSelectedTaskId(row.id);
                  setSelectedMilestoneId('');
                }
              })}
              scroll={{ x: 'max-content', y: 360 }}
              pagination={{ pageSize: 8 }}
            />
          </Card>
        </Col>

        <Col xs={24} xl={10}>
          <Card title={`里程碑（${milestoneRows.length}）`}>
            <AppTable<MilestoneRow>
              rowKey='id'
              loading={loading}
              columns={milestoneColumns}
              dataSource={milestoneRows}
              rowClassName={(row) => (row.id === selectedMilestoneId ? 'planning-row-selected' : '')}
              onRow={(row) => ({
                onClick: () => {
                  setSelectedMilestoneId(row.id);
                  setSelectedTaskId('');
                }
              })}
              scroll={{ x: 'max-content', y: 220 }}
              pagination={{ pageSize: 5 }}
            />

            <List
              size='small'
              style={{ marginTop: 12 }}
              header='里程碑时间线'
              dataSource={milestoneRows}
              locale={{ emptyText: '暂无里程碑计划' }}
              renderItem={(item) => (
                <List.Item>
                  <Space>
                    <Typography.Text>{formatDate(item.plannedFinishDate)}</Typography.Text>
                    <Typography.Text strong>{item.milestoneCode}</Typography.Text>
                    <Typography.Text>{item.milestoneName}</Typography.Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {conflictTaskIds.length > 0 ? (
        <Alert
          type='warning'
          showIcon
          message='检测到计划冲突'
          description='冲突任务已在表格与甘特图中标记，请优先处理前置依赖时间矛盾。'
        />
      ) : null}

      <GanttChart
        projectId={projectId}
        stage={stage || undefined}
        startDate={startDate}
        endDate={endDate}
        highlightTaskId={selectedTaskId || undefined}
        highlightMilestoneId={selectedMilestoneId || undefined}
        conflictTaskIds={conflictTaskIds}
        onSelect={(target) => {
          if (target.type === 'wbs') {
            setSelectedTaskId(target.id);
            setSelectedMilestoneId('');
            return;
          }
          setSelectedMilestoneId(target.id);
          setSelectedTaskId('');
        }}
      />

      <Modal open={wbsModalOpen} onCancel={() => setWbsModalOpen(false)} footer={null} width={980} destroyOnClose>
        <DynamicForm
          fields={wbsFields}
          moduleKey='wbs'
          title='WBS任务分解录入（批量）'
          submitText='提交'
          initialValues={{ projectId }}
          enableDraft
          draftStorageKey={`pmp:planning-studio:wbs:${projectId}:draft`}
          predecessorOptions={predecessorOptions}
          onBatchValidate={handleBatchValidate}
          onGenerateWbsSuggestions={async (prompt, options) => {
            return api.quickSuggestWbs({
              projectId,
              prompt,
              mode: options?.mode,
              targetStage: options?.targetStage
            });
          }}
          onBatchSubmit={handleBatchSubmit}
          onCancel={() => setWbsModalOpen(false)}
          onSubmit={async (payload) => {
            await api.create('wbs', { ...payload, projectId });
            setWbsModalOpen(false);
            await loadData();
          }}
        />
      </Modal>
    </Space>
  );
}
