# Cabinet Test Harness — Design Spec

**Date:** 2026-03-26
**Status:** Approved

## Problem

No easy way to define a specific cabinet configuration and verify all calculator outputs (cut pieces, edge banding, hardware) in one place. Existing tests are either per-service unit tests or full-pipeline integration tests. A tester who wants to check "a 600mm cabinet with 3 drawers should produce these exact pieces" has to write test code.

## Solution

A fixture-based test harness where each JSON file defines one cabinet scenario with hand-calculated expected values. A single generic test runner loads all fixtures and asserts outputs match.

## Fixture Format

Each file in `src/app/services/fixtures/*.json`:

```json
{
  "name": "600mm base cabinet, 3 equal drawers",
  "materials": [
    { "name": "PB 18mm", "width": 2800, "height": 2070, "thickness": 18, "edgeBanding": "PCV_1" },
    { "name": "PB 15mm", "width": 2800, "height": 2070, "thickness": 15, "edgeBanding": "PCV_2" },
    { "name": "HDF 3mm", "width": 2800, "height": 2070, "thickness": 3, "edgeBanding": "" }
  ],
  "config": {
    "cabinetType": "base",
    "totalHeight": 890,
    "legs": 150,
    "depth": 514,
    "railWidth": 80,
    "kerf": 4,
    "carcassMaterialIndex": 0,
    "drawerMaterialIndex": 1,
    "hdfMaterialIndex": 2,
    "slideClearance": 13,
    "frontGap": 30,
    "drawerGap": 3,
    "backPanelMount": "nailed",
    "backPanelOverlap": 8,
    "drawerBottomMount": "nailed",
    "drawerBottomOverlap": 8
  },
  "cabinet": {
    "name": "C60",
    "width": 600,
    "quantity": 1,
    "drawers": {
      "count": 3,
      "layout": "equal"
    }
  },
  "expected": {
    "pieces": [
      { "name": "Side panel", "width": 740, "height": 514, "quantity": 2, "materialIndex": 0 },
      { "name": "Bottom panel", "width": 564, "height": 514, "quantity": 1, "materialIndex": 0 },
      { "name": "Top rail", "width": 564, "height": 80, "quantity": 2, "materialIndex": 0 },
      { "name": "Drawer side", "width": 464, "height": 228, "quantity": 6, "materialIndex": 1 },
      { "name": "Drawer front", "width": 538, "height": 228, "quantity": 3, "materialIndex": 1 },
      { "name": "Drawer back", "width": 538, "height": 228, "quantity": 3, "materialIndex": 1 },
      { "name": "Back panel", "width": 564, "height": 722, "quantity": 1, "materialIndex": 2 },
      { "name": "Drawer bottom", "width": 538, "height": 464, "quantity": 3, "materialIndex": 2 }
    ],
    "edgeBanding": {
      "lengthMm": 3658,
      "materialIndex": 0
    },
    "hardware": { "legSets": 1, "slidePairs": 3 }
  }
}
```

### Field Descriptions

| Field | Purpose |
|-------|---------|
| `name` | Human-readable scenario description (used as test name) |
| `materials` | Material library — array of Material objects |
| `config` | Project-level params: material indices, clearances, mount types |
| `config.slideClearance/frontGap/drawerGap` | Drawer clearances (project-level defaults, not per-cabinet) |
| `cabinet` | One cabinet definition with optional `drawers` block |
| `cabinet.drawers` | Drawer config: `count` and `layout` scheme only (clearances + thickness from config/materials) |
| `expected.pieces` | Flat array of all expected pieces across all material types |
| `expected.pieces[].materialIndex` | Index into the `materials` array (integer) |
| `expected.edgeBanding.lengthMm` | Total edge banding in mm (with +10% margin applied) |
| `expected.edgeBanding.materialIndex` | Index into `materials` array for the banding source material |
| `expected.hardware` | Leg sets and drawer slide pairs |

### Derived Values (not in fixture)

