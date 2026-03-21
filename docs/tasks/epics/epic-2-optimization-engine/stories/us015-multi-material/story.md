# US015: Orchestrate Multi-Material Optimization

**Status:** Backlog
**Epic:** Epic 2 — Optimization Engine
**Created:** 2026-03-20
**INVEST Score:** 5/6

---

## User Story

As a user, I want 18mm carcass boards and 15mm drawer boards optimized separately so that each material type has its own cutting layout.

## Acceptance Criteria

1. 18mm carcass pieces (sides, bottoms, rails) are optimized in one pass
2. 15mm drawer pieces (sides, fronts, backs) are optimized in a separate pass
3. Each pass uses the same bin packing algorithm parameterized by board spec
4. Combined results report board counts and utilization for both material types

## Technical Notes

- `OptimizationOrchestratorService`: coordinates full pipeline
- Pipeline: leg optimization (Stage 1) → depth optimization (Stage 2) → split pieces by material → run bin packing per material
- 15mm board spec may differ from 18mm (different sheet dimensions) — parameterize
- If project has no drawer cabinets, skip 15mm pass entirely
- Output: `OptimizationResult { legHeight, depth, carcassLayouts: BoardLayout[], drawerLayouts: BoardLayout[] }`

### orchestratorBrief

```
tech: TypeScript (pure, no Angular)
keyFiles: src/app/services/optimization-orchestrator.service.ts
approach: Chain leg→depth optimizers, split CutPiece[] by material, run bin packing per set
complexity: Medium (orchestration + conditional 15mm pass)
```

## Test Strategy

(Planned later by test planner)

## Dependencies

- US012 (bin packing), US013 (leg optimizer), US014 (depth optimizer)
