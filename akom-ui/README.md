## Audit produk dan kesiapan backend

- [Audit produk dan model domain](PRODUCT_AUDIT.md): use case, taksonomi, objek, relasi, event dan gap produk.
- [UI dan kesiapan backend](docs/BACKEND_READINESS_AUDIT.md): dokumen kerja berkala dengan inventaris UI, register temuan/keputusan, kontrak API usulan, acceptance criteria dan evidence screenshot. Mulai sesi lanjutan dari checkpoint di dokumen ini.

## V0.16 — Shared shadcn components

The standalone AKOM prototype now uses owned shadcn/ui components generated with CLI 4.22.1 and the Radix foundation. Tailwind utilities are integrated with Vite without enabling preflight, preserving AKOM typography, light/dark tokens, sidebar widths and page spacing. The component code lives in `src/components/ui`; application adaptations remain in shared controls and AKOM styles.

- All application buttons, inputs, textareas, selects and checkboxes use shared primitives. The 12 existing dialogs share a focus-managed Dialog wrapper; mobile navigation also uses Dialog. AlertDialog replaces browser confirmations, and Sonner replaces the custom toast.
- Property and assignee pickers use Popover + Command. Label selection and date entry use shared popovers, and project actions use DropdownMenu. Persona/workspace menus use Popover; the header persona menu anchors to its own trigger on mobile.
- Project sections use linked Tabs/TabPanel semantics. My issues and Cycle filters use single-selection ToggleGroup because they filter a shared result view. Expandable details use Collapsible; titled buttons share Tooltip behavior while retaining their visible accessible labels.
- Existing storage keys and records are unchanged. Workspace labels use current records, and unread Inbox counts derive from visible unread events. Initial members/issues/projects and the activity feed remain explicitly demo data.
- Tiptap, boards, issue rows, progress calculations and milestone management retain their domain behavior. Date/file/color inputs retain browser-native behavior through Input; NativeSelect is intentional for simple form and inline selectors.

Validation: 26 tests, production build, source coverage audit and 18 browser check groups on isolated port 4174. See [migration plan](MIGRATION_PLAN.md) and [self-check report](MIGRATION_SELF_CHECK.md). No browser errors/warnings were captured in the fresh production preview used for the final checks.

Known limits: no physical-device or cross-browser matrix; browser-local demo persistence and permissions remain. Vite reports the existing large-bundle warning. `npm audit --omit=dev` reports 30 moderate advisories in the existing Tiptap 2/Markdown dependency chain (zero high/critical); suggested fixes require major editor upgrades and are not applied as part of this UI migration.

## V0.15 — Property rails and issue creation

Issue and project rails use wider responsive columns, readable wrapping values, and shared property pickers. The issue rail groups basic properties, labels, and project/milestone/stage controls; the unused ellipsis is removed. All issue properties remain available below the document on mobile. External assignment restrictions remain in place.

Project Overview orders Properties, Milestones, Progress, and Activity. Properties use aligned label/value rows. Milestone management keeps the existing board in the main workspace, opened through Manage in the rail; creation and editing remain available.

Create issue uses the existing Tiptap editor with live draft state, compact title and property chips, and a subtle title focus indicator. New descriptions persist as rich JSON, while existing text descriptions remain supported. Cmd/Ctrl+Enter captures the document before the editor's hard-break command, including when text is selected. Date controls retain the browser date selector behind a shared compact trigger. Labels use individual checkboxes with search and a create-label action instead of comma-separated text.

Validation: 23 unit tests, TypeScript and production build. Added checks cover picker Escape/focus restoration and safe form buttons, individual/protected labels, protected dates, and rich draft capture including selected-text submission. Browser verification uses the isolated port 4174 origin; the main preview's data is preserved.

Scope remains a browser-local prototype. No backend, shared storage, estimate field, project members, or complete Linear editor parity is added. Existing JavaScript bundle-size warning remains.

## V0.14 — Team cycles

