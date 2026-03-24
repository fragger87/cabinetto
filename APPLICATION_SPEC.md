# Kitchen Cabinet Carcass Calculator — Application Specification

## Overview

A specialized tool for designing European-style frameless kitchen cabinet carcasses — including drawer units — and computing optimal board cutting layouts. The application takes a cabinet project definition (dimensions, quantities, constraints) and produces a complete bill of materials with a visually annotated cutting plan that minimizes sheet material waste.

The core value proposition is **two-stage parametric optimization**: the application automatically finds the best leg height and cabinet depth (within user-specified tolerances) by running full cutting simulations for every candidate value and selecting the combination that uses the fewest boards with the highest material utilization.

## Technology Decision: Frontend-Only (No Backend)

**Decision**: Pure Angular SPA — all computation runs client-side in the browser. No backend server required.

**Rationale**:
- The optimization algorithms (guillotine bin packing, BSSF heuristic) are O(N) per parameter sweep with moderate iteration counts (~15 candidates × ~100 pieces). This runs in milliseconds on modern browsers.
- No persistent storage needed — projects are saved as JSON files via browser download/upload or localStorage.
- No user accounts, authentication, or multi-user collaboration in scope.
- Static hosting (GitHub Pages, Netlify, any CDN) eliminates server costs and ops overhead.
- The Python prototype proves the algorithms are simple enough to port to TypeScript without external math libraries.

**Frontend stack**: Angular (latest LTS) with TypeScript. Zero runtime dependencies beyond Angular core. All optimization logic implemented as pure TypeScript services.

---

## Domain Model

### Cabinet Construction (European Frameless / "Korpus")

Each base cabinet carcass consists of:

| Part | Material | Count per cabinet | Dimensions |
|---|---|---|---|
| **Side panels (Boki)** | 18 mm particleboard | 2 | body_height × depth |
| **Bottom panel (Dno)** | 18 mm particleboard | 1 | inner_width × depth (full depth mode) or inner_width × (depth − 18 mm) |
| **Top rails (Listwy górne)** | 18 mm particleboard | 2 | inner_width × rail_width (default 80 mm) |
| **Back panel (Plecy)** | 3 mm HDF | 1 | inner_width × (body_height − 18 mm) |

Where `inner_width = cabinet_width − 2 × board_thickness`.

Base cabinets sit on adjustable legs. Wall cabinets and tall cabinets have no legs.

### Drawer Construction

A drawer cabinet uses the same carcass as a standard cabinet but contains one or more drawer boxes instead of shelves. Each drawer box consists of:

| Part | Material | Count per drawer | Dimensions |
|---|---|---|---|
| **Drawer side panels** | 15 mm particleboard | 2 | drawer_depth × drawer_height |
| **Drawer front panel** | 15 mm particleboard | 1 | drawer_inner_width × drawer_height |
| **Drawer back panel** | 15 mm particleboard | 1 | drawer_inner_width × (drawer_height − 15 mm) |
| **Drawer bottom** | 3 mm HDF | 1 | drawer_inner_width × drawer_depth |

Where:
- `drawer_inner_width = inner_width − 2 × slide_clearance` (default slide_clearance = 13 mm per side for standard ball-bearing slides)
- `drawer_depth = cabinet_depth − front_gap` (default front_gap = 30 mm, accounts for drawer front overlay)
- `drawer_height` is derived from the cabinet body height and the number of drawers, minus gaps between drawers

### Drawer Layout Schemes

Drawers within a cabinet follow one of these predefined layout schemes:

| Scheme | Description | Drawer heights (proportional) |
|---|---|---|
| `equal` | All drawers same height | 1 : 1 : ... : 1 |
| `graduated` | Top drawers shorter, bottom taller | 1 : 1.5 : 2 (for 3 drawers) |
| `custom` | User-specified heights per drawer | explicit array of heights |

