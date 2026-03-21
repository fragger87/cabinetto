# Cabinet Calculator

Kitchen cabinet carcass calculator with drawer support — Angular SPA that optimizes board cutting layouts.

## Quick Start

```bash
npm install
npm start        # dev server at localhost:4200
npm test         # run tests (vitest)
npm run lint     # eslint
npm run format   # prettier
```

## Project Structure

| Directory | Purpose |
|-----------|---------|
| `src/app/models/` | TypeScript interfaces (BoardSpec, Cabinet, DrawerConfig, CutPiece, etc.) |
| `src/app/services/` | Pure computation (optimization, BOM calculation) — no Angular deps |
| `src/app/components/` | UI: input forms, report views, SVG cutting layouts |
| `src/app/persistence/` | localStorage + JSON file import/export |
| `docs/` | Project documentation hub |
| `old/` | Python prototype (reference only) |

## Architecture

Frontend-only Angular SPA. No backend. All optimization runs client-side.

**Data flow:** User input → ProjectConfig → OptimizationOrchestratorService → BoardLayout[] + BomSummary → Report view

See [Architecture](docs/project/architecture.md) for details.

## Documentation

- [Documentation Hub](docs/README.md) — central navigation
- [Requirements](docs/project/requirements.md) — functional scope
- [Architecture](docs/project/architecture.md) — system design
- [Tech Stack](docs/project/tech_stack.md) — technology inventory
- [Task Board](docs/tasks/kanban_board.md) — epics and stories

## Key Conventions

- All dimensions in millimeters (integers)
- English keys in JSON format (no Polish)
- Zero runtime dependencies beyond Angular core
- Pure TypeScript services for computation (testable without Angular)
- Vitest for testing, ESLint + Prettier for code quality
