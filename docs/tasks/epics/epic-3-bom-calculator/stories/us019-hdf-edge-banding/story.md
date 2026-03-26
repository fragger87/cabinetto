# US019: Calculate HDF Elements and Edge Banding

**Status:** Done
**Epic:** Epic 3 — BOM & Materials Calculator
**Created:** 2026-03-20
**INVEST Score:** 5/6

---

## User Story

As a user, I want back panels, drawer bottoms, and edge banding totals calculated so that I can order all materials at once.

## Acceptance Criteria

1. HDF back panels: 1 per cabinet, dimensions = inner_width x (body_height - thickness)
2. HDF drawer bottoms: 1 per drawer, dimensions = drawer_inner_width x drawer_depth
3. Edge banding total includes side front edges, bottom front edges, and drawer front edges
4. Edge banding total includes +10% safety margin

## Technical Notes

- HDF elements output as `CutPiece[]` with material_type = "hdf_3mm"
- HDF board count estimated by total area (not run through guillotine optimizer)
- Edge banding per cabinet: side_edges = body_height * 2 * qty, bottom_edge = inner_width * qty
- Drawer edge banding: (drawer_inner_width + 2 * drawer_box_height) * drawer_count * qty
- Total edge banding in running meters, with * 1.1 safety margin
- Output: `{ hdfPieces: CutPiece[], edgeBanding: { perCabinet: EdgeBandingEntry[], totalMeters: number } }`

### orchestratorBrief

```
tech: TypeScript (pure, no Angular)
keyFiles: src/app/services/element-calculator.service.ts
approach: Extend ElementCalculatorService with HDF + edge banding methods
complexity: Low (area calculation + linear meter summation)
```

## Test Strategy

(Planned later by test planner)

## Dependencies

- US017 (carcass elements for back panel dimensions)
- US018 (drawer elements for drawer bottom dimensions and edge banding)
