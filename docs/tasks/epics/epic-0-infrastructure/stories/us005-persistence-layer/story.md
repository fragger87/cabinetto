# US005: Implement Project Persistence Layer

**Status:** Done
**Epic:** Epic 0 — Infrastructure & Project Setup
**Created:** 2026-03-20
**INVEST Score:** 6/6

---

## User Story

As a user, I want to save and load my cabinet projects so that I can resume work across browser sessions.

## Acceptance Criteria

1. Saving a project stores it in localStorage under a named key
2. Loading a project from localStorage restores the full ProjectConfig
3. "Export JSON" downloads the project as a `.json` file via browser download
4. "Import JSON" reads an uploaded `.json` file and loads it as the active project
5. Round-trip (export then import) produces a ProjectConfig identical to the original

## Technical Notes

- PersistenceService in `src/app/persistence/`
- localStorage adapter: `localStorage.setItem(key, JSON.stringify(projectConfig))`
- JSON export: create Blob, generate object URL, trigger anchor click download
- JSON import: use FileReader API on `<input type="file" accept=".json">`
- Validate imported JSON against ProjectConfig interface before loading (type guard or schema check)
- Handle localStorage quota exceeded error gracefully

### orchestratorBrief

```
tech: TypeScript, localStorage API, File API (Blob, FileReader)
keyFiles: src/app/persistence/persistence.service.ts, src/app/models/project-config.ts
approach: Create PersistenceService with save/load/export/import methods, add type validation
complexity: Medium (file I/O + validation)
```

## Test Strategy

(Planned later by test planner)

## Dependencies

- US001 (project structure and model interfaces must exist)
