import assert from 'node:assert/strict';
import { test } from 'node:test';
import { homeSummary } from './home-data.ts';

const issue = (id, patch = {}) => ({ id, workspace: 'product', assignee: 'raka', creator: 'nadia', project: 'feed', status: 'Todo', priority: 'Medium', ...patch });
const projects = [
  { id: 'feed', workspace: 'product' },
  { id: 'lead', workspace: 'product', lead: 'raka' },
  { id: 'unrelated', workspace: 'product' },
  { id: 'external', workspace: 'studio', lead: 'raka' },
];
const issues = [issue('medium'), issue('urgent', { priority: 'Urgent' }), issue('done', { status: 'Done' }), issue('canceled', { status: 'Canceled' }),
  issue('created', { assignee: 'nadia', creator: 'raka' }), issue('external', { workspace: 'studio', project: 'external' }),
  issue('unrelated', { assignee: 'nadia', project: 'unrelated' }), issue('teammate', { assignee: 'nadia' })];
const activity = ['external', 'urgent', 'unrelated', 'teammate'].map(id => ({ id, body: id, time: 'Today' }));

test('Home shows active assigned work by priority without mutating the issue list', () => {
  const before = structuredClone(issues);
  const summary = homeSummary(issues, projects, activity, 'raka', 'product', true);
  assert.deepEqual(summary.work.map(issue => issue.id), ['urgent', 'medium']);
  assert.deepEqual(issues, before);
});

test('Home includes involved or led projects and relevant workspace activity only', () => {
  const summary = homeSummary(issues, projects, activity, 'raka', 'product', true);
  assert.deepEqual(summary.projects.map(project => project.id), ['feed', 'lead']);
  assert.deepEqual(summary.activity.map(event => event.id), ['urgent', 'teammate']);
});

test('changing member or workspace recomputes Home without exposing external assignments', () => {
  assert.deepEqual(homeSummary(issues, projects, activity, 'raka', 'studio', true).work.map(issue => issue.id), ['external']);
  const other = homeSummary(issues, projects, activity, 'nadia', 'product', true);
  assert.deepEqual(other.work.map(issue => issue.id), ['created', 'unrelated', 'teammate']);
  assert.equal(other.projects.some(project => project.id === 'lead'), false);
  assert.equal(other.work.some(issue => issue.workspace === 'studio'), false);
});

test('empty workspaces and revoked membership have no Home data', () => {
  for (const [workspace, isMember] of [['empty', true], ['product', false]]) {
    assert.deepEqual(homeSummary(issues, projects, activity, 'raka', workspace, isMember), { work: [], projects: [], activity: [] });
  }
});
