# US012: Implement Guillotine Bin Packing Algorithm

**Status:** Done
**Epic:** Epic 2 — Optimization Engine
**Created:** 2026-03-20
**INVEST Score:** 5/6

---

## User Story

As a user, I want pieces placed on boards using guillotine cuts so that the cutting layout matches how panel saws operate.

## Acceptance Criteria

1. Pieces are placed using Best Short Side Fit (BSSF) heuristic in decreasing area order
2. Remaining space after placement is split into free rectangles with kerf subtracted
3. When a piece cannot fit on the current board, a new board is started with fresh strip initialization
4. Board utilization percentage is calculated per board

## Technical Notes

- `CuttingOptimizerService` — pure computation logic in Angular service
- Input: `CutPiece[]` + `BoardSpec` → Output: `BoardLayout[]`
- Strip initialization: `strip_count = (board_height + kerf) / (depth + kerf)`
- BSSF score: `min(rect_w - piece_w, rect_h - piece_h)` — lowest wins
- Both orientations tried for each piece (rotation allowed, no grain constraint)
- Free rectangles re-sorted after each placement: full-depth strips first, then by area
- Data structures: `CutPiece`, `PlacedPiece`, `FreeRectangle`, `BoardLayout`

### orchestratorBrief

```
tech: TypeScript, Angular service with pure computation logic
keyFiles: src/app/services/cutting-optimizer.service.ts, src/app/models/cut-piece.ts, src/app/models/board-layout.ts
approach: Port Python guillotine bin packing with BSSF, strip init, rectangle splitting
complexity: High (core algorithm, 2D geometry, multiple data structures)
```

## Test Strategy

(Planned later by test planner)

## Dependencies

- US001 (model interfaces)
