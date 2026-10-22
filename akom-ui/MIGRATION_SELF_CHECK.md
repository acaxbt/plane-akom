# AKOM v0.16 migration self-check

Date: 2026-10-23 (Asia/Jakarta).

## Automated validation

- `npm run build`: passed (TypeScript and Vite production assets).
- `npm test`: 26 passed, 0 failed, 0 skipped.
- `git diff --check`: passed.
- AST coverage test: no direct button/input/textarea/select/details declarations, hand-written dialogs, browser confirmations, portal positioning code or `setPosition` remain in application control callers (`main.tsx`, `property-controls.tsx`, `description-editor.tsx`). The primitive implementations themselves correctly render native HTML.
- Tests cover existing navigation, workspace isolation, cycles, rich descriptions and textarea behavior, plus shared picker Escape/form safety, checkbox labels, protected fields, date changes/clearing, rich selected-text submission, focus-return target selection and button tooltip/accessible-name behavior.
- Floating-element geometry, dialog focus trapping and nested overlays are checked in the real browser. The DOM test environment stubs layout observation; it is not evidence of pixel or physical-device parity.

## Browser validation

All writes used `http://127.0.0.1:4174`. Existing data on port 4173 and Cloudflare was preserved.

| Check group | Result |
| --- | --- |
| Modal backward-Tab trap, Escape dismissal, trigger focus return | Pass |
| Create issue with selected bold description; Cmd+Enter; reload | Pass |
| Project/milestone/label/date/assignee edits and reload | Pass |
| Project overview, edit dialog, activity and issue tabs | Pass |
| Create/edit milestone; cancel nested deletion without changing data | Pass |
| Project options menu and workflow editor | Pass |
| Cycle create/edit and Manage issues checkbox assignment with reload | Pass |
| Team and project creation forms | Pass |
| Custom view save, shortcut dialog, keyboard search and issue navigation | Pass |
| Inline NativeSelect issue status | Pass |
| Inbox mark-read recalculates its unread badge | Pass |
| Workspace create, empty state, new team/issue and current workspace label | Pass |
| Board card layout and native drag to Todo (count increased and card moved) | Pass |
| External assignment: read-only description, no protected property editors | Pass |
| 390px navigation dialog, focus return and Create issue/popover geometry | Pass |
| Project Tab/TabPanel IDs match; dark desktop and mobile overview | Pass |
| Mobile issue fields remain available; milestone/assignee menus fit viewport | Pass |
| Mobile header persona menu anchors near header; member switching | Pass |

Fresh production preview: no captured console errors or warnings. Desktop viewport: 1280×800. Mobile viewport: 390×844. No horizontal document overflow in the inspected mobile views. Board columns intentionally scroll within their board container.

## Intentional retained implementation

- Tiptap owns the rich editor DOM and its task checkboxes. Shadcn styles and shared controls surround the editor; no editor engine replacement is attempted.
- File, color and date inputs retain platform behavior through Input. NativeSelect remains the shared shadcn primitive for simple selects.
- Boards, issue rows, milestones, avatars, status/priority indicators and calculated progress are domain components. Layout dimensions and light/dark colors remain AKOM design tokens.
- Seed members, projects and issues remain demo fixtures. The legacy activity feed remains browser-local/in-memory; this migration does not add authentication or a server event log.

## Known limitations

- Not tested on physical devices or a full browser/assistive-technology matrix.
- Production JavaScript is approximately 1.12 MB minified / 357 KB gzip. The Vite bundle-size warning remains; no unrequested code-splitting refactor is included.
- Runtime dependency audit: 30 moderate advisories, zero high/critical, in the existing Tiptap 2 / tiptap-markdown chain. npm recommends major-version upgrades. This separate editor migration is not silently combined with UI work.

## Release

Pending GitHub push, Cloudflare deployment and live smoke check.
