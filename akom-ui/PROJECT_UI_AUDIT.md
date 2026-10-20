# AKOM V0.8 — Linear Project navigation audit

## Reference first, customization second

Verified Mobbin references for **web Linear**:

- Projects index flow (5 screens): https://mobbin.com/flows/92790750-e63d-4355-a401-f1d5236bf981
- Projects index alternative (2 screens): https://mobbin.com/flows/19e3bc58-a722-4a12-a643-10881a8f6f09
- Project details flow (6 screens): https://mobbin.com/flows/dbc027fe-6642-4cec-912b-0e05b83edca6
- Specific Projects list screen: https://mobbin.com/screens/00604c62-33b4-4e46-8a3e-7154376c8e14
- Specific project detail screen: https://mobbin.com/screens/e88b6bd7-3d4b-4e1e-8cd7-a9d2a6852795
- Specific project activity screen: https://mobbin.com/screens/e073e872-0477-4902-84c6-17e551e76f26
- Specific project issues screen: https://mobbin.com/screens/815793b1-5c75-43ac-94c7-93380781e337

Authoritative docs:

- https://linear.app/docs/projects — workspace/team Projects index supports list, board, timeline; click a project for Overview, description, properties, documents and milestones; project issue views can be added beside Issues.
- https://linear.app/docs/project-status — project lifecycle statuses and their configuration are separate from issue workflow.
- https://linear.app/docs/project-milestones — milestones are an integral part of a project, not a mandatory top-level navigation tab.

## AKOM implementation changes

1. Clicking **Projects** in sidebar lands on a searchable, filterable project **table/list**. Clicking a row opens the project.
2. Project's primary tabs are exactly **Overview**, **Activity**, **Issues**. All open on Overview by default.
3. Overview features summary, progress, milestones, links/documents placeholder, recent update, and project properties on the right. Milestone management expands **within Overview**.
4. Activity contains project health/status updates and a straightforward chronological project-issue surface. Updates are local demo data, not a live backend event stream.
5. Issues contains the issue list. An AKOM-specific 'Group by project stage' view is optional inside Issues; its editor is under the project overflow menu. It is NOT a Linear-native Project tab.
6. Never imply operational Brandcom/Business stages are native Linear workflow. They are AKOM-specific extensions and never rewrite the owning team's canonical issue status.
7. Preserve external assignee's issue-level grant only; project directory and its settings are not shared with non-members.

## Known prototype limitations

- No server persistence or permission enforcement; update composer uses per-project browser `localStorage`.
- Link/document section shows an explicit placeholder, not fake functional upload controls.
- Project activity is a local demo timeline; it does not claim a full audit/event log.
- User-provided project tabs (Overview / Activity / Issues) are treated as the V0.8 interaction specification. The current Linear documentation explicitly mentions Overview and Issues; UI captures may vary by product release.
