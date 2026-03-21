import { CuttingOptimizerService } from './cutting-optimizer.service';
import { BoardSpec, CutPiece } from '../models';

describe('CuttingOptimizerService', () => {
  let service: CuttingOptimizerService;

  const board: BoardSpec = { width: 2800, height: 2070, thickness: 18, kerf: 4 };

  beforeEach(() => {
    service = new CuttingOptimizerService();
  });

  it('should pack simple pieces onto one board', () => {
    const pieces: CutPiece[] = [
      {
        name: 'Side',
        width: 700,
        height: 500,
        materialType: '18mm',
        sourceCabinet: 'A',
        quantity: 2,
      },
      {
        name: 'Bottom',
        width: 564,
        height: 500,
        materialType: '18mm',
        sourceCabinet: 'A',
        quantity: 1,
      },
    ];

    const layouts = service.optimize(pieces, board, 500);

    expect(layouts.length).toBe(1);
    expect(layouts[0].placedPieces.length).toBe(3);
    expect(layouts[0].utilization).toBeGreaterThan(0);
  });

  it('should use multiple boards when pieces overflow', () => {
    const pieces: CutPiece[] = [
      {
        name: 'Big',
        width: 2000,
        height: 1500,
        materialType: '18mm',
        sourceCabinet: 'A',
        quantity: 3,
      },
    ];

    const layouts = service.optimize(pieces, board, 1500);

    expect(layouts.length).toBeGreaterThan(1);
  });

  it('should try both orientations', () => {
    const pieces: CutPiece[] = [
      {
        name: 'Tall',
        width: 100,
        height: 600,
        materialType: '18mm',
        sourceCabinet: 'A',
        quantity: 1,
      },
    ];

    const layouts = service.optimize(pieces, board, 500);
    const placed = layouts[0].placedPieces[0];

    // Piece should be rotated to fit in 500mm strip (600 > 500, but 100 < 500)
    expect(placed.width).toBe(600);
    expect(placed.height).toBe(100);
  });

  it('should calculate utilization as percentage', () => {
    const pieces: CutPiece[] = [
      {
        name: 'Full',
        width: 2800,
        height: 500,
        materialType: '18mm',
        sourceCabinet: 'A',
        quantity: 1,
      },
    ];

    const layouts = service.optimize(pieces, board, 500);
    const expectedUtil = ((2800 * 500) / (2800 * 2070)) * 100;

    expect(layouts[0].utilization).toBeCloseTo(expectedUtil, 1);
  });

  it('should initialize correct number of strips', () => {
    const pieces: CutPiece[] = [
      {
        name: 'Side',
        width: 700,
        height: 514,
        materialType: '18mm',
        sourceCabinet: 'A',
        quantity: 1,
      },
    ];

    // With depth=514, kerf=4: strips = (2070+4)/(514+4) = 2074/518 = 4 strips
    const layouts = service.optimize(pieces, board, 514);

    expect(layouts.length).toBe(1);
    expect(layouts[0].placedPieces.length).toBe(1);
  });

  it('should handle empty piece list', () => {
    const layouts = service.optimize([], board, 500);

    expect(layouts.length).toBe(0);
  });
});
