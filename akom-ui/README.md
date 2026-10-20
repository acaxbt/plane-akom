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
