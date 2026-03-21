# Test Documentation

## Framework

| Tool | Version | Purpose |
|------|---------|---------|
| Vitest | 4.0.8 | Test runner (Angular 21 default) |
| @vitest/coverage-v8 | 4.1.0 | Code coverage |
| jsdom | 28.0.0 | DOM environment for component tests |

## Running Tests

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:coverage` | Run with V8 coverage report |
| `ng test --watch` | Watch mode |

## Test Structure

| Directory | Tests | Description |
|-----------|-------|-------------|
| `src/app/services/*.spec.ts` | 21 | Pure service logic (optimizer, BOM, persistence) |
| `src/app/app.spec.ts` | 2 | App component smoke tests |
| `src/app/services/verification.spec.ts` | 8 | Cross-validation against known values |

## Test Categories

| Category | Focus | Example |
|----------|-------|---------|
| Algorithm | Bin packing correctness | Piece placement, strip init, multi-board |
| Optimization | Sweep produces valid winners | Leg/depth within range, fixed skips sweep |
| BOM | Element counts match spec | Drawer parts per drawer, edge banding margin |
| Persistence | Round-trip fidelity | Save/load/export/import JSON |
| Verification | Cross-check with Python prototype | Board counts, utilization, edge cases |

## Current Coverage

29 tests across 5 test files, all passing.

## Maintenance

**Update when:** New test file added, framework changed, or coverage thresholds set.
**Verify:** `npm test` passes after any code change.
