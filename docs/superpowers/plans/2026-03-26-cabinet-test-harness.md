# Cabinet Test Harness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a fixture-based test harness that loads JSON cabinet scenarios and verifies all BOM calculator outputs (pieces, banding, hardware).

**Architecture:** External JSON fixtures in `src/app/services/fixtures/` define one cabinet each with expected outputs. A single spec file auto-discovers all fixtures via Vite's `import.meta.glob`, builds a `ProjectConfig` + `Cabinet` from each, runs the calculator services, resolves material indices, and asserts every piece, banding total, and hardware count.

**Tech Stack:** Vitest, Angular TestBed, TypeScript, Vite import.meta.glob

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/app/services/fixtures/plain-base-600.json` | Fixture: 600mm base, no drawers, nailed back |
| `src/app/services/fixtures/drawer-base-600-equal.json` | Fixture: 600mm base, 3 equal drawers |
| `src/app/services/fixtures/grooved-base-600.json` | Fixture: 600mm base, grooved back+overlap |
| `src/app/services/cabinet-harness.spec.ts` | Test runner: loads fixtures, runs calculators, asserts |

---

### Task 1: Create the first fixture (plain base cabinet)

**Files:**
- Create: `src/app/services/fixtures/plain-base-600.json`

- [ ] **Step 1: Create the fixture JSON**

```json
{
  "name": "600mm base cabinet, no drawers, nailed back",
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
    "quantity": 1
  },
  "expected": {
    "pieces": [
      { "name": "Side", "width": 740, "height": 514, "quantity": 2, "materialIndex": 0 },
      { "name": "Bottom", "width": 564, "height": 514, "quantity": 1, "materialIndex": 0 },
      { "name": "Rail", "width": 564, "height": 80, "quantity": 2, "materialIndex": 0 },
      { "name": "Back panel", "width": 564, "height": 722, "quantity": 1, "materialIndex": 2 }
    ],
    "edgeBanding": {
      "lengthMm": 2249,
      "materialIndex": 0
    },
    "hardware": { "legSets": 1, "slidePairs": 0 }
  }
}
```

Hand-calculated expected values:
- bodyHeight = 890 - 150 = 740
- innerW = 600 - 2*18 = 564
- Side: 740 x 514, qty 2 (carcass 18mm)
- Bottom: 564 x 514, qty 1 (carcass 18mm)
- Rail: 564 x 80, qty 2 (carcass 18mm)
- Back panel (nailed): width = innerW = 564, height = bodyHeight - thickness = 740 - 18 = 722, qty 1 (HDF)
- Edge banding: `ceil((740*2 + 564) * 1.1) = ceil(2044 * 1.1) = ceil(2248.4) = 2249`

- [ ] **Step 3: Commit**

```bash
git add src/app/services/fixtures/plain-base-600.json
git commit -m "test: add plain base cabinet fixture"
```

---

### Task 2: Create the test runner

**Files:**
- Create: `src/app/services/cabinet-harness.spec.ts`

- [ ] **Step 1: Write the test runner that loads fixtures and runs assertions**

```typescript
import { TestBed } from '@angular/core/testing';
import { ElementCalculatorService } from './element-calculator.service';
import { DrawerCalculatorService } from './drawer-calculator.service';
import { Cabinet, CutPiece, Material, materialToBoardSpec, HdfMountType } from '../models';

interface FixturePiece {
  name: string;
  width: number;
  height: number;
  quantity: number;
  materialIndex: number;
}

interface Fixture {
  name: string;
  materials: Material[];
  config: {
    cabinetType: 'base' | 'wall' | 'tall';
    totalHeight: number;
    legs: number;
    depth: number;
    railWidth: number;
    kerf: number;
    carcassMaterialIndex: number;
    drawerMaterialIndex: number;
    hdfMaterialIndex: number;
    slideClearance: number;
    frontGap: number;
    drawerGap: number;
    backPanelMount: HdfMountType;
    backPanelOverlap: number;
    drawerBottomMount: HdfMountType;
    drawerBottomOverlap: number;
  };
  cabinet: {
    name: string;
    width: number;
    quantity: number;
    totalHeight?: number;
    drawers?: { count: number; layout: 'equal' | 'graduated' | 'custom'; heights?: number[] };
  };
  expected: {
    pieces: FixturePiece[];
    edgeBanding: { lengthMm: number; materialIndex: number };
    hardware: { legSets: number; slidePairs: number };
  };
}

// Auto-discover all fixture JSON files
const fixtureModules = import.meta.glob<{ default: Fixture }>('./fixtures/*.json', { eager: true });

function buildMaterialIndexLookup(materials: Material[]): Record<string, number> {
  const lookup: Record<string, number> = {};
  materials.forEach((mat, index) => {
    if (mat.thickness === 3) {
      lookup['hdf_3mm'] = index;
    } else {
      lookup[`${mat.thickness}mm`] = index;
    }
  });
  return lookup;
}