**Drawer height calculation (equal scheme)**:
```
usable_height = body_height − top_rail_width − bottom_thickness − (drawer_count − 1) × drawer_gap
drawer_height = usable_height / drawer_count
```
Where `drawer_gap` = 3 mm (clearance between stacked drawers).

### Key Dimensional Relationships

```
total_height       = body_height + leg_height        (base cabinets only)
inner_width        = cabinet_width − 2 × thickness
bottom_depth       = depth                            (full mode)
                   = depth − thickness                (recessed mode)
back_height        = body_height − thickness

drawer_inner_width = inner_width − 2 × slide_clearance
drawer_depth       = depth − front_gap
drawer_box_height  = (usable_height − (N−1) × drawer_gap) / N   (equal scheme)
```

---

## Input Format

### JSON (primary)

All keys use camelCase English names.

```json
{
  "cabinetType": "base",                           // "base" | "wall" | "tall"
  "board": {
    "width": 2800,                                 // board length, mm
    "height": 2070,                                // board width, mm
    "thickness": 18,                               // board thickness, mm
    "kerf": 4                                      // saw blade kerf, mm
  },
  "drawerBoard": {                                 // optional, defaults to 2800×2070×15, kerf 4
    "width": 2800,
    "height": 2070,
    "thickness": 15,
    "kerf": 4
  },
  "hdfBoard": {                                    // optional, defaults to 2800×2070×3, kerf 4
    "width": 2800,
    "height": 2070,
    "thickness": 3,
    "kerf": 4
  },
  "totalHeight": 890,                              // default total height with legs, mm
  "legs": { "min": 95, "max": 165 },              // leg height: range → optimize
  // OR: "legs": 150,                              // leg height: fixed → no simulation
  "depth": { "min": 500, "max": 550 },            // depth: range → optimize
  // OR: "depth": 514,                             // depth: fixed → no simulation
  "bottomMode": "full",                            // "full" | "recessed"
  "railWidth": 80,                                 // top rail width, mm
  "backPanelMount": "nailed",                      // "nailed" | "grooved"
  "backPanelOverlap": 8,                           // mm, groove depth (only if grooved)
  "drawerBottomMount": "nailed",                   // "nailed" | "grooved"
  "drawerBottomOverlap": 8,                        // mm, groove depth (only if grooved)
  "drawerSameAsCarcass": false,                    // true = drawer pieces cut from carcass boards
  "cabinets": [
    {
      "name": "Cabinet 60cm",
      "width": 600,                                // outer width, mm
      "quantity": 3,
      "totalHeight": 890                           // per-cabinet override (optional)
    },
    {
      "name": "Drawer unit 40cm",
      "width": 400,
      "quantity": 2,
      "totalHeight": 890,
      "drawers": {                                 // optional: makes this a drawer cabinet
        "count": 3,
        "layout": "equal",                         // "equal" | "graduated" | "custom"
        "slideClearance": 13,                      // mm per side (optional, default 13)
        "frontGap": 30,                            // mm (optional, default 30)
        "drawerGap": 3,                            // mm between drawers (optional, default 3)
        "drawerMaterialThickness": 15              // mm (optional, default 15)
      }
    },
    {
      "name": "Drawer unit custom",
      "width": 600,
      "quantity": 1,
      "drawers": {
        "count": 3,
        "layout": "custom",
        "heights": [120, 180, 240]                 // explicit drawer box heights, mm
      }
    }
  ]
}
```

**Polymorphic value fields** — `legs` and `depth` accept either:
- A single **integer** → used as a fixed value, no optimization performed.
- An **object `{ "min": N, "max": M }`** → the optimizer sweeps the range at 5 mm intervals, running a full cutting simulation for each candidate, and selects the value yielding the fewest boards (ties broken by highest utilization).

CSV import has been removed from scope. JSON is the sole file format.

---

## Optimization Pipeline

The optimizer runs in two sequential stages. Each stage is skipped when the corresponding parameter is a fixed value instead of a range.

