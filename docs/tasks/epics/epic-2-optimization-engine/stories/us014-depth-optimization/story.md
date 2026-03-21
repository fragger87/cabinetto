# US014: Implement Depth Optimization

**Status:** Backlog
**Epic:** Epic 2 — Optimization Engine
**Created:** 2026-03-20
**INVEST Score:** 5/6

---

## User Story

As a user, I want the app to find the best cabinet depth so that strip waste is minimized and board usage is optimal.

## Acceptance Criteria

1. Optimizer sweeps depth from min to max at 5mm steps using the leg height from Stage 1
2. Each candidate computes strip count and runs a full bin packing simulation
3. Candidate with fewest boards wins (ties broken by highest utilization)
4. When depth is a fixed value, optimization is skipped and the fixed value is used
5. A heuristic depth initializer provides the seed depth for Stage 1 when depth is also a range

## Technical Notes

- Pure TypeScript service: `DepthOptimizerService`
- Heuristic initializer: O(N) scan minimizing `board_height - (strips * d + (strips-1) * kerf)`
- Strip count per candidate: `(board_height + kerf) / (depth + kerf)`
- Output: comparison table (depth, strips, strip_waste, board_count, utilization%, waste m²), winner marked
- Depth affects: side panel height dimension, bottom panel depth, drawer depth (depth - front_gap)

### orchestratorBrief

```
tech: TypeScript (pure, no Angular)
keyFiles: src/app/services/depth-optimizer.service.ts
approach: Heuristic seed + sweep loop calling CuttingOptimizerService, collect and compare
complexity: Medium (similar pattern to leg optimizer + heuristic initializer)
```

## Test Strategy

(Planned later by test planner)

## Dependencies

- US012 (bin packing service)
- US013 (leg height result feeds into depth optimization)
