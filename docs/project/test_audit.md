# Test Suite Audit Report

**Date:** 2026-03-21
**Overall Score: 5.7 / 10**

## Executive Summary

The test suite covers the core optimization algorithm well (bin packing, orchestrator, verification) but has significant gaps in BOM calculation and drawer dimension logic — the most bug-prone areas based on recent fixes. No tests exist for `DrawerCalculatorService` or `ElementCalculatorService`, which contain the formulas most frequently adjusted during development.

## Severity Summary

| Severity | Count |
|----------|-------|
| Critical | 2 |
| High | 3 |
| Medium | 2 |
| Low | 1 |
| **Total** | **8** |

## Compliance Score

| Category | Score | Notes |
|----------|-------|-------|
| Business Logic Focus | 8/10 | No framework tests detected — all test business logic |
| E2E Critical Coverage | N/A | SPA — no API endpoints |
| Risk-Based Value | 7/10 | All existing tests are high-value; no low-value tests to remove |
| Coverage Gaps | 3/10 | 2 critical services untested (drawer calc, element calc) |
| Isolation & Anti-Patterns | 7/10 | localStorage properly cleared; some tests share implicit state |
| Manual Test Quality | N/A | No manual test scripts |
| Test Structure | 5/10 | Tests only in services/ — no component tests, inconsistent co-location |
| **Overall** | **5.7/10** | Dragged down by coverage gaps |

## Existing Tests — Value Assessment

| File | Tests | Value | Verdict |
|------|-------|-------|---------|
| `cutting-optimizer.service.spec.ts` | 6 | HIGH (core algorithm) | KEEP all |
| `optimization-orchestrator.service.spec.ts` | 7 | HIGH (integration, drawer pass) | KEEP all |
| `verification.spec.ts` | 8 | HIGH (cross-validation) | KEEP all |
| `persistence.service.spec.ts` | 6 | HIGH (data integrity) | KEEP all |
| `app.spec.ts` | 2 | LOW (smoke test only) | KEEP — cheap insurance |

**Verdict: 0 tests to remove.** All 29 existing tests are justified.

## Coverage Gaps (Critical)

| # | Severity | Missing Test | Service | Risk | Priority |
|---|----------|-------------|---------|------|----------|
| G1 | **CRITICAL** | Drawer height calculation (equal/graduated/custom schemes) | `drawer-calculator.service.ts` | Wrong drawer heights → pieces don't fit in cabinet | 25 |
| G2 | **CRITICAL** | Drawer depth with back clearance | `drawer-calculator.service.ts` | Drawers collide with back panel | 22 |
| G3 | **HIGH** | HDF element calculation (back panels + drawer bottoms) | `element-calculator.service.ts` | Wrong HDF board count → material shortage | 18 |
| G4 | **HIGH** | Edge banding calculation with drawer fronts | `element-calculator.service.ts` | Under-ordering edge banding | 16 |
| G5 | **HIGH** | Grooved vs under drawer bottom mount dimensions | `element-calculator.service.ts` | Wrong HDF dimensions for mount type | 18 |
| G6 | **MEDIUM** | Depth optimizer heuristic (best strip waste) | `depth-optimizer.service.ts` | Suboptimal depth selection | 12 |
| G7 | **MEDIUM** | BOM summary aggregation (per-cabinet breakdown) | `bom-summary.service.ts` | Incorrect totals in report | 12 |

## Anti-Patterns Detected

| # | Severity | Pattern | Location | Issue |
|---|----------|---------|----------|-------|
| A1 | LOW | **Happy Path Only** | `optimization-orchestrator.service.spec.ts` | No test for invalid input (e.g., cabinet width < 2×thickness) |

## Recommended Actions (Priority Order)

| # | Action | Effort | Covers |
|---|--------|--------|--------|
| 1 | **Add `drawer-calculator.service.spec.ts`** — test all 3 layout schemes, back clearance, min height validation | M | G1, G2 |
| 2 | **Add `element-calculator.service.spec.ts`** — test HDF calc, edge banding, grooved vs under mount, hardware counts | M | G3, G4, G5 |
| 3 | **Add `depth-optimizer.service.spec.ts`** — test heuristic + candidate generation | S | G6 |
| 4 | **Add error case to orchestrator tests** — invalid cabinet dimensions | S | A1 |