Cycles now uses saved planning windows rather than the hard-coded Cycle 42, date range and 64% progress. The [Linear enabling-cycles flow on Mobbin](https://mobbin.com/flows/408edcc5-30a9-495d-b985-fcbaa924306c) establishes team-level scheduling; AKOM reuses its shared flat lists, tabs and property controls for a smaller manual workflow.

- Create or edit a cycle's name and inclusive start/end dates. New cycles default to 14 days, beginning today or after the team's latest scheduled cycle. Invalid dates, reversed ranges and overlapping windows in the same team are rejected. Other teams may use the same dates.
- All / Current / Upcoming / Past filters use the browser's local calendar date. The page refreshes its date each minute. Progress is computed from assigned team issues: Done / non-canceled issues, with canceled exclusions shown explicitly.
- Manage issues adds or removes existing issues from the same team. Checkbox changes save immediately. Issues already in another cycle can be moved or cleared through the Issue cycle property; one issue belongs to at most one cycle.
- New issue inside a cycle creates an issue in that cycle when its owning team matches. Changing the create form to a different team does not attach it to the original cycle.
- Cycle records persist under `akom_ui_v014_cycles`; assignments use optional `Issue.cycleId` in existing records. Previous data is not reset and issues are not bulk-assigned. First-time visitors start with an empty cycle list. Reset demo data clears cycles too.
- Team and cycle selection survive refresh and detail-page history navigation. External issue assignees see neither the cycle picker nor private cycle names. Workspace membership and team ownership are checked before cycle changes.

Validation: 18 unit tests pass, including malformed stored records, date boundaries/leap days, overlap isolation, team/workspace assignment boundaries and progress changes. Browser checks covered create/edit, Current/Upcoming/Past, overlap errors, management search/assignment, moving issues across cycles, creating an issue inside a cycle, persistence, canceled progress, team refresh/navigation, external-assignee restrictions, dark mode, and a 390px mobile layout/dialog with no horizontal page overflow. Test records stayed on the separate port 4174 origin.

Scope: manual cycles with browser-local persistence. Automatic cycle generation, cooldowns, rollover, burndown/history charts, deletion and cycle settings are not implemented. Ending a cycle does not move its unfinished issues. No server-side authorization or shared persistence is added.

## V0.13 — Personal workspace Home

New visits open Home, with an entry above My issues in the shared sidebar. Switching member or workspace also returns to Home. History entries retain the source view when opening an issue or project, so browser Back returns to the corresponding page; existing deep links keep working.

Home uses compact rows inspired by the [Linear Projects reference on Mobbin](https://mobbin.com/screens/3d3a4fae-d824-440a-961b-001c6b715a4a). The references returned by the Home search showed project/issue views, not a matching Linear Home; this is an AKOM composition using that visual language.

- My work shows up to five active issues assigned to the viewer in the current workspace, ordered by priority. View all opens My issues.
- Your projects shows up to four projects led by the viewer or connected to their assigned/created issues. Progress uses the existing issue/workflow calculation rather than sample percentages.
- Recent activity shows the latest saved update per related project (up to four), plus up to five relevant issue-feed entries. Updates open their project; issue events open their issue. Project updates and issue events are labeled separately because legacy records have display dates rather than comparable timestamps.
- Workspace membership is checked before deriving Home data. External assignments remain in My issues and Shared with me; Home does not reveal their parent projects. Empty workspaces show empty sections, and New issue is disabled until a team exists.

Validation: 13 unit tests cover workspace/member isolation, membership revocation, priority order, completed/canceled exclusion, project involvement, activity filtering, empty data, navigation restoration and the existing editor helpers. Browser checks covered issue/project navigation and Back, My issues, member/workspace switching, new-workspace empty states, saved project updates, dark mode, and a verified 390px mobile layout with no horizontal page overflow. Tests used port 4174 so main-preview data was preserved.

Limit: issue activity still uses the existing in-memory demo feed, including seed events and newly created issues. It is not a complete persisted audit log; project updates retain their existing localStorage persistence. No authentication, database or server-side permissions are added.

## V0.12 — Shared shell and consistent project controls

- Issues, Projects, Inbox and team pages share the same sidebar width, header height, search and navigation row dimensions. Removed project-specific shell overrides; page titles, tabs and header actions use shared styles.
- Board layouts retain the shared horizontal page gutter and a 16px gap below the toolbar, including boards opened from My issues.
- Global and team Projects retain their active navigation context when opening a project and returning to its list. Collapsed navigation keeps accessible labels, and mobile issue pages can reopen the full sidebar.
- Project Status, Lead, Target date and Teams edit directly in the Properties rail using existing controls. Changes persist in browser storage; at least one team remains selected. The full project-edit dialog remains available.
- Triage summaries support rich-text descriptions. Saving with Cmd/Ctrl+Enter is intercepted before the editor's hard-break command, preserving selected text; Escape still restores the editing baseline.

Validation: eight unit tests pass, and the production build succeeds. Browser checks covered shared dimensions across routes, global/team active navigation, back navigation, property persistence after refresh, last-team protection, popup Escape, collapsed navigation, light/dark themes, external-assignee restrictions, and Projects/issue navigation at a verified 390px viewport with no horizontal page overflow. A selected-text save regression was reproduced and verified fixed; the saved rich description also appears in Triage. Browser changes used a separate origin on port 4174, preserving the main preview's demo data.

Scope remains a browser-local prototype. No backend, production authorization or full Linear feature parity is added. Vite still reports a large JavaScript bundle after adding the rich editor.

## V0.11 — Inline WYSIWYG issue descriptions

Based on the selected-text toolbar in [Linear — Formatting text](https://mobbin.com/flows/00af76be-27f3-479c-a4ed-3ad9d527bf9c).

Issue descriptions now use Tiptap 2, the editor engine already used by Plane, with one document surface for reading and editing. Selecting text opens a floating formatting toolbar. Bold, italic, underline, strikethrough, headings, quotes, inline code, links, bullet/numbered lists and checklists render while editing. Keyboard formatting and undo/redo use the editor's native commands. Leaving the editor or pressing Cmd/Ctrl+Enter saves; Escape restores the document from the start of the edit.

Existing Markdown strings remain readable, including the demo's Unicode bullets. Edited descriptions persist as Tiptap JSON in the existing localStorage issue records so formatting survives reloads; no bulk reset or migration runs. Older V0.10 readers only accept strings and cannot render these new rich-text records. Link creation validates URL protocols, and the editor schema rejects executable markup. External assignees receive a non-editable document with no formatting controls.

Scope: issue descriptions. Comment and creation forms retain their existing behavior. This is not complete Linear editor parity: slash menus, tables and inline image uploads are not implemented.

Validation: five unit checks cover legacy content, rich-text persistence, unsafe markup/links, read-only documents and textarea sizing. Browser checks covered toolbar formatting, heading/list/checklist commands, links and validation, refresh persistence, undo, Escape and external-assignee restrictions. A mobile viewport could not be verified in the hidden test tab. Browser tests used a separate local origin on port 4174 to keep test data separate from the main preview.

## V0.10.1 — Issue detail cleanup

Reference: [Linear issue detail](https://mobbin.com/screens/cef36326-d8ec-4c6f-acd4-a9f1e1060d33) and [Linear team issue list](https://mobbin.com/screens/be6c4ee4-aa93-42b4-89b3-dcfc8386f022) on Mobbin.

- Empty sub-issue and attachment panels become compact add actions; dependencies expand on demand. Existing entries remain available.
- Labels edit inside an expandable property, and sharing details no longer dominate the properties rail.
- Escape cancels the title edit without leaving the issue. Textareas resize on edit and viewport changes; formatting controls sit beneath the description.
- Issue/viewer changes reset editor state, and issue-row keyboard actions ignore nested controls. Mobile issue headers retain a navigation button.
- Descriptions still use the existing Markdown textarea and preview, not a WYSIWYG editor. All data remains browser-local.

Validation: `npm test` checks textarea shrink/measurement behavior; `npm run build` checks TypeScript and production packaging. Browser checks covered title save/cancel, description save/cancel/blur, refresh persistence, list-to-detail navigation and external-assignee restrictions. Mobile layout has not been visually verified.

## V0.9 — Linear Projects visual parity pass (UI only)

Reference: [Mobbin Linear Projects list](https://mobbin.com/flows/92790750-e63d-4355-a401-f1d5236bf981) and [Mobbin Linear Project details](https://mobbin.com/flows/dbc027fe-6642-4cec-912b-0e05b83edca6).

- Project list uses flat, compact rows, column headings and minimal top filters, not a card/table panel.
- Project detail tabs directly below the app's breadcrumb header: **Overview · Activity · Issues** only.
- Overview moves project title and metadata into the central document column, not a full-width hero.
- Removed prominent project summary/progress cards; project brief is an unboxed document section, while project progress and properties appear in the right rail.
- Project stage workflow builder remains accessible from project options, not a top-level tab.
- Fresh demo visitors default to the light theme used in reviewed Mobbin reference images. Existing persisted theme selection is retained.

The goal is closer visual alignment, **not a claim of pixel-for-pixel identity**. No official Linear product assets were copied. All data and permissions remain simulated in the frontend.

# AKOM UI V0.4 — Linear workspace model + cross-workspace issue grants

An interactive React + Vite + TypeScript UI prototype. **No real authentication, database or server-side permission checks.** Demo data persists only in your browser's `localStorage`. The `akom-ui/` app is intentionally separate from the Plane fork; its `preview` branch is unchanged.

## Product model (Option B)

- **Workspace** is a real boundary: it owns workspace memberships, teams, projects and issues. The header switches among *only* the demo user's joined workspaces. No `All workspaces` filter exists.
- **Teams** live inside one workspace. `Your Teams` lists only teams joined by the active member; **Explore teams** can join/leave any public team in the active workspace. Team sections have Issues/Cycles/Projects navigation.
- **Projects** belong to one workspace and can be associated with multiple teams. Issue creation in that project can choose any of its participating teams.
- **Issues** have exactly one owning team and one primary assignee. Within a workspace, users can view public team issues; an explicit assignment to a member who is not in the owning workspace grants an *issue-scoped demo view* only, never implicit membership or access to other projects/issues. External assignees may change status/comment but cannot reassign, edit priority/dates/title/description or see the owning project name.
- **My issues** shows the active workspace plus issues explicitly assigned to the viewer from workspaces the viewer has not joined. **Shared with me** isolates those external issue grants. Search is restricted to current-workspace issues and issues explicitly shared with the viewer.
- **Organization-level directory** is used when assigning an issue. Assignees in the current workspace are shown first; people from other workspaces are grouped separately and marked as issue-scoped recipients.
- Changing the assignee removes the previous recipient's demo access immediately. No parent/project links are available in external-issue view.

## Ready-made scenarios

1. **Team hierarchy:** preview as Raka, choose **AKOM Product** in the top-left switcher. `Your Teams` contains Product Media. `Explore teams` shows Product Media and Product Data. Join Data; it appears under Your Teams with Issues/Cycles/Projects.
2. **Multi-team projects:** in AKOM Product open **For You Experience**. You should see `MED-*` and `DAT-085`. Create a project and check both Media and Data teams. Create a Data-owned issue inside that project.
3. **Switch workspace:** Raka is a member of Product and Operations, so both appear in the switcher. Studio does **not**, because Raka isn't a member.
4. **Cross-workspace grant:** preview as **Alina** (AKOM Studio only). `MED-128` from Product appears in **My issues** and **Shared with me** because Alina is assigned. She cannot navigate into AKOM Product or see its project list.
5. **Grant revocation:** switch to Raka in AKOM Product and reassign `MED-128` to Nadia. Switch back to Alina; the issue should disappear from Shared with me and search.
6. **Inverse grant:** Raka has `DSN-052` assigned from AKOM Studio; it appears in Shared with me when Raka is in AKOM Product.
7. **Create workspace:** from the workspace switcher choose Create workspace. New empty workspace includes only you as a member; add a team first, then a project and issues.

## Dev and deploy

Run `npm install && npm run dev` for local Vite development and `npm run build` for TypeScript + Vite production validation. Cloudflare `wrangler.jsonc` describes a Workers Static Assets deploy. GitHub Actions workflow `.github/workflows/akom-ui-cloudflare.yml` validates each PR and exports a compiled dist artifact. The preview Worker is `akom-ui-preview` in the connected Cloudflare account.

From `akom-ui/`, run `npm test && npm run build`, then `npx wrangler deploy --dry-run` to check packaging and `npx wrangler deploy` to update the existing preview Worker using your authenticated Cloudflare account. Wrangler is pinned as a development dependency for repeatable local deployments.

## UX reference

The navigation and workspace switcher follow patterns captured from [Linear — Switching workspaces](https://mobbin.com/flows/2774d352-5908-42ac-bc41-b5b41913cffd), [Workspace settings](https://mobbin.com/flows/820abf56-0781-456e-b6ed-98609be8edc9), and [Team issues](https://mobbin.com/flows/68d53c65-1f92-4961-b507-de4bf4ea0adf). Design inspiration only; no Linear copyrighted images or source code are included.

## Security and backend caveat

The prototype intentionally has **no real RBAC**, authorization, authentication, R2 permissions, session management, nor persistence shared across users. Client-side identity switching is a demo tool, not secure impersonation. Do not treat issue-level UI filtering as authorization. The backend must enforce tenant isolation, workspace membership, issue-scoped grants, revocation, attachments and relation redaction before production use.

## V0.5 — Full-page issue and editable projects

- Opening an issue navigates to a **full-width issue page**, retaining workspace navigation and a dedicated right-hand properties rail. The old right-sided sheet is removed. Browser URLs use `/issue/MED-128`; browser Back/Forward and deep-link refresh are supported by the SPA fallback.
- Issue title, description, status, priority, assignee, project, labels, due date, and comments are editable for workspace members. External assignees stay restricted to status and comments.
- Clicking a project now opens a **full Project Overview**, with progress computed from actual project issues, involved teams, issue activity, and project properties. An Issues tab displays all issues across the project's teams.
- **Edit Project** supports name, description, status, lead, target date, and associated teams. All changes persist in mock browser storage.
- Project links use `/project/fyp` and open within the app shell. Returning from an issue restores project context.
- Intentional prototype limitation: other workspace data is not accessible through project pages; production authorization must still be server-enforced.

### Next UI priorities

1. Rich editor for issue descriptions/comments, real sub-issues, issue relations, and attachments.
2. Project milestone editor, project updates, project activity feed, and roadmap timeline.
3. Triage, filters, saved views, bulk actions, and keyboard-first navigation.
4. Workflow/label/notification settings, and responsive touch interactions.


## V0.6 · Issue details and milestones

- Full-page issue details with local Markdown formatting and preview (no HTML injection).
- Sub-issue creation, parent links, progress, and quick status updates.
- Issue dependencies (blocked by, blocking) scoped to the issue's workspace.
- Link attachments and local file-metadata demonstrations; **file bytes are not stored/uploaded**.
- Project Milestones tab, editable milestone description and target date, progress, and issue assignments.
- Workspace boundaries: external issue assignees can comment and edit status but cannot enumerate other issues, modify dependencies, change milestone/project or create sub-issues.
- All interactions are local demo state. No authentication, backend, access enforcement, or realtime sync is implemented.

## V0.7 — Workflow UI for Product, Brand Communications, and Business

- Project > **Workflow** adds a configurable Kanban/list operating-stage view separate from issue/team `status` and project lifecycle `status`.
- Project > **Configure workflow** manages stages (name, category, color, order), chooses three templates, and safely handles stage migrations. Projects in different departments may have entirely different stage sets.
- Example projects: `Brand Campaign Launch` (`/project/campaign`), `Commercial Partnership Pipeline` (`/project/pipeline`), existing Product projects.
- Issue Detail includes an explicit **Project stage** field for workspace members only, without exposing project workflow controls to external issue assignees.
- Triage queue supports intake, accept, dismiss; **Custom views** saves filter/layout choices per workspace.
- See [WORKFLOW_RESEARCH.md](WORKFLOW_RESEARCH.md) for official Linear docs, matching Mobbin flows, and the explicit distinction between native Linear capabilities and AKOM extensions.

All changes remain localStorage demo state: workflow stages/triage and saved views are **not** production-grade permission boundaries or server-backed records.


## V0.8 — Project information architecture correction (Mobbin)

- **Projects** sidebar now opens a searchable and filterable project list, not a gallery of project cards.
- Clicking a project opens its **Overview** by default, with **Overview / Activity / Issues** as the only main tabs.
- Overview contains summary, properties, progress, milestones, resources placeholder, and recent activity. Milestones are managed inline, not on a separate top-level tab.
- Activity supports posting demo project-health updates; all content remains browser-local.
- Issues remains the home for project issue lists. AKOM-specific operational stages are optional via Issues' `Group by project stage` and project overflow settings. These are **not** represented as native Linear top-level project tabs.
- See `PROJECT_UI_AUDIT.md` for canonical Mobbin links, Linear docs, and implementation boundaries.

## V0.10 — Issue List & Issue Detail visual/interaction pass

This pass follows verified Linear screenshots on Mobbin ([Team issues](https://mobbin.com/flows/68d53c65-1f92-4961-b507-de4bf4ea0adf), [Issue detail](https://mobbin.com/flows/fb8e3917-79bc-40c3-8c97-1e21b3c5a527), [Formatting text](https://mobbin.com/flows/3c49d20c-1e7a-4c84-bec0-ca59616a5e93)). It does **not** change authorization, data-model boundaries, or add novel UI tabs.

- Condensed issue list with compact status group headers, inline issue metadata, subtle focus/hover controls, retained status editing and drag reorder. Arrow-up/down navigate rows with keyboard.
- Single top breadcrumb and two-column issue detail: document-like content center, minimal right properties sidebar.
- Title click-to-edit seamlessly reflows in place; Enter/blur saves, Escape cancels.
- Description click-to-edit uses borderless multiline editor in same location, accessible formatting controls, preview, and save on leaving editor or Cmd/Ctrl+Enter; Escape cancels.
- External assignees remain read-only for owner-managed fields and keep only individually granted issue access.
