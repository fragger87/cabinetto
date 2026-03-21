# US013: Implement Leg Height Optimization

**Status:** Backlog
**Epic:** Epic 2 — Optimization Engine
**Created:** 2026-03-20
**INVEST Score:** 5/6

---

## User Story

As a user, I want the app to find the best shared leg height so that all base cabinets use the fewest boards possible.

## Acceptance Criteria

1. Optimizer sweeps leg heights from min to max at 5mm steps
2. Each candidate derives body_height per cabinet and runs a full bin packing simulation
3. Candidate with fewest boards wins (ties broken by highest utilization)
4. When legs is a fixed value, optimization is skipped and the fixed value is used

## Technical Notes

- Pure TypeScript service: `LegOptimizerService`
- All cabinets share the same leg height (practical constraint: legs pre-set to one height)
- body_height = total_height - leg_height (per cabinet, since total_height can differ)
- Validate: all body heights >= 200mm, skip invalid candidates
- If depth is also a range, use heuristic depth as initial seed (from US014)
- Output: comparison table of all candidates (leg_height, board_count, utilization%, waste m²), winner marked

### orchestratorBrief

```
tech: TypeScript (pure, no Angular)
keyFiles: src/app/services/leg-optimizer.service.ts
approach: Sweep loop calling CuttingOptimizerService per candidate, collect and compare results
complexity: Medium (loop + candidate comparison, delegates heavy work to bin packer)
```

## Test Strategy

(Planned later by test planner)

## Dependencies

- US012 (bin packing service used for each candidate simulation)
