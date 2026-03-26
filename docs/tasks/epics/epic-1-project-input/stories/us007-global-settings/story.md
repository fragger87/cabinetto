# US007: Configure Global Project Settings

**Status:** Done
**Epic:** Epic 1 — Project Input & Configuration
**Created:** 2026-03-20
**INVEST Score:** 5/6

---

## User Story

As a user, I want to set project-wide parameters (cabinet type, total height, bottom mode, rail width) so that all cabinets inherit consistent defaults.

## Acceptance Criteria

1. User can select cabinet type: base, wall, or tall
2. User can set default total height and rail width
3. User can choose bottom mode: full or recessed
4. Leg/depth fields toggle between fixed value and min/max range inputs

## Technical Notes

- Polymorphic field component: toggle switch between single `number` input and `{min, max}` pair
- When cabinet_type is "wall" or "tall", hide leg-related fields (no legs)
- Use Angular reactive forms with conditional validators based on field mode
- Rail width default: 80mm

### orchestratorBrief

```
tech: Angular, Reactive Forms, conditional rendering
keyFiles: src/app/components/global-settings-form/, src/app/components/polymorphic-field/
approach: Reactive form with polymorphic toggle component for legs/depth
complexity: Medium (polymorphic field state management)
```

## Test Strategy

(Planned later by test planner)

## Dependencies

- US006 (board spec form establishes form patterns)
