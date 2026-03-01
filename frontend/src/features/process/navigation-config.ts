export type ProcessKey = 'start' | 'plan' | 'execute' | 'monitor' | 'close';

export interface ProcessNavItem {
  key: string;
  label: string;
  path: string;
  highFrequency?: boolean;
}

export interface ProcessNavGroup {
  key: string;
  label: string;
  items: ProcessNavItem[];
}

export interface ProcessNavSection {
  title: string;
  description: string;
  groups: ProcessNavGroup[];
}

export const PROCESS_NAVIGATION: Record<ProcessKey, ProcessNavSection> = {
  start: {
    title: '启动过程',
    description: '聚焦立项与治理边界，先明确项目与授权关系。',
    groups: [
      {
        key: 'baseline',
        label: '基础信息',
        items: [
          { key: 'project-card', label: '项目立项卡', path: '/module/projects', highFrequency: true }
        ]
      }
    ]
  },
  plan: {
    title: '规划过程',
    description: '形成任务分解、里程碑和时间排程。',
    groups: [
      {
        key: 'planning',
        label: '计划编制',
        items: [
          { key: 'planning-studio', label: '计划编排工作台', path: '/planning-studio', highFrequency: true }
        ]
      }
    ]
  },
  execute: {
    title: '执行过程',
    description: '跟踪任务推进并沉淀执行证据。',
    groups: [
      {
        key: 'execution',
        label: '执行推进',
        items: [
          { key: 'kanban', label: '任务看板', path: '/kanban', highFrequency: true },
          { key: 'progress', label: '推进记录', path: '/module/progressRecords', highFrequency: true }
        ]
      }
    ]
  },
  monitor: {
    title: '监控过程',
    description: '统一查看偏差、风险、状态与报告。',
    groups: [
      {
        key: 'monitoring',
        label: '监控分析',
        items: [
          { key: 'burndown', label: '燃尽图', path: '/burndown' },
          { key: 'status-assessments', label: '状态评估', path: '/module/statusAssessments', highFrequency: true },
          { key: 'risks', label: '风险问题台账', path: '/module/risks', highFrequency: true },
          { key: 'changes', label: '变更申请', path: '/module/changes' }
        ]
      },
      {
        key: 'reporting',
        label: '报告中心',
        items: [
          { key: 'reports', label: '周报月报', path: '/process/monitor/reports', highFrequency: true }
        ]
      }
    ]
  },
  close: {
    title: '收尾过程',
    description: '在收尾阶段完成复盘与经验沉淀。',
    groups: [
      {
        key: 'closing',
        label: '收尾与复盘',
        items: [{ key: 'retrospective', label: '项目复盘（状态评估）', path: '/module/statusAssessments', highFrequency: true }]
      }
    ]
  }
};

export function flattenProcessNavItems(processKey: ProcessKey): ProcessNavItem[] {
  return PROCESS_NAVIGATION[processKey].groups.flatMap((group) => group.items);
}

export function resolveActiveProcessNavPath(processKey: ProcessKey, pathname: string): string {
  const items = flattenProcessNavItems(processKey);
  const exact = items.find((item) => pathname === item.path);
  if (exact) return exact.path;

  const matched = items
    .filter((item) => pathname.startsWith(`${item.path}/`))
    .sort((a, b) => b.path.length - a.path.length);

  return matched[0]?.path ?? '';
}

export function resolveProcessMenuKey(pathname: string): string {
  if (pathname.startsWith('/process/start')) return '/process/start';
  if (pathname.startsWith('/process/plan')) return '/process/plan';
  if (pathname.startsWith('/process/execute')) return '/process/execute';
  if (pathname.startsWith('/process/monitor')) return '/process/monitor';
  if (pathname.startsWith('/process/close')) return '/process/close';
  return pathname;
}
