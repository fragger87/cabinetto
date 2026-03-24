import { ElementCalculatorService } from './element-calculator.service';
import { BoardSpec, Cabinet, DRAWER_BACK_CLEARANCE } from '../models';

describe('ElementCalculatorService', () => {
  let service: ElementCalculatorService;
  const board: BoardSpec = { width: 2800, height: 2070, thickness: 18, kerf: 4 };

  function makeCab(overrides: Partial<Cabinet> = {}): Cabinet {
    return {
      name: 'C60',
      width: 600,
      quantity: 1,
      bodyHeight: 740,
      legHeight: 150,
      ...overrides,
    };
  }

  function makeDrawerCab(): Cabinet {
    return makeCab({
      name: 'D60',
      drawers: {
        count: 3,
        layout: 'equal',
        slideClearance: 13,
        frontGap: 30,
        drawerGap: 3,
        drawerMaterialThickness: 15,
      },
    });
  }

  beforeEach(() => {
    service = new ElementCalculatorService();
  });

  describe('calculateHdf', () => {
    it('should generate back panel for every cabinet', () => {
      const pieces = service.calculateHdf([makeCab()], 514, board.thickness);
      const back = pieces.find((p) => p.name.includes('Back panel'));
      expect(back).toBeDefined();
      // innerW = 600 - 2*18 = 564, height = 740 - 18 = 722
      expect(back!.width).toBe(564);
      expect(back!.height).toBe(722);
    });

    it('should generate drawer bottoms for drawer cabinets (under mount)', () => {
      const pieces = service.calculateHdf([makeDrawerCab()], 514, board.thickness, 'nailed');
      const bottom = pieces.find((p) => p.name.includes('Drawer bottom'));
      expect(bottom).toBeDefined();
      // drawerW = 564 - 2*13 = 538, drawerD = 514 - 30 - 20 = 464
      expect(bottom!.width).toBe(538);
      expect(bottom!.height).toBe(514 - 30 - DRAWER_BACK_CLEARANCE);
      expect(bottom!.quantity).toBe(3); // 3 drawers
    });

    it('should compute grooved drawer bottom dimensions', () => {
      const pieces = service.calculateHdf([makeDrawerCab()], 514, board.thickness, 'grooved', 8);
      const bottom = pieces.find((p) => p.name.includes('Drawer bottom'))!;
      // grooved: width = drawerW - 2*matT + 2*overlap = 538 - 30 + 16 = 524
      const drawerW = 538;
      const drawerD = 514 - 30 - DRAWER_BACK_CLEARANCE;
      expect(bottom.width).toBe(drawerW - 2 * 15 + 2 * 8);
      expect(bottom.height).toBe(drawerD - 2 * 15 + 2 * 8);
    });

    it('should not generate drawer bottoms for non-drawer cabinet', () => {
      const pieces = service.calculateHdf([makeCab()], 514, board.thickness);
      expect(pieces.find((p) => p.name.includes('Drawer bottom'))).toBeUndefined();
    });
  });

  describe('calculateEdgeBanding', () => {
    it('should include side + bottom edges for plain cabinet', () => {
      const result = service.calculateEdgeBanding([makeCab()], 514, board.thickness);
      // sides: 740 * 2 * 1 = 1480, bottom: 564 * 1 = 564, total = 2044
      const rawMm = 740 * 2 + 564;
      expect(result.entries[0].lengthMm).toBe(rawMm);
    });

    it('should add drawer front edges for drawer cabinet', () => {
      const plain = service.calculateEdgeBanding([makeCab()], 514, board.thickness);
      const drawer = service.calculateEdgeBanding([makeDrawerCab()], 514, board.thickness);
      expect(drawer.entries[0].lengthMm).toBeGreaterThan(plain.entries[0].lengthMm);
    });

    it('should apply +10% safety margin to total', () => {
      const result = service.calculateEdgeBanding([makeCab()], 514, board.thickness);
      const rawTotal = result.entries.reduce((s, e) => s + e.lengthMm, 0);
      expect(result.totalMm).toBe(Math.ceil(rawTotal * 1.1));
    });
  });

  describe('calculateHardware', () => {
    it('should count leg sets for base cabinets', () => {
      const result = service.calculateHardware([makeCab({ quantity: 3 })], 'base');
      expect(result.legSets).toBe(3);
    });

    it('should not count legs for wall cabinets', () => {
      const result = service.calculateHardware([makeCab()], 'wall');
      expect(result.legSets).toBe(0);
    });

    it('should count slide pairs per drawer', () => {
      const result = service.calculateHardware([makeDrawerCab()], 'base');
      expect(result.slidePairs).toBe(3); // 3 drawers × 1 qty
    });

    it('should multiply slides by cabinet quantity', () => {
      const cab = makeDrawerCab();
      cab.quantity = 2;
      const result = service.calculateHardware([cab], 'base');
      expect(result.slidePairs).toBe(6); // 3 drawers × 2 qty
    });
  });
});
