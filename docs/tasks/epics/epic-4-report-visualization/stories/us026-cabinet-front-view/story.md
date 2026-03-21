# US026: Detailed Cabinet Front View

**Status:** Backlog
**Epic:** Epic 4 — Report & Visualization
**Created:** 2026-03-21
**INVEST Score:** 5/6

---

## User Story

As a user, I want to see a detailed front-view diagram of each cabinet showing the carcass structure, drawer divisions, and all key dimensions so that I can verify the design before cutting.

## Acceptance Criteria

1. Each cabinet rendered as an SVG front-view showing side panels, bottom panel, top rails, and back panel outline
2. Drawer cabinets show individual drawer boxes with gaps between them
3. All dimensions labeled: outer width, body height, leg height, inner width, drawer heights
4. Cabinet name and quantity shown above each diagram

## Technical Notes

- New component: `CabinetFrontViewComponent`
- Input: single `Cabinet` + `depth` + `BoardSpec` (for thickness)
- SVG scale: ~0.3 px/mm (larger than cutting layout for readability)
- Structural elements drawn as distinct regions:
  - Side panels: vertical rectangles at left/right edges (thickness wide)
  - Bottom: horizontal rectangle at base (inner_width wide)
  - Top rails: horizontal rectangles at top (inner_width x rail_width)
  - Back panel: hatched/dashed rectangle behind (visual hint only)
- Drawer boxes: rectangles inside cabinet body with gap spacing
- Dimension lines: external arrows with mm values (architectural drawing style)
- Colors: use Design Guidelines palette — sides brown, bottom green, rails blue, drawers orange

### orchestratorBrief

```
tech: Angular, SVG, TypeScript
keyFiles: src/app/components/cabinet-front-view/
approach: SVG front-view with structural elements as colored rects + dimension annotations
complexity: Medium (architectural dimension lines, drawer layout rendering)
```

## Test Strategy

(Planned later by test planner)

## Dependencies

- US021 (report layout shell)
- US009 (DrawerConfig for drawer dimensions)
