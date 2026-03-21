# US020: Generate Hardware Summary and BOM Report Data

**Status:** Backlog
**Epic:** Epic 3 — BOM & Materials Calculator
**Created:** 2026-03-20
**INVEST Score:** 5/6

---

## User Story

As a user, I want a complete hardware count and aggregated BOM so that I can place a single order for everything.

## Acceptance Criteria

1. Leg sets: 1 set of 4 per base cabinet
2. Drawer slide pairs: 1 per drawer across all cabinets
3. Per-cabinet breakdown shows all elements, edge banding, and hardware for that cabinet
4. Project totals aggregate all material counts across all cabinets

## Technical Notes

- `BomSummaryService`: aggregates outputs from ElementCalculatorService + DrawerCalculatorService
- Hardware counting: legs only for cabinet_type "base"; slides = sum of all drawer_count * quantity
- Per-cabinet breakdown: `CabinetBom { cabinetName, pieces18mm[], pieces15mm[], piecesHdf[], edgeBandingMeters, legSets, slidePairs }`
- Project summary: `BomSummary { cabinetBoms[], totalBoards18mm, totalBoards15mm, totalBoardsHdf, totalEdgeBandingMeters, totalLegSets, totalSlidePairs }`
- This is the final data structure consumed by Epic 4 (Report)

### orchestratorBrief

```
tech: TypeScript (pure, no Angular)
keyFiles: src/app/services/bom-summary.service.ts, src/app/models/bom-summary.ts
approach: Aggregate per-cabinet BOMs into project summary with hardware counts
complexity: Low (summation and aggregation)
```

## Test Strategy

(Planned later by test planner)

## Dependencies

- US017 (carcass elements), US018 (drawer elements), US019 (HDF + edge banding)
