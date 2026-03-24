# Functional Requirements

Derived from [APPLICATION_SPEC.md](../../APPLICATION_SPEC.md).

## Core Capabilities

| ID | Capability | Description |
|----|-----------|-------------|
| FR-01 | Cabinet Definition | Define base cabinets with name, width, quantity, optional height override |
| FR-02 | Drawer Configuration | Configure drawers per cabinet: count, layout (equal/graduated/custom), clearances; material thickness derived from board |
| FR-03 | Board Specification | Set dimensions for 3 board types: carcass (18mm), drawer (15mm), HDF (3mm) |
| FR-04 | Polymorphic Parameters | Legs and depth accept fixed value or min/max range for optimization |
| FR-05 | Leg Height Optimization | Sweep leg heights at 5mm steps, select fewest-boards winner |
| FR-06 | Depth Optimization | Sweep depths at 5mm steps with heuristic seed, select optimal |
| FR-07 | Guillotine Bin Packing | Place pieces using BSSF heuristic with kerf-aware splits |
| FR-08 | Multi-Material Cutting | Separate optimization passes for 18mm, 15mm, HDF; optional merge drawer+carcass |
| FR-09 | BOM Generation | Calculate all elements: carcass, drawer boxes, HDF, edge banding, hardware |
| FR-10 | Visual Report | SVG cutting layouts, cabinet front/side views, detail panel, parts tables |
| FR-14 | Drawer Same As Carcass | Toggle to cut drawer pieces from carcass boards (merged single pass) |
| FR-15 | HDF Mount Types | Back panel: nailed or grooved; Drawer bottom: nailed or grooved (with overlap) |
| FR-16 | Cabinet Drawings | Detailed front view + side view per cabinet with dimension annotations |
| FR-17 | Cabinet Detail Panel | Click-to-inspect per-cabinet BOM with parts, edge banding, hardware |
| FR-18 | Explanatory Diagrams | Inline SVG diagrams next to input forms showing what each field means |
| FR-11 | Print/PDF Export | Browser print with page-break-per-board layout |
| FR-12 | JSON Import/Export | Save/load projects as JSON files |
| FR-13 | Browser Persistence | Auto-save to localStorage |

## Cabinet Types

| Type | Legs | Description |
|------|------|-------------|
| Base | Yes (adjustable) | Standard floor cabinets with shared leg height |
| Wall | No | Wall-mounted (future) |
| Tall | No | Floor-to-ceiling (future) |

## Constraints

| Constraint | Value |
|------------|-------|
| Minimum body height | 200 mm |
| Minimum drawer height | 60 mm |
| Optimization step | 5 mm |
| Piece rotation | Allowed (no grain direction) |

## Out of Scope

See [APPLICATION_SPEC.md § Potential Future Enhancements](../../APPLICATION_SPEC.md#potential-future-enhancements-out-of-scope).

## Maintenance

**Update when:** New features added or scope changed.
**Source of truth:** APPLICATION_SPEC.md for detailed specifications; this doc for summary view.
