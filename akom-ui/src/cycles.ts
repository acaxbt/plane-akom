export type Cycle = { id: string; name: string; workspace: string; team: string; startDate: string; endDate: string };
type CycleIssue = { workspace: string; team: string; cycleId?: string | null; status: string };

export function isCycle(value: unknown): value is Cycle {
  if (!value || typeof value !== 'object') return false;
  const cycle = value as Cycle;
  return ['id', 'name', 'workspace', 'team', 'startDate', 'endDate'].every(key => typeof cycle[key as keyof Cycle] === 'string') &&
    !!cycle.id && !!cycle.workspace && !!cycle.team && cycleValidationError(cycle, []) === null;
}

export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function addCycleDays(date: string, days: number) {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * 86400000).toISOString().slice(0, 10);
}

function validDate(date: string) {
  const timestamp = Date.parse(`${date}T00:00:00Z`);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === date;
}

export function cycleValidationError(cycle: Cycle, cycles: Cycle[]) {
  if (!cycle.name.trim() || cycle.name.trim().length > 80) return 'Use a cycle name between 1 and 80 characters.';
  if (!validDate(cycle.startDate) || !validDate(cycle.endDate)) return 'Choose valid start and end dates.';
  if (cycle.endDate < cycle.startDate) return 'End date must be on or after the start date.';
  if (cycles.some(other => other.id !== cycle.id && other.workspace === cycle.workspace && other.team === cycle.team &&
    other.startDate <= cycle.endDate && other.endDate >= cycle.startDate)) return 'These dates overlap another cycle in this team.';
  return null;
}

export function cycleMatchesIssue(cycle: Cycle, issue: Pick<CycleIssue, 'workspace' | 'team'>) {
  return cycle.workspace === issue.workspace && cycle.team === issue.team;
}

export function cycleTiming(cycle: Pick<Cycle, 'startDate' | 'endDate'>, today: string) {
  const phase = today < cycle.startDate ? 'Upcoming' : today > cycle.endDate ? 'Past' : 'Current';
  return { phase, daysRemaining: Math.max(0, Math.round((Date.parse(`${cycle.endDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000) + 1) };
}

export function cycleSummary<I extends CycleIssue>(cycle: Cycle, issues: I[]) {
  const assigned = issues.filter(issue => cycleMatchesIssue(cycle, issue) && issue.cycleId === cycle.id);
  const total = assigned.filter(issue => issue.status !== 'Canceled').length;
  const done = assigned.filter(issue => issue.status === 'Done').length;
  return { issues: assigned, total, done, canceled: assigned.length - total, progress: total ? Math.round(done / total * 100) : 0 };
}
