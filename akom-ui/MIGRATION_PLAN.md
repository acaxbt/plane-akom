# AKOM shadcn migration plan

Preserve the v0.15 layout, issue/project/cycle behavior, demo permissions, and existing browser storage. Use upstream shadcn components with the Radix foundation, styled with AKOM tokens. Keep Tiptap and domain components (boards, issue rows, milestone management) intact.

## Implementation

- [x] Foundation: add shadcn configuration, shared utilities, Tailwind utilities without a global CSS reset, and map existing light/dark tokens.
- [x] Basic controls: migrate buttons, text inputs, textareas, native selects and checkboxes; retain special file/color/date inputs and Tiptap document surfaces where appropriate.
- [x] Overlays: migrate all 12 dialogs, confirmations, property/assignee pickers, workspace/persona/project menus and mobile navigation behavior. Ensure focus trapping, Escape handling and nested popovers work.
- [x] Navigation/feedback: migrate tabs, expandable sections, tooltips and toast notifications; retain existing page geometry.
- [x] Remove obsolete popup positioning/keyboard code and CSS rules that conflict with the new primitives. Correct the audited workspace-name lookup and seeded unread count.

## Self-check gates

- [x] Static coverage audit: every pre-existing dialog/control caller is accounted for; remaining native elements are intentional and documented.
- [x] Tests: previous tests plus dialog focus/Escape, picker selection/search, protected fields, confirmation cancellation and rich description submission.
- [x] Production build and TypeScript pass; no new browser console errors.
- [x] Browser: Home, issues/list/board, Create issue, issue details, Projects/overview/activity/milestones, Cycles/create/edit/manage, custom views, teams/workspaces and search.
- [x] Keyboard: Tab stays inside modal; Escape dismisses the current layer; focus returns to trigger; selected-text create preserves rich content.
- [x] Light/dark desktop and 390px mobile: no clipped popup, missing fields, unwanted layout shifts or horizontal overflow.
- [x] Push reviewed commit and deploy the same build to Cloudflare; smoke-test live version and save screenshots.

Test writes use port 4174 only. Existing user data on port 4173 and Cloudflare is preserved. No backend or full Linear feature parity is part of this migration.

## Outcome

Implementation and local validation are complete. See [MIGRATION_SELF_CHECK.md](MIGRATION_SELF_CHECK.md) for coverage, intentional native controls, and known limitations. GitHub push, Cloudflare deployment and live smoke check passed.
