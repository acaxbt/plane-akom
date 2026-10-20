# AKOM UI V0.4 — Linear workspace model + cross-workspace issue grants

An interactive React + Vite + TypeScript UI prototype. **No real authentication, database or server-side permission checks.** Demo data persists only in your browser's `localStorage`. The `akom-ui/` app is intentionally separate from the Plane fork; its `preview` branch is unchanged.

## Product model (Option B)

- **Workspace** is a real boundary: it owns workspace memberships, teams, projects and issues. The header switches among *only* the demo user's joined workspaces. No `All workspaces` filter exists.
- **Teams** live inside one workspace. `Your Teams` lists only teams joined by the active member; **Explore teams** can join/leave any public team in the active workspace. Team sections have Issues/Cycles/Projects navigation.
- **Projects** belong to one workspace and can be associated with multiple teams. Issue creation in that project can choose any of its participating teams.
- **Issues** have exactly one owning team and one primary assignee. Within a workspace, users can view public team issues; an explicit assignment to a member who is not in the owning workspace grants an *issue-scoped demo view* only, never implicit membership or access to other projects/issues.
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
