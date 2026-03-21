# US001: Set Up Angular Project Scaffold

**Status:** Backlog
**Epic:** Epic 0 — Infrastructure & Project Setup
**Created:** 2026-03-20
**INVEST Score:** 5/6

---

## User Story

As a developer, I want a properly configured Angular project with TypeScript strict mode so that I can begin implementing business features with full type safety.

## Acceptance Criteria

1. `ng serve` starts the dev server and loads the app in browser without errors
2. TypeScript strict mode is enabled (`strict: true` in tsconfig.json)
3. Project structure contains `models/`, `services/`, `components/`, `persistence/` directories under `src/app/`
4. `ng build --configuration=production` completes with zero warnings

## Technical Notes

- Use Angular CLI (`ng new`) with latest LTS version
- Enable strict mode during scaffold (`--strict`)
- Standalone components (no NgModules) unless Angular version defaults otherwise
- Key interfaces to stub (empty files): `BoardSpec`, `Cabinet`, `DrawerConfig`, `CabinetProject`, `CutPiece`, `PlacedPiece`, `BoardLayout`

### orchestratorBrief

```
tech: Angular (latest LTS), TypeScript
keyFiles: angular.json, tsconfig.json, src/app/
approach: ng new with strict mode, create directory structure, stub model interfaces
complexity: Low (standard scaffold)
```

## Test Strategy

(Planned later by test planner)

## Dependencies

None (first Story in Epic 0).