### Stage 1 — Leg Height Optimization

**Goal**: Find a single, shared leg height for ALL cabinets that produces the best cutting layout.

**Constraint**: All cabinets share the same leg height, even when their total heights differ. This means different cabinets end up with different body heights, but the same legs — a practical requirement since adjustable legs come pre-set to one height during installation.

**Algorithm**:
1. If depth is also a range, compute an initial depth using a fast heuristic (minimize strip waste from board width).
2. For each candidate leg height from `leg_min` to `leg_max` at 5 mm steps:
   a. Derive body_height = total_height − leg_height for every cabinet.
   b. Validate all body heights ≥ 200 mm.
   c. Generate the full parts list (sides, bottoms, rails).
   d. Run the guillotine-cut bin packing simulation (see below).
   e. Record: number of boards, utilization %, waste in m².
3. Select the candidate with the fewest boards; break ties by highest utilization.

**Output**: A comparison table printed to the console showing every candidate and its result, with the winner marked.

### Stage 2 — Depth Optimization

**Goal**: Find the cabinet depth (within a tolerance range) that produces the best cutting layout, using the leg height determined in Stage 1.

**Algorithm**:
1. For each candidate depth from `depth_min` to `depth_max` at 5 mm steps:
   a. Compute how many horizontal strips fit in the board height: `strips = (board_height + kerf) ÷ (depth + kerf)`.
   b. Generate the full parts list with this depth.
   c. Run the guillotine-cut bin packing simulation.
   d. Record: number of boards, utilization %, waste in m², number of strips, strip waste.
2. Select the candidate with the fewest boards; break ties by highest utilization.

**Output**: A comparison table printed to the console showing every candidate and its result, with the winner marked.

### Heuristic Depth Optimizer — `optimize_depth()` (used only as Stage 1 initializer)

A fast O(N) scan over the depth range that minimizes leftover material when the board height is divided into horizontal strips of depth `d`:

```
for d in range(min_depth, max_depth + 1):
    strips = (board_height + kerf) // (d + kerf)
    waste  = board_height - (strips × d + (strips - 1) × kerf)
    track minimum waste
```

This is only used to provide an initial depth value for Stage 1 when depth is also a range (to avoid running the full simulation with an arbitrary depth).

---

## Cutting Optimizer — Guillotine Cut Bin Packing

The board is modeled as a 2D rectangle. The cutting process is constrained to **guillotine cuts** — each cut goes fully across one dimension of a free rectangle, which matches how panel saws operate in practice.

### Strip Initialization

The board is pre-divided into horizontal strips based on the optimized depth:

```
strip_count = (board_height + kerf) ÷ (depth + kerf)
```

Each strip becomes an initial free rectangle of dimensions `board_width × depth`. The waste between the last strip and the board edge is not usable.

### Placement Heuristic — Best Short Side Fit (BSSF)

For each piece (processed in decreasing area order):

1. Try both orientations: `(width × height)` and `(height × width)`.
2. For each orientation, find all free rectangles where the piece fits.
3. Score each candidate by `min(rect_w − piece_w, rect_h − piece_h)` — the Best Short Side Fit metric.
4. Choose the placement with the lowest score (tightest fit).

### Rectangle Splitting

After placing a piece in a free rectangle, the remaining space is split into at most two new free rectangles:

```
+------------------+
|  placed piece    |  right remainder (if width > 0)
|  (w × h)        |  → (rect_w − w − kerf) × rect_h
+------------------+
|  bottom remainder (if height > 0)
|  → w × (rect_h − h − kerf)
+------------------+
```

Kerf is subtracted from both splits to account for the saw blade width.

### Free Rectangle Sorting

After each placement, free rectangles are re-sorted to prioritize:
1. Full-depth strips first (height equals the optimized depth).
2. Then by decreasing area.

This ensures that pieces are placed into the most constrained spaces first, improving packing density.

### Multi-Board Fallback

