# Development Principles

Core principles guiding implementation decisions in this project.

## Principles

| # | Principle | Description | Example |
|---|-----------|-------------|---------|
| 1 | **KISS** | Keep solutions simple; minimum complexity for the task | Greedy BSSF heuristic over genetic algorithm |
| 2 | **YAGNI** | Don't build features until needed | No backend API until multi-user is required |
| 3 | **DRY** | Single source of truth for logic | One `CuttingOptimizerService` for both 18mm and 15mm |
| 4 | **Pure Services** | Computation code has zero Angular dependencies | Services testable without TestBed |
| 5 | **Integer Arithmetic** | All dimensions in mm as integers | Avoids floating-point precision issues |
| 6 | **Vertical Slicing** | Each Story delivers end-to-end user value | No "create database schema" stories |
| 7 | **Progressive Disclosure** | Show advanced options only when relevant | Drawer config hidden until enabled |
| 8 | **Signal-Based State** | Use Angular signals for reactive state | `ProjectStateService` with signals, not BehaviorSubject |
| 9 | **No Runtime Deps** | Zero dependencies beyond Angular core | No lodash, no math libraries |
| 10 | **English Keys** | All identifiers, JSON keys, and docs in English | `cabinetType` not `typ_szafek` |
| 11 | **Idempotent Docs** | Documentation pipeline creates only missing files | Existing files never overwritten |

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| No backend | Algorithms O(N) per sweep, <500ms client-side; no persistent storage needed |
| No CSV import | JSON is sufficient; CSV adds parsing complexity for minimal value |
| Separate 15mm pass | Drawer boards are different material; separate optimization avoids mixing |
| Signals over RxJS | Angular 21 signals are synchronous, no subscription management |
| Vitest over Karma | Angular 21 default; faster startup, better watch mode |
| No external math libs | Standard JS Math sufficient for integer mm arithmetic |

## Maintenance

**Update when:** New principle adopted or existing one revised.
**Verify:** Architecture decisions still hold after major scope changes.
