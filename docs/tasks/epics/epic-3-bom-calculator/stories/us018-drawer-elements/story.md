# US018: Calculate Drawer Box Elements (15mm)

**Status:** Backlog
**Epic:** Epic 3 — BOM & Materials Calculator
**Created:** 2026-03-20
**INVEST Score:** 5/6

---

## User Story

As a user, I want drawer box parts calculated for each drawer cabinet so that the cutting plan includes all drawer material.

## Acceptance Criteria

1. Drawer dimensions derived from DrawerConfig: inner_width with slide_clearance, depth with front_gap
2. Drawer heights computed per layout scheme (equal, graduated, custom)
3. Per drawer: 2 sides, 1 front, 1 back (back height = drawer_height - 15mm) generated
4. Drawer height below 60mm triggers a validation error

## Technical Notes

- `DrawerCalculatorService`: dedicated service for drawer dimension derivation
- drawer_inner_width = inner_width - 2 * slide_clearance (default 13mm per side)
- drawer_depth = depth - front_gap (default 30mm)
- Equal: usable_height = body_height - rail_width - bottom_thickness - (count-1) * drawer_gap; height = usable_height / count
- Graduated: proportional ratios 1:1.5:2 (for 3 drawers), scaled to fit usable_height
- Custom: user-provided heights array, validate sum fits in usable_height
- Output: `CutPiece[]` with material_type = "15mm"

### orchestratorBrief

```
tech: TypeScript (pure, no Angular)
keyFiles: src/app/services/drawer-calculator.service.ts
approach: Derive drawer dimensions from DrawerConfig, generate CutPiece per drawer part
complexity: Medium (3 layout schemes, cross-field validation)
```

## Test Strategy

(Planned later by test planner)

## Dependencies

- US017 (element calculator pattern established)
