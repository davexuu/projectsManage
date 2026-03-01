export type UserRole = 'ADMIN' | 'PM' | 'MEMBER';

export type KpiKey =
  | 'taskCompletionRate'
  | 'milestoneCompletionRate'
  | 'taskOverdue'
  | 'openRiskCount'
  | 'escalatedRiskCount'
  | 'latestStatus';

export interface KpiCardConfig {
  key: KpiKey;
  label: string;
  unit?: string;
  color: string;
}

export interface DrilldownConfig {
  endpoint: 'wbs' | 'milestones' | 'risks' | 'status-assessments';
  title: string;
  summaryFields: string[];
  defaultSortKey: string;
}

export interface ReportSummaryItem {
  reportType: 'WEEKLY' | 'MONTHLY';
  period: string;
  status: 'DRAFT' | 'SUBMITTED';
  updatedAt: string;
}
