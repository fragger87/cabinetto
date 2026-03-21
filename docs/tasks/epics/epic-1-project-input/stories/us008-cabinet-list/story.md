# US008: Manage Cabinet List

**Status:** Backlog
**Epic:** Epic 1 — Project Input & Configuration
**Created:** 2026-03-20
**INVEST Score:** 5/6

---

## User Story

As a user, I want to add, edit, and remove cabinets in my project so that I can define the exact set of cabinets to cut.

## Acceptance Criteria

1. User can add a new cabinet with name, width, and quantity fields
2. User can optionally override total height per cabinet
3. User can remove any cabinet from the list
4. The cabinet list displays all defined cabinets with their key dimensions

## Technical Notes

- Use Angular `FormArray` for dynamic cabinet list
- Each cabinet row: name (string), width (number, min 200mm), quantity (number, min 1), total_height (optional number override)
- Add button appends new FormGroup to FormArray with defaults
- Remove button splices FormGroup from FormArray
- Cabinet interface: `{ name: string, width: number, quantity: number, total_height?: number, drawers?: DrawerConfig }`

### orchestratorBrief

```
tech: Angular, Reactive Forms (FormArray), TypeScript
keyFiles: src/app/components/cabinet-list/, src/app/models/cabinet.ts
approach: FormArray with add/remove, each row a FormGroup with validation
complexity: Medium (dynamic form array management)
```

## Test Strategy

(Planned later by test planner)

## Dependencies

- US007 (global settings provide default total_height)
