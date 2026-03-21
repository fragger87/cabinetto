# US009: Configure Drawers for a Cabinet

**Status:** Backlog
**Epic:** Epic 1 — Project Input & Configuration
**Created:** 2026-03-20
**INVEST Score:** 5/6

---

## User Story

As a user, I want to add drawer configuration to any cabinet so that drawer box parts are included in the cutting plan.

## Acceptance Criteria

1. User can enable drawers on any cabinet and set drawer count
2. User can select drawer layout scheme: equal, graduated, or custom
3. When "custom" layout is selected, user can enter individual drawer heights
4. Drawer fields (slide clearance, front gap, drawer gap, material thickness) show with sensible defaults and are editable
5. Drawer config section is hidden when drawer count is 0

## Technical Notes

- DrawerConfig sub-form nested inside each cabinet FormGroup
- Progressive disclosure: drawer fields appear only when count > 0
- Defaults: slide_clearance=13, front_gap=30, drawer_gap=3, drawer_material_thickness=15
- Custom heights: dynamic FormArray of number inputs, count must match drawer_count
- Validation: each drawer height >= 60mm; sum of custom heights must fit in usable_height

### orchestratorBrief

```
tech: Angular, Reactive Forms (nested FormGroup + FormArray), conditional rendering
keyFiles: src/app/components/drawer-config/, src/app/models/drawer-config.ts
approach: Nested form with progressive disclosure, custom height array for "custom" layout
complexity: High (nested dynamic forms with cross-field validation)
```

## Test Strategy

(Planned later by test planner)

## Dependencies

- US008 (cabinet list provides the parent form context)
