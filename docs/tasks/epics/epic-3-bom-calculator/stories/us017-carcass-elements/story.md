# US017: Calculate Carcass Elements (18mm)

**Status:** Backlog
**Epic:** Epic 3 — BOM & Materials Calculator
**Created:** 2026-03-20
**INVEST Score:** 5/6

---

## User Story

As a user, I want the app to generate the list of 18mm particleboard parts so that I know exactly what carcass pieces to cut.

## Acceptance Criteria

1. Side panels calculated: 2 per cabinet x quantity, dimensions = body_height x depth
2. Bottom panels calculated: 1 per cabinet x quantity, respecting full/recessed mode
3. Top rails calculated: 2 per cabinet x quantity, dimensions = inner_width x rail_width
4. Each piece tagged with source cabinet name for traceability

## Technical Notes

- Pure TypeScript service: `ElementCalculatorService`
- inner_width = cabinet_width - 2 * board_thickness
- bottom_depth = depth (full mode) or depth - thickness (recessed mode)
- Output: `CutPiece[]` with material_type = "18mm"
- Each CutPiece: { name, width, height, material_type, source_cabinet, quantity }

### orchestratorBrief

```
tech: TypeScript (pure, no Angular)
keyFiles: src/app/services/element-calculator.service.ts, src/app/models/cut-piece.ts
approach: Iterate cabinets, expand by quantity, generate CutPiece per element type
complexity: Low (straightforward dimensional arithmetic)
```

## Test Strategy

(Planned later by test planner)

## Dependencies

- US001 (model interfaces)