for (const [path, mod] of Object.entries(fixtureModules)) {
  const fixture = mod.default;

  describe(`Fixture: ${fixture.name}`, () => {
    let elements: ElementCalculatorService;
    let drawers: DrawerCalculatorService;

    beforeEach(() => {
      TestBed.configureTestingModule({});
      elements = TestBed.inject(ElementCalculatorService);
      drawers = TestBed.inject(DrawerCalculatorService);
    });

    // Build cabinet from fixture data
    function buildCabinet(): Cabinet {
      const c = fixture.config;
      const bodyHeight = c.cabinetType === 'base' ? (fixture.cabinet.totalHeight ?? c.totalHeight) - c.legs : (fixture.cabinet.totalHeight ?? c.totalHeight);
      const legHeight = c.cabinetType === 'base' ? c.legs : 0;
      const drawerThickness = fixture.materials[c.drawerMaterialIndex].thickness;

      const cab: Cabinet = {
        ...fixture.cabinet,
        bodyHeight,
        legHeight,
      };

      if (fixture.cabinet.drawers) {
        cab.drawers = {
          ...fixture.cabinet.drawers,
          slideClearance: c.slideClearance,
          frontGap: c.frontGap,
          drawerGap: c.drawerGap,
          drawerMaterialThickness: drawerThickness,
        };
      }

      return cab;
    }

    function getAllPieces(): CutPiece[] {
      const c = fixture.config;
      const cab = buildCabinet();
      const cabs = [cab];
      const board = materialToBoardSpec(fixture.materials[c.carcassMaterialIndex], c.kerf);
      const drawerMatType = `${fixture.materials[c.drawerMaterialIndex].thickness}mm`;

      const carcass = elements.calculateCarcass(cabs, c.depth, board, c.railWidth);
      const drawerPieces = drawers.calculateDrawerPieces(cabs, c.depth, board.thickness, drawerMatType);
      const hdf = elements.calculateHdf(
        cabs, c.depth, board.thickness,
        c.drawerBottomMount, c.drawerBottomOverlap,
        c.backPanelMount, c.backPanelOverlap,
      );

      return [...carcass, ...drawerPieces, ...hdf];
    }

    it('should produce correct pieces', () => {
      const pieces = getAllPieces();
      const lookup = buildMaterialIndexLookup(fixture.materials);

      for (const exp of fixture.expected.pieces) {
        const match = pieces.find(
          (p) => p.name.includes(exp.name) && p.sourceCabinet === fixture.cabinet.name,
        );
        expect(match).toBeDefined();
        if (!match) continue;

        expect(match.width).withContext(`${exp.name} width`).toBe(exp.width);
        expect(match.height).withContext(`${exp.name} height`).toBe(exp.height);
        expect(match.quantity).withContext(`${exp.name} quantity`).toBe(exp.quantity);
        expect(lookup[match.materialType]).withContext(`${exp.name} materialIndex`).toBe(exp.materialIndex);
      }
    });

    it('should not produce unexpected pieces', () => {
      const pieces = getAllPieces();
      const lookup = buildMaterialIndexLookup(fixture.materials);

      for (const piece of pieces) {
        const match = fixture.expected.pieces.find(
          (exp) => piece.name.includes(exp.name) && lookup[piece.materialType] === exp.materialIndex,
        );
        expect(match)
          .withContext(`Unexpected piece: ${piece.name} (${piece.width}x${piece.height}, material ${piece.materialType})`)
          .toBeDefined();
      }
    });

    it('should calculate correct edge banding', () => {
      const c = fixture.config;
      const cab = buildCabinet();
      const board = materialToBoardSpec(fixture.materials[c.carcassMaterialIndex], c.kerf);
      const result = elements.calculateEdgeBanding([cab], c.depth, board.thickness);

      expect(result.totalMm)
        .withContext('edge banding total mm')
        .toBe(fixture.expected.edgeBanding.lengthMm);

      // Verify banding material comes from the expected material
      const bandingMat = fixture.materials[fixture.expected.edgeBanding.materialIndex];
      expect(bandingMat.edgeBanding).toBeTruthy();
    });

    it('should calculate correct hardware', () => {
      const c = fixture.config;
      const cab = buildCabinet();
      const result = elements.calculateHardware([cab], c.cabinetType);

      expect(result.legSets).withContext('leg sets').toBe(fixture.expected.hardware.legSets);
      expect(result.slidePairs).withContext('slide pairs').toBe(fixture.expected.hardware.slidePairs);
    });
  });
}
```

- [ ] **Step 2: Run tests to verify the harness works with the plain fixture**

Run: `npx ng test --watch=false`
Expected: 4 new tests pass (correct pieces, no unexpected, edge banding, hardware)

- [ ] **Step 3: Commit**

```bash
git add src/app/services/cabinet-harness.spec.ts
git commit -m "test: add fixture-based cabinet test harness"
```

---

### Task 3: Add drawer fixture

**Files:**
- Create: `src/app/services/fixtures/drawer-base-600-equal.json`

- [ ] **Step 1: Create the drawer fixture JSON**

Hand calculations for 600mm base, 3 equal drawers, legs=150, depth=514:
- bodyHeight = 890 - 150 = 740
- innerW = 600 - 2*18 = 564
- Carcass pieces: same as plain (Side 740x514 qty 2, Bottom 564x514 qty 1, Rail 564x80 qty 2)
- Drawer dimensions:
  - drawerInnerW = 564 - 2*13 = 538
  - drawerDepth = 514 - 30 - 20 = 464
  - usable = 740 - 18 - 18 - (3+1)*3 - 3*3 = 740 - 36 - 12 - 9 = 683
  - equal height = floor(683/3) = 227
- Drawer pieces per drawer: side 464x227 qty 2, front 538x227 qty 1, back 538x227 qty 1
  - 3 drawers, qty 1 cabinet: side qty 6, front qty 3, back qty 3
- HDF back panel (nailed): 564 x 722, qty 1
- HDF drawer bottoms (nailed): width=538, height=464, qty 3
- Edge banding: cabMm = 740*2*1 + 564*1 = 2044, drawer: drawerInnerW * count * qty = 538*3*1 = 1614, total = 2044+1614 = 3658, withMargin = ceil(3658*1.1) = ceil(4023.8) = 4024
- Hardware: legSets=1, slidePairs=3

```json
{
  "name": "600mm base cabinet, 3 equal drawers, nailed",
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
    "name": "C60D",
    "width": 600,
    "quantity": 1,
    "drawers": {
      "count": 3,
      "layout": "equal"
    }
  },
  "expected": {
    "pieces": [
      { "name": "Side", "width": 740, "height": 514, "quantity": 2, "materialIndex": 0 },
      { "name": "Bottom", "width": 564, "height": 514, "quantity": 1, "materialIndex": 0 },
      { "name": "Rail", "width": 564, "height": 80, "quantity": 2, "materialIndex": 0 },
      { "name": "Side", "width": 464, "height": 227, "quantity": 6, "materialIndex": 1 },
      { "name": "Front", "width": 538, "height": 227, "quantity": 3, "materialIndex": 1 },
      { "name": "Back", "width": 538, "height": 227, "quantity": 3, "materialIndex": 1 },
      { "name": "Back panel", "width": 564, "height": 722, "quantity": 1, "materialIndex": 2 },
      { "name": "Drawer bottom", "width": 538, "height": 464, "quantity": 3, "materialIndex": 2 }
    ],
    "edgeBanding": {
      "lengthMm": 4024,
      "materialIndex": 0
    },
    "hardware": { "legSets": 1, "slidePairs": 3 }
  }
}
```

- [ ] **Step 2: Run tests**

Run: `npx ng test --watch=false`
Expected: 8 tests pass (4 per fixture x 2 fixtures). The harness auto-discovers the new file.

- [ ] **Step 3: Commit**

```bash
git add src/app/services/fixtures/drawer-base-600-equal.json
git commit -m "test: add drawer cabinet fixture (3 equal drawers)"
```

---

### Task 4: Add grooved back panel fixture

**Files:**
- Create: `src/app/services/fixtures/grooved-base-600.json`

- [ ] **Step 1: Create the grooved fixture JSON**

Hand calculations for 600mm base, no drawers, grooved back, overlap=8:
- bodyHeight = 740, innerW = 564 (same as plain)
- Carcass pieces: identical to plain
- HDF back panel (grooved):
  - backW = innerW + 2*overlap = 564 + 16 = 580
  - backH = bodyHeight - 2*thickness + 2*overlap = 740 - 36 + 16 = 720
- Edge banding: same as plain = 2249
- Hardware: legSets=1, slidePairs=0

```json
{
  "name": "600mm base cabinet, no drawers, grooved back panel",
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
    "backPanelMount": "grooved",
    "backPanelOverlap": 8,
    "drawerBottomMount": "nailed",
    "drawerBottomOverlap": 8
  },
  "cabinet": {
    "name": "C60G",
    "width": 600,
    "quantity": 1
  },
  "expected": {
    "pieces": [
      { "name": "Side", "width": 740, "height": 514, "quantity": 2, "materialIndex": 0 },
      { "name": "Bottom", "width": 564, "height": 514, "quantity": 1, "materialIndex": 0 },
      { "name": "Rail", "width": 564, "height": 80, "quantity": 2, "materialIndex": 0 },
      { "name": "Back panel", "width": 580, "height": 720, "quantity": 1, "materialIndex": 2 }
    ],
    "edgeBanding": {
      "lengthMm": 2249,
      "materialIndex": 0
    },
    "hardware": { "legSets": 1, "slidePairs": 0 }
  }
}
```

- [ ] **Step 2: Run tests**

Run: `npx ng test --watch=false`
Expected: 12 tests pass (4 per fixture x 3 fixtures)

- [ ] **Step 3: Commit**

```bash
git add src/app/services/fixtures/grooved-base-600.json
git commit -m "test: add grooved back panel cabinet fixture"
```

---

### Task 5: Final verification and cleanup

**Files:**
- None (verification only)

- [ ] **Step 1: Run full test suite**

Run: `npx ng test --watch=false`
Expected: All tests pass (57 existing + 12 new = 69 unit tests)

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 3: Commit all if any formatting changes from lint-staged**

```bash
git add -A
git commit -m "test: cabinet test harness complete (3 fixtures, 12 tests)"
```
