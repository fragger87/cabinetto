# Test Documentation

## Framework

| Tool | Version | Purpose |
|------|---------|---------|
| Vitest | 4.0.8 | Unit test runner (Angular 21 default) |
| @vitest/coverage-v8 | 4.1.0 | Code coverage |
| jsdom | 28.0.0 | DOM environment for component tests |
| Playwright | 1.58.2 | E2E browser tests |

## Running Tests

| Command | Description |
|---------|-------------|
| `npm test` | Run all unit tests |
| `npm run test:coverage` | Run with V8 coverage report |
| `npm run e2e` | Run Playwright E2E tests |
| `ng test --watch` | Watch mode (unit) |

## Test Structure

### Unit Tests (57 tests, 8 files)

| File | Tests | Description |
|------|-------|-------------|
| `cutting-optimizer.service.spec.ts` | 6 | Bin packing: BSSF, strip init, rotation, multi-board |
| `optimization-orchestrator.service.spec.ts` | 7 | Leg/depth sweep, fixed params, drawer pass, per-cabinet height |
| `verification.spec.ts` | 8 | Cross-validation against known formulas |
| `drawer-calculator.service.spec.ts` | 12 | Drawer heights (equal/graduated/custom), back clearance, min height |
| `element-calculator.service.spec.ts` | 12 | HDF calc, edge banding, grooved/nailed mount, hardware counts |
| `depth-optimizer.service.spec.ts` | 4 | Heuristic depth, candidate generation |
| `persistence.service.spec.ts` | 6 | localStorage save/load, JSON import/export, validation |
| `app.spec.ts` | 2 | App component smoke tests |

### E2E Tests (11 tests, 1 file)

| File | Tests | Description |
|------|-------|-------------|
| `e2e/app.spec.ts` | 11 | Full flow: add cabinet, calculate, report, drawers, detail panel, save/load, export |

## Test Categories

| Category | Focus | Example |
|----------|-------|---------|
| Algorithm | Bin packing correctness | Piece placement, strip init, multi-board |
| Optimization | Sweep produces valid winners | Leg/depth within range, fixed skips sweep |
| BOM | Element counts match spec | Drawer parts, edge banding margin, mount types |
| Drawer | Height formulas + clearances | Equal/graduated/custom, back clearance, HDF bottom |
| Persistence | Round-trip fidelity | Save/load/export/import JSON |
| Verification | Cross-check with known values | Board counts, utilization, edge cases |
| E2E | Full user workflows | Add cabinets → calculate → report → print |

## Current Coverage

57 unit tests + 11 E2E tests = 68 total, all passing.

## Maintenance

**Update when:** New test file added, framework changed, or coverage thresholds set.
**Verify:** `npm test && npm run e2e` passes after any code change.
