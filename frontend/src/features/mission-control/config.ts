import { DrilldownConfig, KpiCardConfig, KpiKey, UserRole } from './types';

const COMMON_KPIS: KpiCardConfig[] = [
  { key: 'taskCompletionRate', label: '任务完成率', unit: '%', color: '#1677ff' },
  { key: 'milestoneCompletionRate', label: '里程碑完成率', unit: '%', color: '#13c2c2' },
  { key: 'taskOverdue', label: '逾期任务', color: '#fa8c16' },
  { key: 'openRiskCount', label: '开放风险', color: '#f5222d' }
];

export const ROLE_KPI_CONFIG: Record<UserRole, KpiCardConfig[]> = {
  ADMIN: [...COMMON_KPIS, { key: 'escalatedRiskCount', label: '升级风险', color: '#cf1322' }, { key: 'latestStatus', label: '最新状态评估', color: '#722ed1' }],
  PM: [...COMMON_KPIS, { key: 'escalatedRiskCount', label: '升级风险', color: '#cf1322' }, { key: 'latestStatus', label: '最新状态评估', color: '#722ed1' }],
  MEMBER: [...COMMON_KPIS, { key: 'latestStatus', label: '最新状态评估', color: '#722ed1' }]
};

export const KPI_DRILLDOWN_CONFIG: Record<KpiKey, DrilldownConfig> = {
  taskCompletionRate: {
    endpoint: 'wbs',
    title: '任务完成情况（WBS）',
    summaryFields: ['taskName', 'level1Stage', 'taskOwner', 'currentStatus', 'plannedEndDate'],
    defaultSortKey: 'plannedEndDate'
  },
  milestoneCompletionRate: {
    endpoint: 'milestones',
    title: '里程碑完成情况',
    summaryFields: ['milestoneCode', 'milestoneName', 'level1Stage', 'owner', 'currentStatus', 'plannedFinishDate'],
    defaultSortKey: 'plannedFinishDate'
  },
  taskOverdue: {
    endpoint: 'wbs',
    title: '逾期任务明细',
    summaryFields: ['taskName', 'level1Stage', 'taskOwner', 'currentStatus', 'plannedEndDate'],
    defaultSortKey: 'plannedEndDate'
  },
  openRiskCount: {
    endpoint: 'risks',
    title: '开放风险明细',
    summaryFields: ['riskCode', 'riskType', 'stage', 'owner', 'currentStatus', 'plannedResolveDate'],
    defaultSortKey: 'plannedResolveDate'
  },
  escalatedRiskCount: {
    endpoint: 'risks',
    title: '升级风险明细',
    summaryFields: ['riskCode', 'riskType', 'stage', 'owner', 'currentStatus', 'escalateToManagement'],
    defaultSortKey: 'plannedResolveDate'
  },
  latestStatus: {
    endpoint: 'status-assessments',
    title: '状态评估明细',
    summaryFields: ['assessmentDate', 'currentStage', 'overallStatus', 'scheduleStatus', 'qualityStatus', 'riskStatus'],
    defaultSortKey: 'assessmentDate'
  }
};

export const KPI_DEFAULT_FILTERS: Record<KpiKey, Record<string, string>> = {
  taskCompletionRate: {},
  milestoneCompletionRate: {},
  taskOverdue: { overdue: 'true' },
  openRiskCount: { onlyOpen: 'true' },
  escalatedRiskCount: { onlyOpen: 'true', escalated: 'true' },
  latestStatus: { latest: 'true' }
};
