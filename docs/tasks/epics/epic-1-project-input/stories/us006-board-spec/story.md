# US006: Define Board Specification

**Status:** Done
**Epic:** Epic 1 — Project Input & Configuration
**Created:** 2026-03-20
**INVEST Score:** 5/6

---

## User Story

As a user, I want to enter sheet material dimensions so that the optimizer knows what boards I'm cutting from.

## Acceptance Criteria

1. User can set board width, height, thickness, and kerf in a form
2. All fields default to standard values (2800x2070x18mm, kerf 4mm)
3. Invalid values (zero, negative, non-integer) show inline error messages
4. Changing board spec updates the shared project model immediately

## Technical Notes

- Angular reactive form with `FormGroup` for board spec fields
- Validators: `Validators.required`, `Validators.min(1)`, custom integer validator
- BoardSpec interface: `{ width: number, height: number, thickness: number, kerf: number }`
- Emit changes via shared ProjectStateService (BehaviorSubject or signal)

### orchestratorBrief

```
tech: Angular, Reactive Forms, TypeScript
keyFiles: src/app/components/board-spec-form/, src/app/models/board-spec.ts
approach: Reactive form with validators, emit to shared state service
complexity: Low (4 numeric fields with validation)
```

## Test Strategy

(Planned later by test planner)

## Dependencies

- US001 (Angular scaffold + model interfaces)
