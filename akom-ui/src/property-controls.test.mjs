import assert from 'node:assert/strict';
import { test, after } from 'node:test';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { build } from 'esbuild';
import { Window } from 'happy-dom';

const browser = new Window({ url: 'http://localhost' });
for (const key of ['window', 'document', 'navigator', 'Node', 'Element', 'HTMLElement', 'HTMLInputElement', 'HTMLButtonElement', 'HTMLSelectElement', 'DocumentFragment', 'NodeFilter', 'MutationObserver', 'DOMParser', 'CustomEvent', 'Event', 'KeyboardEvent', 'MouseEvent', 'PointerEvent', 'ResizeObserver']) {
  Object.defineProperty(globalThis, key, { value: key === 'window' ? browser : browser[key], configurable: true });
}
// Layout is verified in the real browser; the DOM test only exercises interactions.
class TestResizeObserver { observe() {} unobserve() {} disconnect() {} }
Object.defineProperty(globalThis, 'ResizeObserver', { value: TestResizeObserver, configurable: true });
Object.defineProperty(browser, 'ResizeObserver', { value: TestResizeObserver, configurable: true });
globalThis.getComputedStyle = browser.getComputedStyle.bind(browser);
globalThis.requestAnimationFrame = browser.requestAnimationFrame.bind(browser);
globalThis.cancelAnimationFrame = browser.cancelAnimationFrame.bind(browser);
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act } = await import('react');
const { createRoot } = await import('react-dom/client');
const { Tooltip } = await import('radix-ui');
await mkdir('node_modules/.cache', { recursive: true });
const temp = await mkdtemp(resolve('node_modules/.cache/akom-controls-'));
await build({ entryPoints: ['src/property-controls.tsx', 'src/description-editor.tsx', 'src/components/app-dialog.tsx', 'src/components/ui/button.tsx'], outdir: temp, outExtension: { '.js': '.mjs' }, bundle: true, packages: 'external', format: 'esm', loader: { '.css': 'empty' }, jsx: 'automatic' });
const { PopSelect, LabelPicker, DateProperty } = await import(pathToFileURL(`${temp}/property-controls.mjs`));
const { Button } = await import(pathToFileURL(`${temp}/components/ui/button.mjs`));
const { dialogReturnTarget } = await import(pathToFileURL(`${temp}/components/app-dialog.mjs`));
const { DescriptionEditor } = await import(pathToFileURL(`${temp}/description-editor.mjs`));
after(async () => { await rm(temp, { recursive: true, force: true }); browser.happyDOM.cancelAsync(); });

async function mount(component) {
  const container = document.createElement('div'); document.body.append(container);
  const root = createRoot(container);
  await act(async () => root.render(h(Tooltip.Provider, null, component)));
  return async () => { await act(async () => root.unmount()); container.remove(); };
}
const click = async element => { await act(async () => element.click()); };

