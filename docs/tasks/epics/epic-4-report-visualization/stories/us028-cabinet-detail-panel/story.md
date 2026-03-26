# US028: Interactive Cabinet Detail Panel

**Status:** Done
**Epic:** Epic 4 — Report & Visualization
**Created:** 2026-03-21
**INVEST Score:** 5/6

---

## User Story

As a user, I want to click on a cabinet to see a detail panel with all its parts, dimensions, and material quantities so that I can review the full specification of any single cabinet.

## Acceptance Criteria

1. Clicking a cabinet in the visualization opens a detail panel
2. Detail panel shows all carcass parts with dimensions (sides, bottom, rails, back)
3. For drawer cabinets, panel shows each drawer box with dimensions and layout scheme
4. Panel shows edge banding length and hardware count for that cabinet

## Technical Notes

- New component: `CabinetDetailPanelComponent`
- Input: single `Cabinet` + `CabinetBom` (from BomSummary)
- Triggered by click event on cabinet front-view or overview block
- Panel layout:
  - Header: cabinet name, width x depth, quantity
  - Parts table: element name, dimensions (w x h), material, qty
  - Drawer section (if applicable): layout scheme, per-drawer heights
  - Summary: edge banding meters, leg sets, slide pairs
- Display as overlay/sidebar or expandable section below the cabinet
- Close button or click-outside to dismiss

### orchestratorBrief

```
tech: Angular, TypeScript
keyFiles: src/app/components/cabinet-detail-panel/
approach: Click handler on cabinet viz → show detail panel with CabinetBom data
complexity: Low (data display, no computation)
```

## Test Strategy

(Planned later by test planner)

## Dependencies

- US026 (click target on cabinet front view)
- US020 (CabinetBom data from BomSummaryService)
