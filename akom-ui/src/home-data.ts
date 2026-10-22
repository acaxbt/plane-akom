type HomeIssue = { id: string; workspace: string; assignee: string | null; creator: string; project: string; status: string; priority: string };
type HomeProject = { id: string; workspace: string; lead?: string };
export type HomeActivity = { id: string; body: string; time: string };

export function homeSummary<I extends HomeIssue, P extends HomeProject>(issues: I[], projects: P[], activity: HomeActivity[], viewer: string, workspace: string, isMember: boolean) {
  const localIssues = isMember ? issues.filter(issue => issue.workspace === workspace) : [];
  const involved = localIssues.filter(issue => issue.assignee === viewer || issue.creator === viewer);
  const priorities: Record<string, number> = { Urgent: 0, High: 1, Medium: 2, Low: 3, None: 4 };
  const work = involved.filter(issue => issue.assignee === viewer && issue.status !== 'Done' && issue.status !== 'Canceled')
    .sort((a, b) => (priorities[a.priority] ?? 4) - (priorities[b.priority] ?? 4));
  const relatedProjects = isMember ? projects.filter(project => project.workspace === workspace &&
    (project.lead === viewer || involved.some(issue => issue.project === project.id))) : [];
  const relevantIds = new Set(localIssues.filter(issue => involved.includes(issue) || relatedProjects.some(project => project.id === issue.project)).map(issue => issue.id));
  return { work, projects: relatedProjects, activity: activity.filter(event => relevantIds.has(event.id)) };
}
