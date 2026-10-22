export type View = 'triage' | 'views' | 'my' | 'all' | 'board' | 'projects' | 'inbox' | 'cycles' | 'initiatives' | 'team' | 'teams' | 'shared';

export function activeNavigation(view: View, projectId: string | null, teamId: string, projectTeamId: string | null) {
  if (view === 'projects' || (view === 'all' && projectId)) {
    return projectTeamId ? `team/${projectTeamId}/projects` : 'projects';
  }
  if (view === 'team' || view === 'cycles') return `team/${teamId}/${view === 'team' ? 'issues' : 'cycles'}`;
  return view;
}