If a piece cannot fit on the current board, a new board is started with fresh strip initialization.

---

## Bill of Materials Calculation

### 18 mm Particleboard Elements (Carcass)

For each cabinet definition (expanded by quantity):

| Element | Width | Height | Count |
|---|---|---|---|
| Side panel | body_height | depth | 2 × qty |
| Bottom panel | inner_width | bottom_depth | 1 × qty |
| Top rail | inner_width | rail_width | 2 × qty |

### 15 mm Particleboard Elements (Drawer Boxes)

For each drawer cabinet (expanded by quantity × drawer count):

| Element | Width | Height | Count per drawer |
|---|---|---|---|
| Drawer side | drawer_depth | drawer_box_height | 2 |
| Drawer front | drawer_inner_width | drawer_box_height | 1 |
| Drawer back | drawer_inner_width | drawer_box_height − 15 mm | 1 |

Drawer box parts are cut from separate 15 mm boards (not from the 18 mm carcass boards). They participate in their own cutting optimization pass with the same guillotine bin packing algorithm.

### 3 mm HDF Elements

| Element | Width | Height | Count |
|---|---|---|---|
| Back panel | inner_width | body_height − thickness | 1 × qty (all cabinets) |
| Drawer bottom | drawer_inner_width | drawer_depth | 1 × drawer_count × qty (drawer cabinets) |

HDF boards are not run through the guillotine optimizer — the required board count is estimated by total area.

### Edge Banding

Calculated per cabinet:
- Side panels: `body_height × 2 × qty` (front edge)
- Bottom panel: `inner_width × qty` (front edge)
- Drawer box front panels: `(drawer_inner_width + 2 × drawer_box_height) × drawer_count × qty` (top edge of each drawer front + side edges visible when open)
- Total reported with a +10% safety margin.

### Hardware

| Item | Count | Condition |
|---|---|---|
| Adjustable legs (set of 4) | 1 × qty | Base cabinets only |
| Drawer slides (pair) | drawer_count × qty | Drawer cabinets only |

---

## Output

### Console Report

A structured text summary including:
- Optimization results for each stage (comparison tables).
- Full parts list with dimensions and quantities.
- Order summary: board count, HDF count, leg sets, edge banding meters.
- Per-board utilization percentages.

### HTML Report

A self-contained, single-file HTML document (no external dependencies) with:

1. **Cabinet visualization** — scaled color blocks showing each cabinet's width, depth, body height, and leg height.
2. **Project parameters** — board spec, optimized dimensions, shared leg height.
3. **Cabinet table** — per-cabinet width, body height, leg height, quantity.
4. **Order summary** — dashboard with board counts, element counts, leg sets, edge banding.
5. **Parts list — 18 mm** — table with element name, dimensions, quantity, source cabinet.
6. **Parts list — HDF 3 mm** — same format.
7. **Edge banding table** — per-cabinet breakdown with running meters.
8. **Parts list — 15 mm (drawer boxes)** — table with drawer part name, dimensions, quantity, source cabinet (only if project contains drawer cabinets).
9. **Cutting layout visualization** — scaled SVG-like diagram of each board with:
   - Color-coded pieces (brown = sides, green = bottoms, blue = rails, orange = drawer parts).
   - Dimension labels on pieces large enough to display them.
   - Hover tooltips with full piece info.
   - Utilization percentage per board.
   - Separate board groups for 18 mm carcass boards and 15 mm drawer boards.
9. **Print button** — triggers `window.print()` for PDF export.

The report uses responsive CSS with a warm wood-toned color scheme (`#b8860b`, `#8B4513`).

---

## Technical Constraints

