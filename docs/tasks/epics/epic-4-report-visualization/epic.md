# Epic 4: Report & Visualization

**Status:** Done
**Created:** 2026-03-20
**Type:** Business

---

## Goal

Generate a comprehensive visual report with cabinet diagrams, cutting layout SVGs, parts lists, and order summary — with print-to-PDF export capability.

## Scope

### In Scope

- Cabinet visualization: scaled color blocks showing width, depth, body_height, leg_height per cabinet
- Project parameters panel: board spec, optimized dimensions, shared leg height
- Cabinet summary table: per-cabinet width, body_height, leg_height, quantity, drawer_count
- Order summary dashboard: board counts (18mm + 15mm), HDF count, leg sets, slide pairs, edge banding meters
- Parts list tables:
  - 18mm particleboard (element name, dimensions, quantity, source cabinet)
  - 15mm drawer box parts (element name, dimensions, quantity, source cabinet)
  - 3mm HDF (back panels + drawer bottoms)
- Edge banding table: per-cabinet breakdown with running meters
- Cutting layout SVG diagrams:
  - Color-coded pieces: brown=sides, green=bottoms, blue=rails, orange=drawer parts
  - Dimension labels on pieces large enough to display them
  - Hover tooltips with full piece info (name, dimensions, source cabinet)
  - Utilization percentage per board
  - Separate board groups for 18mm and 15mm material
- Print-to-PDF button (window.print() with print-optimized CSS)
- Responsive layout with warm wood-tone color scheme (#b8860b, #8B4513)

### Out of Scope

- DXF/SVG file export for CNC machines
- CutList Plus / OptiCut compatibility export
- Label generation (per-piece stickers)
- Cost estimation panel
- Interactive editing within the report view
- 3D cabinet rendering

## Success Criteria

- Report visually matches current Python HTML output for carcass-only projects
- Drawer parts appear in dedicated 15mm board group with orange color coding
- All boards display utilization percentage
- Hover tooltips show piece name, dimensions (w x h), and source cabinet name
- Print produces clean layout: one board per page, no cut-off elements
- Responsive: readable on screens from 1024px to 2560px wide

## Dependencies

- Epic 2: BoardLayout[] (placed pieces with coordinates for SVG rendering)
- Epic 3: BomSummary (parts lists, edge banding, hardware counts for tables)

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| SVG rendering performance with many boards (>20) | Medium | Lazy-render boards below the fold; virtualize if needed |
| Print CSS compatibility across browsers | Medium | Test in Chrome + Firefox; use @media print with explicit page-break rules |
| Color accessibility (color-blind users can't distinguish piece types) | Low | Add pattern fills or labels as secondary differentiator |

## Architecture Impact

- Report component consumes BoardLayout[] and BomSummary as @Input() data
- SVG rendering as Angular component (not raw innerHTML) for tooltip interactivity
- Print styles as separate stylesheet loaded via @media print

## Phases

1. Report layout shell (responsive CSS grid, wood-tone theme)
2. Project parameters panel + cabinet summary table
3. Parts list tables (18mm, 15mm, HDF) + edge banding table
4. Order summary dashboard
5. Cabinet visualization component (scaled blocks)
6. Cutting layout SVG component (color-coded pieces, tooltips, utilization)
7. Print-to-PDF optimization (@media print CSS)
