import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Window } from 'happy-dom';

const browser = new Window();
for (const key of ['window', 'document', 'navigator', 'Node', 'HTMLElement', 'MutationObserver', 'DOMParser']) {
  Object.defineProperty(globalThis, key, { value: key === 'window' ? browser : browser[key], configurable: true });
}
const { Editor } = await import('@tiptap/core');
const { descriptionContent, descriptionExtensions, descriptionText } = await import('./description-content.ts');

function createEditor(content, editable = true) {
  return new Editor({ extensions: descriptionExtensions(), content: descriptionContent(content), editable });
}

test('legacy Markdown and bullet text become real rich-text nodes', () => {
  const editor = createEditor('## Acceptance criteria\n\n**Bold** and *italic*\n\n• First item\n• Second item\n\n- [ ] Review');
  assert.match(editor.getHTML(), /<h2>Acceptance criteria<\/h2>/);
  assert.match(editor.getHTML(), /<strong>Bold<\/strong> and <em>italic<\/em>/);
  assert.match(editor.getHTML(), /<ul[^>]*><li[^>]*><p>First item<\/p>/);
  assert.match(editor.getHTML(), /data-type="taskItem"/);
  editor.destroy();
});

test('formatting survives JSON persistence, including underline and links', () => {
  const editor = createEditor('A formatted description');
  editor.chain().setTextSelection({ from: 3, to: 12 }).toggleBold().toggleItalic().toggleUnderline().setLink({ href: 'https://example.com' }).run();
  const saved = JSON.parse(JSON.stringify(editor.getJSON()));
  const restored = createEditor(saved);
  assert.deepEqual(JSON.parse(JSON.stringify(restored.getJSON())), saved);
  assert.match(restored.getHTML(), /<strong>/);
  assert.match(restored.getHTML(), /<em>/);
  assert.match(restored.getHTML(), /<u>/);
  assert.match(restored.getHTML(), /href="https:\/\/example.com"/);
  editor.commands.undo();
  assert.equal(editor.getText(), 'A formatted description');
  assert.doesNotMatch(editor.getHTML(), /<(strong|em|u)>/);
  editor.destroy();
  restored.destroy();
});

test('legacy HTML is literal text and unsafe rich-text links cannot render', () => {
  const editor = createEditor('<img src=x onerror=alert(1)><script>alert(1)</script>');
  assert.equal(editor.view.dom.querySelector('img,script'), null);
  editor.commands.setContent({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Unsafe', marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }] }] }] }, false);
  assert.doesNotMatch(editor.getHTML(), /href="javascript:/);
  editor.destroy();
});

test('external-assignee descriptions stay read-only', () => {
  const editor = createEditor('Shared description', false);
  assert.equal(editor.isEditable, false);
  assert.equal(editor.view.dom.getAttribute('contenteditable'), 'false');
  editor.destroy();
});

test('issue summaries accept both legacy text and rich-text descriptions', () => {
  assert.equal(descriptionText('Legacy summary'), 'Legacy summary');
  const editor = createEditor('**Rich** summary');
  assert.equal(descriptionText(editor.getJSON()), 'Rich summary');
  editor.destroy();
});
