const MODULE_KEY_ALIASES: Record<string, string> = {
  projects: 'projects',
  wbs: 'wbs',
  milestones: 'milestones',
  progressRecords: 'progressRecords',
  'progress-records': 'progressRecords',
  statusAssessments: 'statusAssessments',
  'status-assessments': 'statusAssessments',
  risks: 'risks',
  changes: 'changes'
};

const ENDPOINT_TO_MODULE_KEY: Record<string, string> = {
  projects: 'projects',
  wbs: 'wbs',
  milestones: 'milestones',
  'progress-records': 'progressRecords',
  'status-assessments': 'statusAssessments',
  risks: 'risks',
  changes: 'changes'
};

export function normalizeModuleKey(input: string | null | undefined): string {
  const raw = String(input ?? '').trim();
  if (!raw) return '';
  return MODULE_KEY_ALIASES[raw] ?? '';
}

export function resolveModulePath(moduleLikeKey: string | null | undefined): string {
  const normalized = normalizeModuleKey(moduleLikeKey);
  return normalized ? `/module/${normalized}` : '/module/projects';
}

export function resolveModulePathByEndpoint(endpoint: string | null | undefined): string {
  const key = ENDPOINT_TO_MODULE_KEY[String(endpoint ?? '').trim()];
  return resolveModulePath(key || '');
}
