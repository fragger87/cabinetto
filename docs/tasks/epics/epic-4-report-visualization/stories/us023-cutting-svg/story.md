# US023: Render Cutting Layout SVG Diagrams

**Status:** Done
**Epic:** Epic 4 — Report & Visualization
**Created:** 2026-03-20
**INVEST Score:** 6/6

---

## User Story

As a user, I want to see a visual diagram of how pieces are placed on each board so that I can follow the cutting plan in the workshop.

## Acceptance Criteria

1. Each board rendered as a scaled SVG with color-coded pieces (brown=sides, green=bottoms, blue=rails, orange=drawer parts)
2. Dimension labels displayed on pieces large enough to show them
3. Hover tooltip shows piece name, dimensions, and source cabinet
4. Utilization percentage displayed per board
5. 18mm and 15mm boards shown in separate groups

## Technical Notes

- Angular component: `CuttingLayoutComponent`
- Input: `BoardLayout[]` (from OptimizationResult.carcassLayouts + drawerLayouts)
- SVG rendered via Angular template (not innerHTML) for tooltip interactivity
- Scale factor: fit board within viewport width, maintain aspect ratio
- Color map: { side: '#8B4513', bottom: '#228B22', rail: '#4169E1', drawer: '#FF8C00' }
- Tooltip: Angular overlay or native SVG `<title>` element
- Utilization label positioned at bottom-right of each board SVG

### orchestratorBrief

```
tech: Angular, SVG, TypeScript
keyFiles: src/app/components/cutting-layout/
approach: Angular SVG template rendering BoardLayout[] with color-coded PlacedPiece rects
complexity: High (SVG geometry, scaling, color mapping, tooltips)
```

## Test Strategy

(Planned later by test planner)

## Dependencies

- US021 (report layout shell), US015 (BoardLayout[] from optimizer)
