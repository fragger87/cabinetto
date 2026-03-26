# US016: Verify Optimization Against Python Prototype

**Status:** Done
**Epic:** Epic 2 — Optimization Engine
**Created:** 2026-03-20
**INVEST Score:** 5/6

---

## User Story

As a developer, I want to confirm the TypeScript optimizer produces identical results to the Python prototype so that the port is correct.

## Acceptance Criteria

1. For the same JSON input, TypeScript produces identical board count as Python
2. Utilization percentages match within 0.1% tolerance
3. Edge cases tested: single cabinet, all-drawer project, fixed values (no optimization), minimum body height boundary

## Technical Notes

- Run Python prototype (`old/kalkulator_z_pliku.py`) with known JSON inputs, capture outputs
- Create test fixtures: `{ input: ProjectConfig, expected: { boardCount, utilization, legHeight, depth } }`
- At least 3 fixture files: standard project, drawer-heavy project, edge case project
- Compare TypeScript output against fixtures in unit tests
- Tolerance for utilization: ±0.1% (floating point rounding differences acceptable)

### orchestratorBrief

```
tech: TypeScript, Vitest, Python (reference only)
keyFiles: src/app/services/*.spec.ts, old/kalkulator_z_pliku.py, test-fixtures/
approach: Generate fixtures from Python, write comparison tests in TypeScript
complexity: Medium (cross-language verification, fixture generation)
```

## Test Strategy

(Planned later by test planner)

## Dependencies

- US015 (full optimization pipeline must be complete to verify end-to-end)
