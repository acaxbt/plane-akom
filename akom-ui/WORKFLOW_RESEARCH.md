# AKOM V0.7 — Workflow research and design provenance

## Grounded Linear behavior (verified official documentation)

- Team **issue statuses** are customized under Team settings > Issue statuses & automations. This is an issue/team workflow, not a project-specific set of issue statuses: https://linear.app/docs/teams
- **Project statuses** convey project lifecycle. Custom workspace-level statuses are configured under Settings > Projects > Statuses. Team-specific project status configuration is available on Business/Enterprise; a project's lead team determines which statuses apply: https://linear.app/docs/project-status
- **Milestones** divide project work into delivery checkpoints, and are separate from workflow status: https://linear.app/docs/project-milestones
- Projects can span multiple teams: https://linear.app/docs/projects

## Mobbin flows retrieved and used as pattern references

- [Adding a project status](https://mobbin.com/flows/2bcee4cf-b813-40a1-a7fc-6a6117807d3d) — Linear web, 6-screen flow
- [Adding a new status](https://mobbin.com/flows/c6c3d5ed-e3c0-480a-b3e0-ea5a1bb5335f) — Linear web, 5-screen flow
- [Team settings](https://mobbin.com/flows/1e4490a5-133c-4c8a-9942-e5a9271c909b) — Linear web, 2-screen flow
- [Changing project status](https://mobbin.com/flows/babe3b2d-d8f7-4081-a6b9-c17097ea3e06) — Linear web, 3-screen flow
- [Writing a project update](https://mobbin.com/flows/ead205b6-0003-40ee-812f-074df9360731) — Linear web, 4-screen flow

The Mobbin connector surfaced flow links and previews, **not a downloaded high-resolution audit archive**. We did not assume pixel-level precision. AKOM follows the conceptual separation corroborated by official documentation, not purported 1:1 exact screen layouts.

## AKOM-specific design decision

**Project workflow stages** are an AKOM extension separate from the canonical team issue status and project lifecycle status. A project has a configurable `workflow` object with ordered stages, category, color, and preset (`engineering`, `brandcom`, `business`, `custom`). An issue has an optional `workflowStage` property (and retains `status`, `team`, `project` and `workspace`).

This enables specialized Brand Communications campaign production stages and Business partnerships process stages, including approval, review and sign-off phases, without changing another team's issues. Project milestones remain independent outcome checkpoints.

Per-project workflow-stage editor:
- Preset gallery, status labels, colors, categories, ordering, add/remove.
- When switching presets, the editor explicitly asks the operator to confirm reassigning affected issue stages to an equivalent lifecycle category. No silent data migration.
- Deleting an assigned stage is disabled. Project stages are editable only by workspace members; external issue assignees cannot view the project.

This is a **frontend-only prototype**, using localStorage. Backend policy enforcement and relational migration are future work.
