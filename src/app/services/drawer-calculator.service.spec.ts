import { DrawerCalculatorService } from './drawer-calculator.service';
import { Cabinet, DRAWER_BACK_CLEARANCE, HDF_BOTTOM_THICKNESS } from '../models';

describe('DrawerCalculatorService', () => {
  let service: DrawerCalculatorService;
  const thickness = 18;

  function makeCab(overrides: Partial<Cabinet> = {}): Cabinet {
    return {
      name: 'D60',
      width: 600,
      quantity: 1,
      bodyHeight: 740,
      legHeight: 150,
      drawers: {
        count: 3,
        layout: 'equal',
        slideClearance: 13,
        frontGap: 30,
        drawerGap: 3,
        drawerMaterialThickness: 15,
      },
      ...overrides,
    };
  }

  beforeEach(() => {
    service = new DrawerCalculatorService();
  });

  describe('computeDimensions', () => {
    it('should compute correct inner width with slide clearance', () => {
      const dims = service.computeDimensions(makeCab(), 514, thickness);
      // innerW = 600 - 2*18 = 564, drawerInnerW = 564 - 2*13 = 538
      expect(dims?.innerWidth).toBe(538);
    });

    it('should compute depth with front gap and back clearance', () => {
      const dims = service.computeDimensions(makeCab(), 514, thickness);
      // depth = 514 - 30 (frontGap) - 20 (backClearance) = 464
      expect(dims?.depth).toBe(514 - 30 - DRAWER_BACK_CLEARANCE);
    });

    it('should return null for cabinet without drawers', () => {
      const cab = makeCab({ drawers: undefined });
      expect(service.computeDimensions(cab, 514, thickness)).toBeNull();
    });

    it('should return null when drawer height falls below 60mm', () => {
      // Very short body → drawers too small
      const cab = makeCab({ bodyHeight: 100 });
      expect(service.computeDimensions(cab, 514, thickness)).toBeNull();
    });
  });

  describe('equal layout heights', () => {
    it('should produce N equal heights', () => {
      const dims = service.computeDimensions(makeCab(), 514, thickness);
      expect(dims?.heights.length).toBe(3);
      expect(dims?.heights[0]).toBe(dims?.heights[1]);
      expect(dims?.heights[1]).toBe(dims?.heights[2]);
    });

    it('should subtract rail + bottom + (N+1) gaps + N HDF bottoms', () => {
      const cab = makeCab();
      const dims = service.computeDimensions(cab, 514, thickness)!;
      // usable = 740 - 18 - 18 - (3+1)*3 - 3*3 = 740 - 36 - 12 - 9 = 683
      const usable = 740 - thickness - thickness - 4 * 3 - 3 * HDF_BOTTOM_THICKNESS;
      const expectedH = Math.floor(usable / 3);
      expect(dims.heights[0]).toBe(expectedH);
    });
  });

  describe('graduated layout heights', () => {
    it('should produce increasing heights (1 : 1.5 : 2)', () => {
      const cab = makeCab({
        drawers: { ...makeCab().drawers!, layout: 'graduated' },
      });
      const dims = service.computeDimensions(cab, 514, thickness)!;
      expect(dims.heights[0]).toBeLessThan(dims.heights[1]);
      expect(dims.heights[1]).toBeLessThan(dims.heights[2]);
    });
  });

  describe('custom layout heights', () => {
    it('should use provided heights directly', () => {
      const cab = makeCab({
        drawers: {
          ...makeCab().drawers!,
          layout: 'custom',
          heights: [120, 180, 240],
        },
      });
      const dims = service.computeDimensions(cab, 514, thickness)!;
      expect(dims.heights).toEqual([120, 180, 240]);
    });
  });

  describe('calculateDrawerPieces', () => {
    it('should generate 3 piece types per drawer (side, front, back)', () => {
      const pieces = service.calculateDrawerPieces([makeCab()], 514, thickness);
      // 3 drawers × 3 types = 9 piece entries
      expect(pieces.length).toBe(9);
    });

    it('should set back height equal to front height', () => {
      const pieces = service.calculateDrawerPieces([makeCab()], 514, thickness);
      const front = pieces.find((p) => p.name.includes('Drawer 1') && p.name.includes('Front'));
      const back = pieces.find((p) => p.name.includes('Drawer 1') && p.name.includes('Back'));
      expect(back!.height).toBe(front!.height);
    });

    it('should set side quantity = 2 × cabinet quantity', () => {
      const cab = makeCab({ quantity: 2 });
      const pieces = service.calculateDrawerPieces([cab], 514, thickness);
      const side = pieces.find((p) => p.name.includes('Side'))!;
      expect(side.quantity).toBe(4); // 2 sides × 2 qty
    });

    it('should return empty array for non-drawer cabinet', () => {
      const cab = makeCab({ drawers: undefined });
      expect(service.calculateDrawerPieces([cab], 514, thickness)).toEqual([]);
    });
  });
});
