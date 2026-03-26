# Test Suite Audit Report

**Date:** 2026-03-26
**Previous Score:** 5.7 / 10 (2026-03-21)
**Overall Score: 6 / 10**

## Executive Summary

| Metric | Value |
|--------|-------|
| Unit test files | 9 |
| Unit tests | 69 |
| E2E test files | 1 |
| E2E tests | 11 |
| **Total tests** | **80** |
| Services with tests | 6 / 9 (67%) |
| Components with tests | 0 / 22 (0%) |

The project has strong test coverage for the computational core — all optimization and calculation services are tested with meaningful assertions. The verification suite cross-checks against the Python prototype for regression confidence. Three services and all 22 components lack unit tests.

## Previous Gaps — Resolution Status

| Previous Gap | Status | Evidence |
|-------------|--------|----------|
| G1: Drawer height calculation (3 schemes) | FIXED | `drawer-calculator.service.spec.ts` — 11 tests |
| G2: Drawer depth with clearances | FIXED | `drawer-calculator.service.spec.ts` — inner width + depth tests |
| G3: HDF element calculation | FIXED | `element-calculator.service.spec.ts` — back panel + drawer bottom tests |
| G4: Edge banding with drawer fronts | FIXED | `element-calculator.service.spec.ts` — plain + drawer + margin tests |
| G5: Grooved vs nailed mount dimensions | FIXED | `element-calculator.service.spec.ts` — nailed + grooved HDF tests |
| G6: Depth optimizer heuristic | FIXED | `depth-optimizer.service.spec.ts` — 5 tests |
| G7: BOM summary aggregation | OPEN | No tests for BomSummaryService |

## Per-File Breakdown

### Unit Tests

| File | Tests | What Is Tested | Value |
|------|-------|----------------|-------|
| `cutting-optimizer.service.spec.ts` | 6 | Single/multi-board packing, rotation, utilization, strip count, empty input | HIGH |
| `optimization-orchestrator.service.spec.ts` | 7 | Full optimization with trials, fixed legs/depth skip, per-cabinet override, drawer layouts | HIGH |
| `verification.spec.ts` | 8 | Python prototype cross-validation: strips, waste, heuristic, elements, full optimization, edge cases | HIGH |
| `element-calculator.service.spec.ts` | 11 | HDF back panel, drawer bottoms (nailed + grooved), edge banding (+10% margin), hardware counts | HIGH |
| `drawer-calculator.service.spec.ts` | 12 | Inner width, depth clearances, min-height guard, equal/graduated/custom layouts, piece generation, quantity | HIGH |
| `persistence.service.spec.ts` | 6 | localStorage save/load, null handling, corrupt JSON, file import, invalid file rejection | HIGH |
| `depth-optimizer.service.spec.ts` | 5 | Heuristic within range, waste minimization, single-value range, candidate generation, strip count | HIGH |
| `app.spec.ts` | 2 | App creation, title rendering | LOW |

### E2E Tests

| File | Tests | What Is Tested | Value |
|------|-------|----------------|-------|
| `e2e/app.spec.ts` | 11 | Board defaults, global settings, error handling, add cabinet, drawer layouts, SVG rendering, detail panel, JSON export/import, localStorage, cutting layouts with utilization | HIGH |

## Remaining Coverage Gaps

### Services Without Tests (3 of 9)

| Service | Lines | Risk | Notes |
|---------|-------|------|-------|
| **BomSummaryService** | 91 | HIGH | Aggregates board count, edge banding, hardware. Incorrect totals impact material purchasing. |
| **CutListExporterService** | 192 | MEDIUM | CSV/Pro100/FastCut export. Output consumed by CNC tools — format errors costly. |
| **ProjectStateService** | 27 | MEDIUM | Signal-based state. Small service, partially covered by E2E. |

### Components (0 of 22 with unit tests)

No component .spec.ts files exist. Mitigated by E2E suite covering critical user flows.

## Anti-Patterns

| # | Severity | Pattern | Location |
|---|----------|---------|----------|
| A1 | MEDIUM | Happy path only — no error/boundary tests | `cutting-optimizer.service.spec.ts` |
| A2 | MEDIUM | Happy path only — no invalid input tests | `optimization-orchestrator.service.spec.ts` |
| A3 | LOW | Mixed DI strategies (`new` vs `TestBed.inject`) | Across test files |
| A4 | LOW | No afterEach cleanup in persistence tests | `persistence.service.spec.ts` |

## Scoring

| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| Core algorithm coverage | 8/10 | 30% | 2.4 |
| Orchestration coverage | 7/10 | 20% | 1.4 |
| Persistence/IO coverage | 7/10 | 15% | 1.05 |
| Component coverage | 1/10 | 15% | 0.15 |
| E2E coverage | 8/10 | 10% | 0.8 |
| Error/boundary coverage | 3/10 | 10% | 0.3 |
| **Total** | | **100%** | **6/10** |

## Recommended Actions (Priority Order)

| # | Priority | Action | Effort | Impact |
|---|----------|--------|--------|--------|
| 1 | P0 | Add BomSummaryService tests (board counting, edge banding totals, hardware, multi-cabinet, empty input) | M | +0.5 score |
| 2 | P0 | Add CutListExporterService tests (CSV format, delimiters, column headers, each export format) | M | +0.3 score |
| 3 | P1 | Add boundary/error tests for CuttingOptimizer (oversized pieces, zero dimensions, kerf edge cases) | S | +0.2 score |
| 4 | P1 | Add ProjectStateService tests (signal reactivity, state transitions) | S | +0.2 score |
| 5 | P1 | Add error-path tests for Orchestrator (empty cabinets, invalid indices) | S | +0.1 score |
| 6 | P2 | Add component tests for report-page, parts-list, cutting-layout, global-settings-form | L | +0.5 score |

Addressing P0 + P1 items would raise the score to approximately **8/10**.

## Maintenance

**Update when:** Test files added or removed, coverage thresholds changed.
**Verify:** Run `npm test` and compare test count against this report.
