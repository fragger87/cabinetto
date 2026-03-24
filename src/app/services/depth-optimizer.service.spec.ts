import { DepthOptimizerService } from './depth-optimizer.service';

describe('DepthOptimizerService', () => {
  let service: DepthOptimizerService;

  beforeEach(() => {
    service = new DepthOptimizerService();
  });

  describe('heuristicDepth', () => {
    it('should return a depth within the given range', () => {
      const best = service.heuristicDepth(500, 550, 2070, 4);
      expect(best).toBeGreaterThanOrEqual(500);
      expect(best).toBeLessThanOrEqual(550);
    });

    it('should minimize strip waste', () => {
      const best = service.heuristicDepth(500, 550, 2070, 4);
      const bestStrips = Math.floor((2070 + 4) / (best + 4));
      const bestUsed = bestStrips * best + (bestStrips - 1) * 4;
      const bestWaste = 2070 - bestUsed;

      // Check that no other depth in range has less waste
      for (let d = 500; d <= 550; d++) {
        const strips = Math.floor((2070 + 4) / (d + 4));
        if (strips < 1) continue;
        const used = strips * d + (strips - 1) * 4;
        const waste = 2070 - used;
        expect(bestWaste).toBeLessThanOrEqual(waste);
      }
    });

    it('should return min when range is a single value', () => {
      expect(service.heuristicDepth(514, 514, 2070, 4)).toBe(514);
    });
  });

  describe('generateCandidates', () => {
    it('should produce candidates at 5mm steps', () => {
      const candidates = service.generateCandidates(500, 550, 2070, 4);
      expect(candidates.length).toBe(11); // 500,505,510,...,550
      expect(candidates[0].depth).toBe(500);
      expect(candidates[10].depth).toBe(550);
    });

    it('should calculate correct strip count and waste', () => {
      const candidates = service.generateCandidates(500, 500, 2070, 4);
      // strips = (2070+4) / (500+4) = 2074/504 = 4
      expect(candidates[0].strips).toBe(4);
      // used = 4*500 + 3*4 = 2012, waste = 2070-2012 = 58
      expect(candidates[0].stripWaste).toBe(58);
    });
  });
});
