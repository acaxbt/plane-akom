import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';
test('application controls consistently use shared shadcn primitives', () => {
  for (const file of ['main.tsx', 'property-controls.tsx', 'description-editor.tsx']) {
    const source = readFileSync(new URL(file, import.meta.url), 'utf8');
    const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const raw = [];
    function walk(node) {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const tag = node.tagName.getText(ast);
        if (['button', 'input', 'textarea', 'select', 'details'].includes(tag)) raw.push(tag);
      }
      ts.forEachChild(node, walk);
    }
    walk(ast);
    assert.deepEqual(raw, [], `${file} bypasses the shared control layer`);
    assert.doesNotMatch(source, /window\.confirm|createPortal|setPosition/);
    assert.doesNotMatch(source, /role="dialog"/);
  }
});
