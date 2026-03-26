# Epic 1: Project Input & Configuration

**Status:** Done
**Created:** 2026-03-20
**Type:** Business

---

## Goal

Enable users to define cabinet projects through an interactive editor with full drawer support, and import/export projects via JSON format.

## Scope

### In Scope

- Board specification form (width, height, thickness, kerf)
- Global project settings (cabinet_type, total_height, bottom_mode, rail_width)
- Polymorphic leg/depth fields: toggle between fixed value and min/max range
- Cabinet list editor: add, remove, reorder cabinets
- Per-cabinet fields: name, width, quantity, optional total_height override
- Drawer configuration per cabinet: count, layout scheme (equal/graduated/custom), slide_clearance, front_gap, drawer_gap, drawer_material_thickness
- Custom drawer heights array (when layout = "custom")
- JSON file import (full spec format) and export
- Reactive form validation with clear error messages
- Input state feeds into optimization engine (Epic 2) via shared project model

### Out of Scope

- Running optimization (Epic 2)
- Report generation (Epic 4)
- DXF/KCD file import
- Material database / predefined board sizes
- Drag-and-drop cabinet reordering (future enhancement)
- Visual cabinet preview in the input form

## Success Criteria

- All fields from APPLICATION_SPEC.md JSON format are editable in the UI
- JSON round-trip: export a project, import it back — produces identical ProjectConfig
- Invalid inputs (negative dimensions, min > max, drawer_count < 1) show inline error messages
- Drawer config supports all 3 layout schemes: equal, graduated, custom
- Polymorphic fields (legs, depth) correctly toggle between fixed integer and {min, max} object

## Dependencies

- Epic 0: Angular project scaffold, TypeScript models

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Complex reactive form state for polymorphic fields | Medium | Use Angular reactive forms with custom validators; unit test each field type |
| Drawer config UX complexity | Medium | Progressive disclosure: show drawer fields only when drawer_count > 0 |

## Architecture Impact

- Defines the `ProjectConfig` interface — the central data model consumed by all other Epics
- Establishes form component patterns reused across the application
- JSON parser becomes a standalone service testable in isolation

## Phases

1. TypeScript model interfaces (ProjectConfig, BoardSpec, Cabinet, DrawerConfig)
2. Board specification form component
3. Cabinet list editor with add/remove
4. Drawer configuration sub-form (conditional, per-cabinet)
5. Polymorphic field components (fixed vs range toggle)
6. JSON import/export service
7. Form validation and error feedback
