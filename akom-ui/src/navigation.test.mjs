import assert from 'node:assert/strict';
import { test } from 'node:test';
import { activeNavigation } from './navigation.ts';

test('project details retain their global or team navigation context', () => {
  assert.equal(activeNavigation('projects', null, 'Media', null), 'projects');
  assert.equal(activeNavigation('all', 'fyp', 'Media', null), 'projects');
  assert.equal(activeNavigation('projects', null, 'Media', 'Media'), 'team/Media/projects');
  assert.equal(activeNavigation('all', 'fyp', 'Media', 'Media'), 'team/Media/projects');
});

test('team navigation distinguishes Issues and Cycles without selecting another team', () => {
  assert.equal(activeNavigation('team', null, 'Data', null), 'team/Data/issues');
  assert.equal(activeNavigation('cycles', null, 'Media', null), 'team/Media/cycles');
  assert.equal(activeNavigation('all', null, 'Media', null), 'all');
  assert.equal(activeNavigation('inbox', null, 'Media', null), 'inbox');
});
