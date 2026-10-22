import assert from 'node:assert/strict';
import { test } from 'node:test';
import { EMPTY_ISSUE_FILTERS, readIssueFilters, matchesIssueFilters } from './issue-filters.ts';

test('saved views without new filters stay compatible and malformed filter values are rejected', () => {
  assert.deepEqual(readIssueFilters(undefined), EMPTY_ISSUE_FILTERS);
  assert.deepEqual(readIssueFilters({ statuses: ['Todo', null, 3], priorities: 'High', assignees: ['raka'] }), { statuses: ['Todo'], priorities: [], assignees: ['raka'] });
});

test('filters OR values in one property and AND different properties without mutating issues', () => {
  const issue = Object.freeze({ status: 'Todo', priority: 'High', assignee: null });
  const filters = { statuses: ['Todo', 'Done'], priorities: ['High'], assignees: ['unassigned'] };
  assert.equal(matchesIssueFilters(issue, filters), true);
  assert.equal(matchesIssueFilters({ ...issue, status: 'Done' }, filters), true);
  assert.equal(matchesIssueFilters({ ...issue, priority: 'Low' }, filters), false);
  assert.equal(matchesIssueFilters({ ...issue, assignee: 'raka' }, filters), false);
  assert.equal(matchesIssueFilters(issue, EMPTY_ISSUE_FILTERS), true);
});
