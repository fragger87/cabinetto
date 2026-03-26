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

for (const [, mod] of Object.entries(fixtureModules)) {
  const fixture = (mod as { default: Fixture }).default;

  describe(`Fixture: ${fixture.name}`, () => {
    let elements: ElementCalculatorService;
    let drawerCalc: DrawerCalculatorService;

    beforeEach(() => {
      TestBed.configureTestingModule({});
      elements = TestBed.inject(ElementCalculatorService);
      drawerCalc = TestBed.inject(DrawerCalculatorService);
    });

    function buildCabinet(): Cabinet {
      const c = fixture.config;
      const totalH = fixture.cabinet.totalHeight ?? c.totalHeight;
      const bodyHeight = c.cabinetType === 'base' ? totalH - c.legs : totalH;
      const legHeight = c.cabinetType === 'base' ? c.legs : 0;
      const drawerThickness = fixture.materials[c.drawerMaterialIndex].thickness;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { drawers: _rawDrawers, ...cabinetBase } = fixture.cabinet;
      const cab: Cabinet = {
        ...cabinetBase,
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
      const drawerPieces = drawerCalc.calculateDrawerPieces(
        cabs,
        c.depth,
        board.thickness,
        drawerMatType,
      );
      const hdf = elements.calculateHdf(
        cabs,
        c.depth,
        board.thickness,
        c.drawerBottomMount,
        c.drawerBottomOverlap,
        c.backPanelMount,
        c.backPanelOverlap,
      );

      return [...carcass, ...drawerPieces, ...hdf];
    }

    it('should produce correct pieces', () => {
      const pieces = getAllPieces();
      const lookup = buildMaterialIndexLookup(fixture.materials);

      for (const exp of fixture.expected.pieces) {
        const match = pieces.find(
          (p) =>
            p.name.includes(exp.name) &&
            p.sourceCabinet === fixture.cabinet.name &&
            lookup[p.materialType] === exp.materialIndex,
        );
        expect(match, `Expected piece "${exp.name}" not found`).toBeDefined();
        if (!match) continue;

        expect(match.width, `${exp.name} width`).toBe(exp.width);
        expect(match.height, `${exp.name} height`).toBe(exp.height);
        expect(match.quantity, `${exp.name} quantity`).toBe(exp.quantity);
        expect(lookup[match.materialType], `${exp.name} materialIndex`).toBe(exp.materialIndex);
      }
    });

    it('should not produce unexpected pieces', () => {
      const pieces = getAllPieces();
      const lookup = buildMaterialIndexLookup(fixture.materials);

      for (const piece of pieces) {
        const match = fixture.expected.pieces.find(
          (exp: FixturePiece) =>
            piece.name.includes(exp.name) && lookup[piece.materialType] === exp.materialIndex,
        );
        expect(
          match,
          `Unexpected piece: ${piece.name} (${piece.width}x${piece.height}, material ${piece.materialType})`,
        ).toBeDefined();
      }
    });

    it('should calculate correct edge banding', () => {
      const c = fixture.config;
      const cab = buildCabinet();
      const board = materialToBoardSpec(fixture.materials[c.carcassMaterialIndex], c.kerf);
      const result = elements.calculateEdgeBanding([cab], c.depth, board.thickness);

      expect(result.totalMm, 'edge banding total mm').toBe(fixture.expected.edgeBanding.lengthMm);
    });

    it('should calculate correct hardware', () => {
      const c = fixture.config;
      const cab = buildCabinet();
      const result = elements.calculateHardware([cab], c.cabinetType);

      expect(result.legSets, 'leg sets').toBe(fixture.expected.hardware.legSets);
      expect(result.slidePairs, 'slide pairs').toBe(fixture.expected.hardware.slidePairs);
    });
  });
}
