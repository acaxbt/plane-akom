export const viewLabels = { home: 'Home', triage: 'Triage', views: 'Custom views', my: 'My issues', all: 'All issues', board: 'Board', projects: 'Projects', inbox: 'Inbox', cycles: 'Cycles', initiatives: 'Initiatives', team: 'Team issues', teams: 'Explore teams', shared: 'Shared with me' };
export type View = keyof typeof viewLabels;

export function viewFromLocation(pathname: string, savedView?: unknown): View {
  if (pathname.startsWith('/project/')) return 'all';
  return typeof savedView === 'string' && Object.prototype.hasOwnProperty.call(viewLabels, savedView) ? savedView as View : 'home';
}

export function activeNavigation(view: View, projectId: string | null, teamId: string, projectTeamId: string | null) {
  if (view === 'projects' || (view === 'all' && projectId)) {
    return projectTeamId ? `team/${projectTeamId}/projects` : 'projects';
  }
  if (view === 'team' || view === 'cycles') return `team/${teamId}/${view === 'team' ? 'issues' : 'cycles'}`;
  return view;
}
