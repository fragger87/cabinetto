# US021: Build Report Layout Shell

**Status:** Backlog
**Epic:** Epic 4 — Report & Visualization
**Created:** 2026-03-20
**INVEST Score:** 5/6

---

## User Story

As a user, I want a structured report page so that optimization results are presented in an organized, readable format.

## Acceptance Criteria

1. Report page displays project parameters (board spec, optimized depth, shared leg height)
2. Cabinet summary table shows per-cabinet width, body_height, leg_height, quantity, drawer_count
3. Order summary dashboard shows board counts (18mm, 15mm), HDF count, leg sets, slide pairs, edge banding meters
4. Page uses responsive CSS with warm wood-tone color scheme (#b8860b, #8B4513)

## Technical Notes

- Angular component: `ReportPageComponent`
- Input: `OptimizationResult` (from Epic 2) + `BomSummary` (from Epic 3)
- CSS grid layout for dashboard cards
- Responsive: readable from 1024px to 2560px wide
- Color scheme: warm wood tones as per APPLICATION_SPEC.md

### orchestratorBrief

```
tech: Angular, CSS Grid, TypeScript
keyFiles: src/app/components/report-page/, src/app/components/order-summary/
approach: Angular component with CSS grid layout, data binding from optimization + BOM results
complexity: Medium (responsive layout + multiple data sections)
```

## Test Strategy

(Planned later by test planner)

## Dependencies

- US015 (OptimizationResult), US020 (BomSummary)
