# Epic 0: Infrastructure & Project Setup

**Status:** Backlog
**Created:** 2026-03-20
**Type:** Infrastructure

---

## Goal

Establish Angular project foundation, build pipeline, testing framework, and persistence layer to support all business Epics.

## Scope

### In Scope

- Angular project scaffold (latest LTS) with TypeScript strict mode
- ESLint + Prettier configuration
- Unit test framework setup (Jest or Karma/Jasmine)
- CI/CD pipeline via GitHub Actions (build + test + lint on push)
- Project persistence layer: localStorage adapter + JSON file download/upload
- Project directory structure conventions (services, models, components)

### Out of Scope

- Business logic implementation
- UI components for specific features
- Backend/API (confirmed: no backend needed)
- Deployment to production hosting
- Material database or user accounts

## Success Criteria

- `ng build --configuration=production` succeeds with zero warnings
- `ng test` runs with at least one sample test passing
- ESLint + Prettier pass on all generated files
- CI pipeline executes build + test + lint on push to main
- localStorage save/load round-trip works for a sample project JSON

## Dependencies

None (this is the foundation Epic).

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Angular version incompatibility with test runner | Medium | Pin Angular + test framework versions; verify in CI |
| CI runner environment differences | Low | Use Node.js LTS in CI; lock package versions |

## Architecture Impact

Establishes the project structure that all subsequent Epics build upon:
- `src/app/models/` — TypeScript interfaces (BoardSpec, Cabinet, DrawerConfig, etc.)
- `src/app/services/` — Pure computation services (optimizer, BOM calculator)
- `src/app/components/` — UI components (input forms, report views)
- `src/app/persistence/` — localStorage + file I/O adapters

## Phases

1. Angular CLI scaffold + TypeScript strict config
2. Linting + formatting setup
3. Test framework setup + sample test
4. CI/CD pipeline configuration
5. Persistence layer (localStorage + JSON file adapter)
