# US027: Cabinet Cross-Section / Side View

**Status:** Done
**Epic:** Epic 4 — Report & Visualization
**Created:** 2026-03-21
**INVEST Score:** 5/6

---

## User Story

As a user, I want to see a side-view cross-section of each cabinet showing depth, bottom mode, and drawer slide clearances so that I can verify the depth-related dimensions.

## Acceptance Criteria

1. Side-view SVG shows depth dimension, bottom panel position (full vs recessed)
2. Drawer cabinets show drawer depth and front gap
3. Slide clearance indicated with dimension annotation
4. Leg height shown below the cabinet body

## Technical Notes

- New component: `CabinetSideViewComponent`
- Input: single `Cabinet` + `depth` + `BoardSpec` + `bottomMode`
- Cross-section looking from the side (left edge): shows depth horizontally, height vertically
- Key elements:
  - Side panel: full rectangle (body_height x depth)
  - Bottom: horizontal line at bottom (full depth or recessed)
  - Back panel: vertical line at rear (3mm HDF)
  - Drawer boxes: inset from front by front_gap, inset from sides by slide_clearance
- Dimension lines: depth, front_gap, slide_clearance, body_height, leg_height
- Bottom mode visual difference: full = bottom flush with front, recessed = bottom set back by thickness

### orchestratorBrief

```
tech: Angular, SVG, TypeScript
keyFiles: src/app/components/cabinet-side-view/
approach: SVG cross-section with depth-axis elements + dimension annotations
complexity: Medium (cross-section geometry, bottom mode variants)
```

## Test Strategy

(Planned later by test planner)

## Dependencies

- US026 (shares dimension line rendering approach)
