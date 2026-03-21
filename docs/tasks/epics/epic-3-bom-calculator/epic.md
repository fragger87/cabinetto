# Epic 3: BOM & Materials Calculator

**Status:** Backlog
**Created:** 2026-03-20
**Type:** Business

---

## Goal

Calculate the complete bill of materials for all material types — carcass particleboard, drawer box particleboard, HDF panels — including edge banding totals and hardware counts.

## Scope

### In Scope

- 18mm particleboard elements: side panels, bottom panels, top rails (per cabinet, expanded by quantity)
- 15mm particleboard elements: drawer sides, drawer front, drawer back (per drawer, per cabinet)
- 3mm HDF elements: back panels (all cabinets), drawer bottoms (drawer cabinets)
- Bottom mode handling: full depth vs recessed (depth - thickness)
- Drawer dimension calculation from DrawerConfig: inner_width with slide_clearance, depth with front_gap, height per layout scheme (equal/graduated/custom)
- Edge banding calculation: side panel front edges + bottom panel front edge + drawer front panel edges, with +10% safety margin
- Hardware counts: adjustable leg sets (4 per base cabinet), drawer slide pairs (1 per drawer)
- Per-cabinet breakdown and project-total summaries
- BOM output as structured data consumed by Report (Epic 4)

### Out of Scope

- Cutting layout optimization (Epic 2)
- Cost estimation (prices per board/meter/pair)
- Label generation
- Multi-language element names
- Shelf or divider calculations
- Hinge or handle hardware

## Success Criteria

- BOM output matches Python prototype for identical inputs (carcass elements)
- Drawer cabinet BOM includes all 4 box parts (2 sides + front + back) + HDF bottom per drawer
- Edge banding total correctly includes drawer front edges when drawers present
- Hardware count: leg sets = cabinet_count (base only), slide pairs = total_drawer_count
- Minimum drawer box height validation (60mm) throws clear error
- Mixed project (some cabinets with drawers, some without) produces correct combined BOM

## Dependencies

- Epic 0: Project scaffold
- Epic 2: Optimization results provide final body_height, depth, leg_height values

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Drawer height calculation edge cases (graduated/custom layouts) | Medium | Unit test each layout scheme with boundary values; validate sum of heights fits in usable_height |
| Bottom mode interaction with drawer depth | Low | Document formula clearly; test both modes with drawer cabinets |
| Edge banding formula complexity with drawers | Low | Break into per-element functions; test each independently |

## Architecture Impact

- ElementCalculatorService: pure TypeScript, no UI dependencies
- DrawerCalculatorService: dedicated service for drawer dimension derivation
- Output interfaces (CutPiece[], BomSummary) shared with Epic 2 (cutting) and Epic 4 (report)

## Phases

1. Carcass element calculator (18mm: sides, bottoms, rails)
2. Drawer dimension calculator (inner_width, depth, height per scheme)
3. Drawer box element calculator (15mm: sides, front, back)
4. HDF element calculator (back panels + drawer bottoms)
5. Edge banding calculator (carcass + drawer edges, +10% margin)
6. Hardware counter (leg sets + slide pairs)
7. BOM summary aggregator (per-cabinet + project totals)
