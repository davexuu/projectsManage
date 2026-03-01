import type { ProcessKey } from './navigation-config';

const STORAGE_KEY = 'pmp_process_nav_metrics';

type FlowKey = `${ProcessKey}:${string}`;

interface PendingNavigation {
  path: string;
  startedAt: number;
  clickSteps: number;
}

interface NavigationFlowRecord {
  flowKey: FlowKey;
  path: string;
  reachMs: number;
  clickSteps: number;
  at: string;
}

interface NavigationMetricsStore {
  pending?: PendingNavigation;
  clickSteps: number;
  misnavigationCount: number;
  records: NavigationFlowRecord[];
}

const DEFAULT_STORE: NavigationMetricsStore = {
  clickSteps: 0,
  misnavigationCount: 0,
  records: []
};

const BASELINE: Record<FlowKey, { clickSteps: number; reachMs: number }> = {
  'start:/module/projects': { clickSteps: 2, reachMs: 1200 },
  'plan:/planning-studio': { clickSteps: 3, reachMs: 1500 },
  'execute:/kanban': { clickSteps: 3, reachMs: 1500 },
  'monitor:/process/monitor/reports': { clickSteps: 4, reachMs: 1800 },
  'close:/module/statusAssessments': { clickSteps: 3, reachMs: 1400 }
};

function readStore(): NavigationMetricsStore {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STORE };
    const parsed = JSON.parse(raw) as NavigationMetricsStore;
    return {
      clickSteps: Number(parsed.clickSteps ?? 0),
      misnavigationCount: Number(parsed.misnavigationCount ?? 0),
      pending: parsed.pending,
      records: Array.isArray(parsed.records) ? parsed.records : []
    };
  } catch {
    return { ...DEFAULT_STORE };
  }
}

function writeStore(store: NavigationMetricsStore) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function trackNavigationClick(processKey: ProcessKey, path: string) {
  const store = readStore();
  const now = Date.now();
  if (store.pending?.path === path) {
    store.pending.clickSteps += 1;
  } else {
    store.pending = {
      path,
      startedAt: now,
      clickSteps: 1
    };
  }
  store.clickSteps += 1;
  writeStore(store);
}

export function trackNavigationReached(processKey: ProcessKey, pathname: string) {
  const store = readStore();
  const pending = store.pending;
  if (!pending) return;

  if (pathname === pending.path || pathname.startsWith(`${pending.path}/`)) {
    const flowKey = `${processKey}:${pending.path}` as FlowKey;
    store.records.push({
      flowKey,
      path: pending.path,
      reachMs: Math.max(0, Date.now() - pending.startedAt),
      clickSteps: pending.clickSteps,
      at: new Date().toISOString()
    });
    store.pending = undefined;
    writeStore(store);
    return;
  }

  if (!pathname.startsWith('/process/')) {
    store.misnavigationCount += 1;
    writeStore(store);
  }
}

export function getNavigationMetricsReport() {
  const store = readStore();
  const grouped = new Map<FlowKey, NavigationFlowRecord[]>();
  store.records.forEach((item) => {
    const current = grouped.get(item.flowKey) ?? [];
    current.push(item);
    grouped.set(item.flowKey, current);
  });

  const flows = Array.from(grouped.entries()).map(([flowKey, items]) => {
    const clickAvg = items.reduce((sum, item) => sum + item.clickSteps, 0) / items.length;
    const reachAvg = items.reduce((sum, item) => sum + item.reachMs, 0) / items.length;
    const baseline = BASELINE[flowKey];
    const clickImprovement = baseline ? ((baseline.clickSteps - clickAvg) / baseline.clickSteps) * 100 : null;
    const timeImprovement = baseline ? ((baseline.reachMs - reachAvg) / baseline.reachMs) * 100 : null;
    return {
      flowKey,
      samples: items.length,
      clickAvg: Number(clickAvg.toFixed(2)),
      reachAvg: Number(reachAvg.toFixed(2)),
      baseline,
      clickImprovementPct: clickImprovement === null ? null : Number(clickImprovement.toFixed(2)),
      timeImprovementPct: timeImprovement === null ? null : Number(timeImprovement.toFixed(2))
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    totalClicks: store.clickSteps,
    misnavigationCount: store.misnavigationCount,
    flows
  };
}

export const NAVIGATION_ACCEPTANCE = {
  keyFlowMinClickImprovementPct: 20,
  keyFlowMinTimeImprovementPct: 15,
  maxMisnavigationCount: 2
};

export function evaluateNavigationAcceptance(report = getNavigationMetricsReport()) {
  const flowFailures = report.flows
    .filter((flow) => flow.baseline)
    .filter(
      (flow) =>
        (flow.clickImprovementPct ?? -Infinity) < NAVIGATION_ACCEPTANCE.keyFlowMinClickImprovementPct ||
        (flow.timeImprovementPct ?? -Infinity) < NAVIGATION_ACCEPTANCE.keyFlowMinTimeImprovementPct
    )
    .map((flow) => flow.flowKey);

  return {
    pass: flowFailures.length === 0 && report.misnavigationCount <= NAVIGATION_ACCEPTANCE.maxMisnavigationCount,
    failures: {
      flowFailures,
      misnavigationCount: report.misnavigationCount
    },
    thresholds: NAVIGATION_ACCEPTANCE,
    report
  };
}
