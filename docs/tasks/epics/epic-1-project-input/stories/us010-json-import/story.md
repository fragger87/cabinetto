# US010: Import Project from JSON File

**Status:** Done
**Epic:** Epic 1 — Project Input & Configuration
**Created:** 2026-03-20
**INVEST Score:** 5/6

---

## User Story

As a user, I want to load a project from a JSON file so that I can restore a previously saved project.

## Acceptance Criteria

1. User can select a `.json` file via file picker
2. Valid JSON populates all form fields (board spec, global settings, cabinets with drawers)
3. Invalid JSON (missing required fields, wrong types) shows a clear error message without clearing the current project

## Technical Notes

- Reuse PersistenceService from US005 (import method)
- FileReader API to read uploaded file content
- Validate against ProjectConfig interface using type guard before populating forms
- English keys as per APPLICATION_SPEC.md format
- Handle both polymorphic formats for legs/depth (integer or {min, max})

### orchestratorBrief

```
tech: TypeScript, File API (FileReader), JSON validation
keyFiles: src/app/persistence/persistence.service.ts, src/app/components/project-toolbar/
approach: File picker + FileReader + type validation + populate reactive forms
complexity: Medium (validation + form population from external data)
```

## Test Strategy

(Planned later by test planner)

## Dependencies

- US005 (PersistenceService with import capability)
- US009 (all form components must exist to be populated)
