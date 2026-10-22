import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resizeTextarea } from './resize-textarea.ts';

test('textareas shrink before measuring wrapped content', () => {
  const style = { height: '300px' };
  const element = {
    style,
    get scrollHeight() {
      assert.equal(style.height, 'auto');
      return 72;
    },
  };
  resizeTextarea(element);
  assert.equal(style.height, '72px');
  resizeTextarea(null);
});
