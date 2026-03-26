# US022: Display Parts List Tables

**Status:** Done
**Epic:** Epic 4 — Report & Visualization
**Created:** 2026-03-20
**INVEST Score:** 5/6

---

## User Story

As a user, I want to see all cut pieces organized by material type so that I can review what needs to be cut.

## Acceptance Criteria

1. 18mm parts table shows element name, dimensions (w x h), quantity, and source cabinet
2. 15mm drawer parts table shows the same columns (only visible when project has drawers)
3. HDF parts table shows back panels and drawer bottoms
4. Edge banding table shows per-cabinet breakdown with running meters

## Technical Notes

- Angular component: `PartsListComponent` with material type filter
- Input: `BomSummary.cabinetBoms[]`
- Conditionally render 15mm table only if any cabinet has drawers
- Tables sortable by cabinet name or element type (optional enhancement)
- Edge banding table: one row per cabinet + total row with safety margin noted

### orchestratorBrief

```
tech: Angular, HTML tables, TypeScript
keyFiles: src/app/components/parts-list/
approach: Filtered tables from BomSummary data, conditional 15mm section
complexity: Low (data binding to tables)
```

## Test Strategy

(Planned later by test planner)

## Dependencies

- US021 (report layout shell), US020 (BomSummary data)
