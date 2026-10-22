import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addCycleDays, cycleMatchesIssue, cycleSummary, cycleTiming, cycleValidationError, isCycle, localDate } from './cycles.ts';

const cycle = { id: 'media-1', name: 'Cycle 1', workspace: 'product', team: 'Media', startDate: '2026-10-19', endDate: '2026-11-01' };

test('stored cycles reject malformed records before rendering', () => {
  assert.equal(isCycle(cycle), true);
  for (const value of [null, 1, {}, { ...cycle, name: null }, { ...cycle, team: '' }, { ...cycle, endDate: '2026-02-30' }]) assert.equal(isCycle(value), false);
});

test('cycles validate names, real dates, ranges and inclusive team overlaps', () => {
  assert.equal(cycleValidationError(cycle, [cycle]), null);
  for (const patch of [{ name: ' ' }, { name: 'x'.repeat(81) }, { startDate: '2026-02-30' }, { endDate: '' }, { endDate: '2026-10-18' }]) {
    assert.equal(typeof cycleValidationError({ ...cycle, ...patch }, []), 'string');
  }
  const next = { ...cycle, id: 'media-2', startDate: '2026-11-01', endDate: '2026-11-14' };
  assert.match(cycleValidationError(next, [cycle]), /overlap/);
  assert.equal(cycleValidationError({ ...next, startDate: '2026-11-02' }, [cycle]), null);
  assert.equal(cycleValidationError({ ...next, team: 'Data' }, [cycle]), null);
  assert.equal(cycleValidationError({ ...next, workspace: 'studio' }, [cycle]), null);
  assert.equal(cycleValidationError({ ...cycle, startDate: '2028-02-29', endDate: '2028-02-29' }, []), null);
});

test('cycle phase includes both boundary days and counts calendar days across DST', () => {
  assert.deepEqual(cycleTiming(cycle, '2026-10-18'), { phase: 'Upcoming', daysRemaining: 15 });
  assert.deepEqual(cycleTiming(cycle, '2026-10-19'), { phase: 'Current', daysRemaining: 14 });
  assert.deepEqual(cycleTiming(cycle, '2026-10-22'), { phase: 'Current', daysRemaining: 11 });
  assert.deepEqual(cycleTiming(cycle, '2026-11-01'), { phase: 'Current', daysRemaining: 1 });
  assert.deepEqual(cycleTiming(cycle, '2026-11-02'), { phase: 'Past', daysRemaining: 0 });
  assert.equal(addCycleDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addCycleDays('2028-02-28', 1), '2028-02-29');
  assert.equal(localDate(new Date(2026, 9, 22, 23, 59)), '2026-10-22');
});

test('only issues in the same team and workspace can enter a cycle', () => {
  assert.equal(cycleMatchesIssue(cycle, { workspace: 'product', team: 'Media' }), true);
  assert.equal(cycleMatchesIssue(cycle, { workspace: 'product', team: 'Data' }), false);
  assert.equal(cycleMatchesIssue(cycle, { workspace: 'studio', team: 'Media' }), false);
});

test('progress uses assigned issues, excludes canceled work and reacts to status/removal', () => {
  const issue = patch => ({ workspace: 'product', team: 'Media', cycleId: cycle.id, status: 'Todo', ...patch });
  const issues = [issue({ status: 'Done' }), issue({}), issue({ status: 'Canceled' }), issue({ team: 'Data', status: 'Done' }), issue({ workspace: 'studio' }), issue({ cycleId: null }), issue({ cycleId: 'other' })];
  const result = cycleSummary(cycle, issues);
  assert.equal(result.issues.length, 3);
  assert.deepEqual([result.total, result.done, result.canceled, result.progress], [2, 1, 1, 50]);
  assert.equal(cycleSummary(cycle, issues.map((item, index) => index === 1 ? { ...item, status: 'Done' } : item)).progress, 100);
  assert.equal(cycleSummary(cycle, issues.map(item => ({ ...item, cycleId: null }))).total, 0);
  assert.deepEqual(cycleSummary(cycle, [issue({ status: 'Canceled' })]), { issues: [issue({ status: 'Canceled' })], total: 0, done: 0, canceled: 1, progress: 0 });
});
