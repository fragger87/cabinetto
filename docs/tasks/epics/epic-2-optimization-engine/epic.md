# Epic 2: Optimization Engine

**Status:** Done
**Created:** 2026-03-20
**Type:** Business

---

## Goal

Implement the two-stage parametric optimizer and guillotine-cut bin packing algorithm to find the optimal leg height, cabinet depth, and cutting layout that minimizes board count and maximizes material utilization.

## Scope

### In Scope

- Stage 1: Leg height optimization (sweep from legs.min to legs.max at 5mm steps)
- Stage 2: Depth optimization (sweep from depth.min to depth.max at 5mm steps)
- Heuristic depth initializer (fast O(N) strip-waste minimizer for Stage 1 seed)
- Guillotine-cut bin packing with Best Short Side Fit (BSSF) heuristic
- Strip initialization from board height and optimized depth
- Rectangle splitting with kerf subtraction
- Free rectangle sorting (full-depth strips first, then by area)
- Multi-board fallback when pieces don't fit current board
- Separate optimization pass for 15mm drawer box particleboard
- Candidate comparison: fewest boards wins, ties broken by highest utilization
- Skip optimization when parameter is fixed (single integer, not range)

### Out of Scope

- Grain direction constraints (pieces may rotate 90 degrees)
- Combined 2D grid search (leg x depth simultaneously)
- Genetic algorithm or simulated annealing approaches
- Leftover tracking across multiple projects
- UI for displaying optimization progress (Epic 4)
- Element/BOM calculation (Epic 3 — this Epic only computes layouts)

## Success Criteria

- Optimizer produces identical board counts and utilization percentages as Python prototype for same inputs
- Runs in <500ms for a typical project (10 cabinets, 2 material types, full sweep ranges)
- Handles edge cases: single cabinet, all-drawer project, zero optimization range (fixed values), minimum body height (200mm) validation
- 15mm drawer board optimization runs independently from 18mm carcass boards
- Each optimization stage outputs a comparison table of all candidates with winner marked

## Dependencies

- Epic 0: Project scaffold, TypeScript strict mode
- Epic 1: ProjectConfig model (consumed as input)

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Numerical precision differences (Python float vs TypeScript number) | Medium | Use integer arithmetic for mm dimensions; compare outputs against Python test fixtures |
| Performance regression with large projects | Low | Profile with 50-cabinet stress test; optimize hot loops if needed |
| BSSF heuristic producing suboptimal layouts for drawer-heavy projects | Low | Compare 15mm board counts against manual calculation; document known limitations |

## Architecture Impact

- Core optimization services are pure functions: input ProjectConfig, output BoardLayout[]
- No Angular dependencies in optimization code — enables Web Worker offloading if needed later
- Two material-type optimization passes share the same bin packing service (parameterized by board spec)

## Phases

1. Data structures: CutPiece, PlacedPiece, FreeRectangle, BoardLayout
2. Guillotine bin packing service (BSSF + rectangle splitting + kerf)
3. Leg height optimizer service (Stage 1 sweep)
4. Depth optimizer service (Stage 2 sweep + heuristic initializer)
5. Multi-material orchestrator (18mm pass + 15mm pass)
6. Verification against Python prototype outputs
