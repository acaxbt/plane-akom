# Deploy guide

This folder contains a standalone Cloudflare Workers Static Assets project. It does **not** deploy itself just because the files appear on GitHub. Configure your Cloudflare account and trigger the workflow.

1. Configure `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as repository secrets (do not commit them).
2. On GitHub, go to Actions → `AKOM UI — Cloudflare Preview` → Run workflow using branch `feature/akom-ui-v0.1`. GitHub only recognizes new workflow files on default branch for dispatch, so a maintainer may need to merge a minimal workflow to default branch first, or run `npx wrangler deploy` locally on the branch.
3. Verify Cloudflare assigned `*.workers.dev` URL and open in browser.

Never place API tokens in frontend Vite environment variables. No backend secrets are needed for this design prototype.
