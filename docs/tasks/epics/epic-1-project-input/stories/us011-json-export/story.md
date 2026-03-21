# US011: Export Project to JSON File

**Status:** Backlog
**Epic:** Epic 1 — Project Input & Configuration
**Created:** 2026-03-20
**INVEST Score:** 5/6

---

## User Story

As a user, I want to download my project as a JSON file so that I can save it and share it.

## Acceptance Criteria

1. User clicks "Export" and a `.json` file downloads automatically
2. Exported JSON matches the APPLICATION_SPEC.md format with English keys
3. Re-importing the exported file restores the identical project state

## Technical Notes

- Reuse PersistenceService from US005 (export method)
- Serialize ProjectConfig to JSON string with pretty-print (2-space indent)
- Create Blob with `application/json` MIME type, generate object URL, trigger anchor click
- File name: `project-{name}-{date}.json` or `cabinet-project.json`

### orchestratorBrief

```
tech: TypeScript, Blob API, JSON serialization
keyFiles: src/app/persistence/persistence.service.ts, src/app/components/project-toolbar/
approach: Serialize form state to ProjectConfig, create Blob, trigger download
complexity: Low (straightforward serialization + download)
```

## Test Strategy

(Planned later by test planner)

## Dependencies

- US005 (PersistenceService with export capability)
- US006-US009 (form state must exist to be serialized)