test('property picker escapes without changing a field or submitting its parent form', async () => {
  let picked = null, submitted = false;
  const cleanup = await mount(h('form', { onSubmit: event => { event.preventDefault(); submitted = true; } }, h(PopSelect, { label: 'Project', value: 'one', options: ['one', 'two'], onChange: value => picked = value })));
  const trigger = document.querySelector('button[aria-label="Project"]');
  await click(trigger);
  const options = document.querySelector('.property-picker');
  assert.ok(options); assert.ok(document.body.contains(options)); assert.equal(options.closest('form'), null);
  await act(async () => options.dispatchEvent(new browser.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
  assert.equal(document.querySelector('.property-picker'), null);
  assert.equal(document.activeElement, trigger); assert.equal(picked, null);
  await click(trigger); await click(document.querySelectorAll('.property-picker [role=option]')[1]);
  assert.equal(picked, 'two'); assert.equal(submitted, false);
  await cleanup();
});

test('labels can be selected individually and protected labels have no editing controls', async () => {
  let selected;
  let cleanup = await mount(h(LabelPicker, { value: ['Design'], options: ['Design', 'Feature'], onChange: value => selected = value, readOnly: false }));
  await click(document.querySelector('button[aria-label="Edit labels"]'));
  await click(document.querySelectorAll('.label-picker-panel button[role=checkbox]')[1]);
  assert.deepEqual(selected, ['Design', 'Feature']);
  await cleanup();
  cleanup = await mount(h(LabelPicker, { value: ['Design'], options: ['Feature'], onChange: () => assert.fail('protected field changed'), readOnly: true }));
  assert.equal(document.querySelector('.label-picker-panel'), null);
  assert.match(document.body.textContent, /Design/);
  await cleanup();
});

test('protected dates cannot open an editor or expose an editable input', async () => {
  const cleanup = await mount(h(DateProperty, { value: '2026-10-22', label: 'Due date', disabled: true, onChange: () => assert.fail('protected date changed') }));
  assert.equal(document.querySelector('.date-picker'), null);
  assert.equal(document.querySelector('input[type=date]'), null);
  assert.match(document.body.textContent, /Oct 22, 2026/);
  await cleanup();
});

test('date input and clear action both update the property', async () => {
  let selected;
  const cleanup = await mount(h(DateProperty, { value: '', label: 'Due date', onChange: value => selected = value }));
  await click(document.querySelector('button[aria-label="Due date"]'));
  const input = document.querySelector('input[type=date]');
  await act(async () => { input.value = '2026-11-12'; input.dispatchEvent(new browser.Event('input', { bubbles: true })); });
  assert.equal(selected, '2026-11-12');
  await click(document.querySelector('.date-picker-panel button'));
  assert.equal(selected, '');
  await cleanup();
});

test('creation editor captures formatting immediately, before blur or Create is clicked', async () => {
  let saved, submitted;
  const cleanup = await mount(h(DescriptionEditor, { onSubmit: value => submitted = value, value: '', readOnly: false, draft: true, onSave: value => saved = value }));
  const editorDOM = document.querySelector('.tiptap');
  // The floating toolbar is exercised in-browser; Node cannot load Tippy's CJS entry.
  editorDOM.editor.unregisterPlugin('bubbleMenu');
  await act(async () => editorDOM.editor.commands.insertContent({ type: 'paragraph', content: [{ type: 'text', text: 'Draft text', marks: [{ type: 'bold' }] }] }));
  assert.ok(saved, 'draft must reach creation state while the editor still has focus');
  assert.equal(saved.type, 'doc');
  assert.match(editorDOM.innerHTML, /<strong>Draft text<\/strong>/);
  assert.equal(document.querySelector('.description-edit-actions'), null);
  await act(async () => editorDOM.editor.commands.selectAll());
  await act(async () => editorDOM.dispatchEvent(new browser.KeyboardEvent('keydown', { key: 'Enter', metaKey: true, bubbles: true, cancelable: true })));
  assert.deepEqual(submitted, saved);
  assert.match(editorDOM.innerHTML, /<strong>Draft text<\/strong>/);
  await cleanup();
});


test('a dialog opened from a menu restores focus to the persistent menu trigger', () => {
  const trigger = document.createElement('button'); trigger.setAttribute('aria-controls', 'sample-menu');
  const menu = document.createElement('div'); menu.id = 'sample-menu'; menu.setAttribute('data-slot', 'popover-content');
  const item = document.createElement('button'); menu.append(item); document.body.append(trigger, menu);
  assert.equal(dialogReturnTarget(item), trigger);
  assert.equal(dialogReturnTarget(trigger), trigger);
  menu.remove(); trigger.remove();
});


test('button tooltip preserves its visible label and names icon-only actions', async () => {
  let cleanup = await mount(h(Button, { title: 'Create issue' }, 'New issue'));
  assert.equal(document.querySelector('button').getAttribute('aria-label'), null);
  assert.equal(document.querySelector('button').textContent, 'New issue');
  await cleanup();
  cleanup = await mount(h(Button, { title: 'Close' }, h('svg')));
  assert.equal(document.querySelector('button').getAttribute('aria-label'), 'Close');
  await cleanup();
});
