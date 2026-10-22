export type IssueFilters = { statuses: string[]; priorities: string[]; assignees: string[] };
export const EMPTY_ISSUE_FILTERS: IssueFilters = { statuses: [], priorities: [], assignees: [] };

export function readIssueFilters(value: unknown): IssueFilters {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const strings = (key: string) => Array.isArray(source[key]) ? source[key].filter((item): item is string => typeof item === 'string') : [];
  return { statuses: strings('statuses'), priorities: strings('priorities'), assignees: strings('assignees') };
}

export function matchesIssueFilters(issue: { status: string; priority: string; assignee: string | null }, filters: IssueFilters) {
  return (!filters.statuses.length || filters.statuses.includes(issue.status)) &&
    (!filters.priorities.length || filters.priorities.includes(issue.priority)) &&
    (!filters.assignees.length || filters.assignees.includes(issue.assignee || 'unassigned'));
}