- **Angular SPA** — no backend. All computation runs client-side in TypeScript.
- **Zero runtime dependencies** beyond Angular core (no lodash, no math libraries).
- **All dimensions in millimeters** (integers).
- **Optimization step**: 5 mm for both leg height and depth simulation.
- **Minimum body height**: 200 mm (hard-coded safety limit).
- **Minimum drawer box height**: 60 mm (hard-coded safety limit).
- **Kerf**: subtracted at every cut boundary.
- **Grain direction**: not currently considered (pieces can be rotated 90°).
- **Drawer material**: 15 mm particleboard for drawer box parts, cut separately from 18 mm carcass boards.

---

## Architecture

### Angular Application Structure

```
Angular SPA
  ├── Project Input (reactive forms)
  │     ├── JSON file upload / manual editor
  │     ├── CSV file upload
  │     └── Interactive cabinet builder (add/remove/configure cabinets + drawers)
  ├── Optimization Engine (pure TypeScript services, no UI)
  │     ├── LegOptimizerService        — Stage 1: leg height sweep
  │     ├── DepthOptimizerService       — Stage 2: depth sweep
  │     ├── ElementCalculatorService    — BOM generation (carcass + drawer parts)
  │     └── CuttingOptimizerService     — Guillotine bin packing with BSSF
  ├── Report Generation
  │     ├── HTML report view (Angular component, same visual as current HTML output)
  │     └── Export: print-to-PDF, JSON project save
  └── Project Persistence
        └── localStorage + JSON file download/upload
```

### Data Flow

```
User input / JSON file
  → ProjectConfig (board spec, global params, cabinet definitions with drawer configs)
    → CabinetProject (with optimized depth, leg heights, body heights, drawer dimensions)
      → CutPiece[] lists (18mm carcass, 15mm drawer boxes, HDF elements)
        → BoardLayout[] (placed pieces with coordinates, per material type)
          → Report view + export
```

### Key Data Structures

| Interface | Purpose |
|---|---|
| `BoardSpec` | Sheet material dimensions (width, height, thickness, kerf) |
| `HdfSpec` | HDF back panel sheet dimensions |
| `DrawerConfig` | Drawer parameters: count, layout scheme, clearances, material thickness |
| `Cabinet` | Single cabinet definition (name, width, qty, body_height, leg_height, optional DrawerConfig) |
| `DrawerBox` | Computed drawer dimensions (inner_width, depth, height, source cabinet) |
| `CabinetProject` | Complete project: board spec, global params, list of cabinets |
| `CutPiece` | A rectangular part to be cut (name, width, height, material_type, source cabinet) |
| `PlacedPiece` | A piece placed on a board (x, y, w, h, source piece, original dimensions) |
| `BoardLayout` | One sheet board with placed pieces and remaining free rectangles |

---

## Potential Future Enhancements (Out of Scope)

### Cabinet Types
- Wall cabinets — no legs, wall-mount bracket allowance.
- Tall/pantry cabinets — floor-to-ceiling with optional legs.
- Corner cabinets (L-shape, lazy Susan) with non-rectangular geometry.

### Construction Details
- Configurable joint types (confirmat screws, dowels, cam locks) affecting hole patterns.
- Shelf pin hole line generation.
- Hinge mounting positions (cup hole coordinates).
- Toe kick / plinth board calculation.
- Countertop cutout dimensions.

### Optimization
- Grain direction constraint (no 90° rotation for visible surfaces).
- Combined 2D grid search (leg × depth simultaneously) instead of sequential.
- Genetic algorithm or simulated annealing for bin packing (better than greedy BSSF).
- Leftover tracking across multiple projects ("what can I cut from my remaining stock?").

### Output
- DXF/SVG export for CNC machines.
- Cutlist export compatible with panel saw optimizers (CutList Plus, OptiCut).
- Label generation (per-piece stickers with cabinet name, orientation, edge banding marks).
- Cost estimation (board price × count + edge banding price × meters + hardware).
- Multi-language support.

### Infrastructure (if backend ever needed)
- REST API for headless operation (CI/CD integration in furniture factories).
- User accounts with project library.
- Material database (standard board sizes, prices, suppliers).
- Collaborative editing (designer + client view).
