import { TestBed } from '@angular/core/testing';
import { OptimizationOrchestratorService } from './optimization-orchestrator.service';
import { ProjectConfig } from '../models';

describe('OptimizationOrchestratorService', () => {
  let service: OptimizationOrchestratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OptimizationOrchestratorService);
  });

  function makeConfig(overrides: Partial<ProjectConfig> = {}): ProjectConfig {
    return {
      cabinetType: 'base',
      board: { width: 2800, height: 2070, thickness: 18, kerf: 4 },
      drawerBoard: { width: 2800, height: 2070, thickness: 15, kerf: 4 },
      hdfBoard: { width: 2800, height: 2070, thickness: 3, kerf: 4 },
      totalHeight: 890,
      legs: { min: 95, max: 165 },
      depth: { min: 500, max: 550 },
      bottomMode: 'full',
      railWidth: 80,
      drawerBottomMount: 'under',
      drawerBottomOverlap: 8,
      cabinets: [
        { name: 'Cabinet 60cm', width: 600, quantity: 3 },
        { name: 'Cabinet 30cm', width: 300, quantity: 1 },
      ],
      ...overrides,
    };
  }

  it('should produce optimization result with trials', () => {
    const result = service.run(makeConfig());

    expect(result.legHeight).toBeGreaterThanOrEqual(95);
    expect(result.legHeight).toBeLessThanOrEqual(165);
    expect(result.depth).toBeGreaterThanOrEqual(500);
    expect(result.depth).toBeLessThanOrEqual(550);
    expect(result.carcassLayouts.length).toBeGreaterThan(0);
    expect(result.legTrials.length).toBeGreaterThan(0);
    expect(result.depthTrials.length).toBeGreaterThan(0);
  });

  it('should skip leg optimization when legs is fixed', () => {
    const result = service.run(makeConfig({ legs: 150 }));

    expect(result.legHeight).toBe(150);
    expect(result.legTrials.length).toBe(0);
  });

  it('should skip depth optimization when depth is fixed', () => {
    const result = service.run(makeConfig({ depth: 514 }));

    expect(result.depth).toBe(514);
    expect(result.depthTrials.length).toBe(0);
  });

  it('should handle single cabinet', () => {
    const result = service.run(
      makeConfig({ cabinets: [{ name: 'Solo', width: 600, quantity: 1 }] }),
    );

    expect(result.cabinets.length).toBe(1);
    expect(result.carcassLayouts.length).toBeGreaterThan(0);
  });

  it('should respect per-cabinet height override', () => {
    const result = service.run(
      makeConfig({
        legs: 150,
        cabinets: [
          { name: 'A', width: 600, quantity: 1, totalHeight: 890 },
          { name: 'B', width: 600, quantity: 1, totalHeight: 690 },
        ],
      }),
    );

    const cabA = result.cabinets.find((c) => c.name === 'A')!;
    const cabB = result.cabinets.find((c) => c.name === 'B')!;

    expect(cabA.bodyHeight).toBe(890 - 150);
    expect(cabB.bodyHeight).toBe(690 - 150);
  });

  it('should produce drawer layouts for drawer cabinets', () => {
    const result = service.run(
      makeConfig({
        legs: 150,
        depth: 514,
        cabinets: [
          {
            name: 'Drawer unit',
            width: 600,
            quantity: 1,
            drawers: {
              count: 3,
              layout: 'equal',
              slideClearance: 13,
              frontGap: 30,
              drawerGap: 3,
              drawerMaterialThickness: 15,
            },
          },
        ],
      }),
    );

    expect(result.drawerPieces.length).toBeGreaterThan(0);
    expect(result.drawerLayouts.length).toBeGreaterThan(0);
    // 3 drawers x 3 parts each (side, front, back) = 9 piece types
    expect(result.drawerPieces.length).toBe(9);
  });

  it('should produce empty drawer layouts for non-drawer project', () => {
    const result = service.run(
      makeConfig({
        legs: 150,
        depth: 514,
        cabinets: [{ name: 'Plain', width: 600, quantity: 1 }],
      }),
    );

    expect(result.drawerPieces.length).toBe(0);
    expect(result.drawerLayouts.length).toBe(0);
  });
});
