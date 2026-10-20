# AKOM Project Screens — Mobbin Visual-Parity Audit (V0.9)

## Source of truth

- [Linear — Projects directory (Mobbin flow)](https://mobbin.com/flows/92790750-e63d-4355-a401-f1d5236bf981)
- [Linear — Project details (Mobbin flow)](https://mobbin.com/flows/dbc027fe-6642-4cec-912b-0e05b83edca6)
- [Linear — Example Projects list screen](https://mobbin.com/screens/3d3a4fae-d824-440a-961b-001c6b715a4a)
- [Linear — Example project overview screen](https://mobbin.com/screens/f4cd410f-b1b4-49fe-a247-80071f69ba1e)

These sources were visually inspected (not inferred solely from names).

## Specific visual differences fixed

| Component | Prior AKOM | Linear reference pattern | V0.9 |
|---|---|---|---|
| Projects directory | Large title, explanatory subtitle, bordered list container | Compact utility toolbar and flat rows | Compact header, unboxed rows |
| Project tabs | Below large project hero | Immediately below top breadcrumb bar | Moved to top |
| Project title | Full-width hero with large icon and heading | Title and subtitle inside left document area | In left document column |
| Overview sections | Large card-like panels | Content on open canvas, subtle dividers | Flat brief, milestones/resources sections |
| Progress and properties | Split between large left cards and a property rail | Progress and compact properties on right | Progress/properties moved to right |
| Activity | Top-level Activity tab with composer | Top-level Activity tab | Retained; visually compressed |
| Workflow | Dedicated prior tab | No workflow tab in Project | Kept only under project options / Issues extension |

## Acceptance checks

1. Sidebar `Projects` opens project list, not a project detail or workflow.
2. Clicking a row opens `Overview` with tabs `Overview · Activity · Issues` directly under topbar.
3. Overview shows an unboxed title/description and right property/progress rail.
4. Project options menu retains working Edit and AKOM project-stage configuration.
5. Project update posts via Activity; issue list still navigates to full-page Issue Detail.
6. Projects list and project detail respect active workspace membership.

Screenshots should be compared at equal viewport (recommended 1440×900), with **Light** theme if comparing to the Mobbin light-theme images. Do not copy copyrighted Linear/Mobbin product screenshot pixels or assets into the app.