The test harness derives these from fixture data — the fixture never duplicates them:

| Value | Derived From |
|-------|-------------|
| `drawerMaterialThickness` | `materials[config.drawerMaterialIndex].thickness` |
| `boardThickness` | `materials[config.carcassMaterialIndex].thickness` |
| `BoardSpec` | `materialToBoardSpec(materials[config.carcassMaterialIndex], config.kerf)` |
| `bodyHeight` | `config.totalHeight - config.legs` (for base cabinets) |
| `legHeight` | `config.legs` (base) or `0` (wall/tall) |
| `drawerMatType` | `` `${materials[config.drawerMaterialIndex].thickness}mm` `` |

## Test Runner

Single file: `src/app/services/cabinet-harness.spec.ts`

### Algorithm

1. Import all `*.json` from `src/app/services/fixtures/` using Vite's `import.meta.glob`
2. For each fixture:
   a. Build `ProjectConfig` from fixture's `materials`, `config`, and `cabinet`
   b. Derive `drawerMaterialThickness` from materials array, inject into drawer config
   c. Build `Cabinet` with computed `bodyHeight` and `legHeight`
   d. Build `BoardSpec` from carcass material via `materialToBoardSpec()`
   e. Run calculators:
      - `ElementCalculatorService.calculateCarcass(cabs, depth, board, railWidth)` → carcass pieces
      - `DrawerCalculatorService.calculateDrawerPieces(cabs, depth, boardThickness, drawerMatType)` → drawer pieces
      - `ElementCalculatorService.calculateHdf(cabs, depth, ...)` → HDF pieces
      - `ElementCalculatorService.calculateEdgeBanding(cabs, depth, boardThickness)` → banding
      - `ElementCalculatorService.calculateHardware(cabs, cabinetType)` → hardware
   f. Build material index lookup: `materialType` code → index in materials array
   g. Assert:
      - Each expected piece found in output with matching name, width, height, quantity, material index
      - No unexpected extra pieces in output
      - Edge banding total matches `expected.edgeBanding.lengthMm`
      - Edge banding material index matches `expected.edgeBanding.materialIndex`
      - Hardware counts match `expected.hardware`

### Material Index Resolution

Output `CutPiece.materialType` is a thickness code (e.g., `"15mm"`, `"hdf_3mm"`). The harness builds a reverse lookup:

```
for each (index, material) in fixture.materials:
  if material.thickness === 3:
    lookup["hdf_3mm"] = index
  else:
    lookup[`${material.thickness}mm`] = index
```

Then resolves each output piece: `resolvedIndex = lookup[piece.materialType]`.

### Test Output

Each fixture generates a `describe` block named after the fixture's `name` field, with individual `it` blocks for:
- "should produce correct pieces" (name, dimensions, quantity, material index for each)
- "should not produce unexpected pieces"
- "should calculate correct edge banding"
- "should calculate correct hardware"

## Starter Fixtures

| File | Scenario | Key Aspects |
|------|----------|-------------|
| `plain-base-600.json` | 600mm base, no drawers, nailed back | Carcass + HDF back panel only |
| `drawer-base-600-equal.json` | 600mm base, 3 equal drawers, nailed | All piece types, drawer material, hardware |
| `grooved-base-600.json` | 600mm base, no drawers, grooved back+overlap | Grooved HDF dimensions (width+overlap, different height formula) |

## Adding a New Test

1. Create a new JSON file in `src/app/services/fixtures/`
2. Define materials, config, cabinet, and hand-calculated expected values
3. Run `npm test` — the harness auto-discovers the new file

No code changes needed.

## Constraints

- Fixtures test per-cabinet calculations only (not the optimization sweep or bin packing)
- Expected values are hand-calculated by the tester — the harness does not compute them
- The harness uses Angular TestBed to instantiate services (consistent with existing test patterns)
- Piece name matching uses `includes()` — fixture says `"Side panel"`, matches output `"Side panel [C60]"`
