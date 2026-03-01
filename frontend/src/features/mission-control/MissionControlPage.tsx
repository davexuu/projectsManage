import { useEffect, useMemo, useState } from 'react';
import { Card, Col, Empty, Row, Space, message } from 'antd';
import { api } from '../../api/client';
import { getErrorMessage } from '../../utils/errors';
import { DrilldownDrawer } from './DrilldownDrawer';
import { KPI_DEFAULT_FILTERS, KPI_DRILLDOWN_CONFIG, ROLE_KPI_CONFIG } from './config';
import { KpiCard } from './KpiCard';
import { QuickActions } from './QuickActions';
import { ReportStatusCard } from './ReportStatusCard';
import { KpiKey, ReportSummaryItem, UserRole } from './types';

interface Props {
  role: UserRole;
  projectId: string;
  dashboard: Record<string, unknown> | null;
  onNavigate: (path: string) => void;
}

function kpiValue(key: KpiKey, dashboard: Record<string, unknown> | null): number {
  const kpis = (dashboard?.kpis as Record<string, unknown> | undefined) || {};
  if (key === 'latestStatus') return dashboard?.latestStatus ? 1 : 0;
  return Number(kpis[key] ?? 0);
}

function filterRows(kpiKey: KpiKey, rows: Record<string, unknown>[]) {
  if (kpiKey === 'taskOverdue') {
    const now = Date.now();
    return rows.filter((row) => String(row.currentStatus ?? '') !== '已完成' && new Date(String(row.plannedEndDate ?? '')).getTime() < now);
  }
  if (kpiKey === 'openRiskCount') return rows.filter((row) => String(row.currentStatus ?? '') !== '已完成');
  if (kpiKey === 'escalatedRiskCount') {
    return rows.filter((row) => String(row.currentStatus ?? '') !== '已完成' && String(row.escalateToManagement ?? '') === '是');
  }
  if (kpiKey === 'latestStatus') return rows.slice(0, 1);
  return rows;
}

function reportPeriod(reportType: 'WEEKLY' | 'MONTHLY') {
  const now = new Date();
  if (reportType === 'MONTHLY') {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  const start = new Date(now);
  start.setDate(now.getDate() - 6);
  return `${start.toISOString().slice(0, 10)}~${now.toISOString().slice(0, 10)}`;
}

export function MissionControlPage({ role, projectId, dashboard, onNavigate }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeKpi, setActiveKpi] = useState<KpiKey | null>(null);
  const [drillRows, setDrillRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<Record<'WEEKLY' | 'MONTHLY', ReportSummaryItem | null>>({
    WEEKLY: null,
    MONTHLY: null
  });

  const kpis = useMemo(() => ROLE_KPI_CONFIG[role], [role]);

  const loadSummary = async () => {
    if (!projectId) {
      setSummary({ WEEKLY: null, MONTHLY: null });
      return;
    }
    const result = await api.projectReportSummary(projectId);
    setSummary({
      WEEKLY: (result.weekly as ReportSummaryItem | null) ?? null,
      MONTHLY: (result.monthly as ReportSummaryItem | null) ?? null
    });
  };

  useEffect(() => {
    loadSummary().catch((e) => message.error(getErrorMessage(e)));
  }, [projectId]);

  const openDrilldown = async (kpiKey: KpiKey) => {
    if (!projectId) return;
    if (role === 'MEMBER' && kpiKey === 'escalatedRiskCount') {
      message.warning('当前角色无权查看升级风险穿透明细');
      return;
    }
    const config = KPI_DRILLDOWN_CONFIG[kpiKey];
    setActiveKpi(kpiKey);
    setDrawerOpen(true);
    setLoading(true);
    try {
      const rows = (await api.list(config.endpoint, projectId)) as Record<string, unknown>[];
      setDrillRows(filterRows(kpiKey, rows).slice(0, 20));
      sessionStorage.setItem('mission-control:last-kpi', kpiKey);
    } catch (e) {
      message.error(getErrorMessage(e));
      setDrillRows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAll = (kpiKey: KpiKey) => {
    sessionStorage.setItem(
      'mission-control:return-state',
      JSON.stringify({ kpiKey, scrollY: window.scrollY, projectId })
    );
    const config = KPI_DRILLDOWN_CONFIG[kpiKey];
    const params = new URLSearchParams({
      projectId,
      ...KPI_DEFAULT_FILTERS[kpiKey]
    });
    onNavigate(`/module/${config.endpoint === 'status-assessments' ? 'statusAssessments' : config.endpoint}?${params.toString()}`);
  };

  useEffect(() => {
    const raw = sessionStorage.getItem('mission-control:return-state');
    if (!raw || !projectId) return;
    try {
      const parsed = JSON.parse(raw) as { kpiKey?: KpiKey; scrollY?: number; projectId?: string };
      if (parsed.projectId !== projectId || !parsed.kpiKey) return;
      openDrilldown(parsed.kpiKey).catch((e) => message.error(getErrorMessage(e)));
      if (typeof parsed.scrollY === 'number') {
        requestAnimationFrame(() => window.scrollTo({ top: parsed.scrollY, behavior: 'auto' }));
      }
      sessionStorage.removeItem('mission-control:return-state');
    } catch {
      sessionStorage.removeItem('mission-control:return-state');
    }
  }, [projectId]);

  const openReport = (reportType: 'WEEKLY' | 'MONTHLY') => {
    const period = summary[reportType]?.period || reportPeriod(reportType);
    onNavigate(`/process/monitor/reports?projectId=${projectId}&reportType=${reportType}&period=${encodeURIComponent(period)}`);
  };

  const generateDraft = async (reportType: 'WEEKLY' | 'MONTHLY') => {
    if (!projectId) return;
    try {
      await api.generateProjectReportDraft({ projectId, reportType, period: reportPeriod(reportType) });
      message.success('已生成报告草稿');
      await loadSummary();
    } catch (e) {
      message.error(getErrorMessage(e));
    }
  };

  if (!projectId) {
    return (
      <Card>
        <Empty description="请先选择项目后进入 Mission Control" />
      </Card>
    );
  }

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Row gutter={[12, 12]}>
        {kpis.map((item) => (
          <Col key={item.key} xs={24} md={12} xl={8}>
            <KpiCard config={item} value={kpiValue(item.key, dashboard)} onClick={() => openDrilldown(item.key)} />
          </Col>
        ))}
      </Row>
      <Row gutter={[12, 12]}>
        <Col xs={24} lg={12}>
          <ReportStatusCard title="周报状态" reportType="WEEKLY" summary={summary.WEEKLY} onOpen={openReport} onGenerateDraft={generateDraft} />
        </Col>
        <Col xs={24} lg={12}>
          <ReportStatusCard title="月报状态" reportType="MONTHLY" summary={summary.MONTHLY} onOpen={openReport} onGenerateDraft={generateDraft} />
        </Col>
      </Row>
      <QuickActions onNavigate={onNavigate} />

      <DrilldownDrawer
        open={drawerOpen}
        kpiKey={activeKpi}
        rows={drillRows}
        loading={loading}
        onClose={() => setDrawerOpen(false)}
        onViewAll={handleViewAll}
      />
    </Space>
  );
}
