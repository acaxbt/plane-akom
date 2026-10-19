# AKOM UI · V0.1

A Linear-inspired **interactive React prototype** for AKOM. This is an independent frontend project, intentionally isolated from the Plane fork core. **No backend and no authentication are implemented yet.**

## What works

- Sidebar navigation: My issues, Inbox, Projects, Initiatives, All issues, Board, Cycles
- Issue lists grouped by status, list/board toggle, priority and workspace filters
- Issue details: edit title/description/status/priority/assignee; add comments
- Create issue from `C`, plus button, or command palette
- Cross-workspace assignee picker with organization-wide member search and team grouping
- Global My issues view updates automatically when assigning to Raka; other workspace members are visible in the directory
- `⌘K` / `Ctrl+K` command search; `Esc` to close
- Dark/light theme toggle and responsive sidebar
- Changes persist in browser `localStorage` (prototype-only, not synchronized between devices)

## Local development

Requires Node 22+ and npm. Install with `npm install`, run `npm run dev`, typecheck and production-build with `npm run build`.

## Deploy on Cloudflare Workers (static assets)

Config `wrangler.jsonc` uses Workers Static Assets with `not_found_handling=single-page-application` for SPA routes. In Cloudflare, create an API token with Workers Scripts edit permissions, and save it to GitHub Actions as repository secret `CLOUDFLARE_API_TOKEN`; set your Cloudflare account ID as secret `CLOUDFLARE_ACCOUNT_ID`. This is not required for local development.

To deploy manually on an authenticated machine:

```sh
npm ci || npm install
npm run build
npx wrangler deploy
```

A GitHub Actions workflow is provided separately in the repository root as `.github/workflows/akom-ui-cloudflare.yml` (only deployed on `feature/akom-ui-v0.1` branch through manual workflow dispatch).

## Reference designs

- [Creating an issue — Mobbin/Linear](https://mobbin.com/flows/3528703d-a543-414c-8f6e-ccf2442bff2f)
- [Issue details — Mobbin/Linear](https://mobbin.com/flows/fb8e3917-79bc-40c3-8c97-1e21b3c5a527)
- [Adding assignee — Mobbin/Linear](https://mobbin.com/flows/0035680b-a877-444a-b27a-b76b38d10853)
- [Team issues — Mobbin/Linear](https://mobbin.com/flows/68d53c65-1f92-4961-b507-de4bf4ea0adf)

Design inspiration only. No third-party copyrighted images or app assets included.

## Product architecture notes

**Global organization user ID** is separate from workspace ownership. The prototype issues retain `workspace` and `assignee` independently to demonstrate cross-workspace workflows. In production the backend must enforce issue-scoped permissions, organization membership, attachment rules, and revocation. This prototype intentionally makes no security guarantees.

Future backend: Cloudflare Workers/Hono, D1, R2, Durable Objects. The UI intentionally requires none of these services.
