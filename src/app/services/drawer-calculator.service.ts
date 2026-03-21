import { Injectable } from '@angular/core';
import { Cabinet, CutPiece, DrawerConfig, DRAWER_DEFAULTS } from '../models';

const MIN_DRAWER_HEIGHT = 60;

export interface DrawerDimensions {
  innerWidth: number;
  depth: number;
  heights: number[];
}

@Injectable({ providedIn: 'root' })
export class DrawerCalculatorService {
  /**
   * Compute drawer box dimensions from cabinet + drawer config.
   */
  computeDimensions(cab: Cabinet, depth: number, boardThickness: number): DrawerDimensions | null {
    const cfg = cab.drawers;
    if (!cfg || cfg.count < 1) return null;

    const innerW = cab.width - 2 * boardThickness;
    const drawerInnerW = innerW - 2 * cfg.slideClearance;
    const backClearance = 20; // mm — HDF back panel + mounting clearance
    const drawerDepth = depth - cfg.frontGap - backClearance;
    const heights = this.computeHeights(cab.bodyHeight, cfg, boardThickness);

    if (heights.some((h) => h < MIN_DRAWER_HEIGHT)) return null;

    return { innerWidth: drawerInnerW, depth: drawerDepth, heights };
  }

  /**
   * Generate 15mm cut pieces for drawer boxes.
   */
  calculateDrawerPieces(cabinets: Cabinet[], depth: number, boardThickness: number): CutPiece[] {
    const pieces: CutPiece[] = [];

    for (const cab of cabinets) {
      const dims = this.computeDimensions(cab, depth, boardThickness);
      if (!dims) continue;

      const matThick =
        cab.drawers?.drawerMaterialThickness ?? DRAWER_DEFAULTS.drawerMaterialThickness;

      for (let d = 0; d < dims.heights.length; d++) {
        const h = dims.heights[d];
        const label = `Drawer ${d + 1} [${cab.name}]`;

        pieces.push({
          name: `${label} Side`,
          width: dims.depth,
          height: h,
          materialType: '15mm',
          sourceCabinet: cab.name,
          quantity: 2 * cab.quantity,
        });

        pieces.push({
          name: `${label} Front`,
          width: dims.innerWidth,
          height: h,
          materialType: '15mm',
          sourceCabinet: cab.name,
          quantity: cab.quantity,
        });

        pieces.push({
          name: `${label} Back`,
          width: dims.innerWidth,
          height: h - matThick,
          materialType: '15mm',
          sourceCabinet: cab.name,
          quantity: cab.quantity,
        });
      }
    }

    return pieces;
  }

  private computeHeights(bodyHeight: number, cfg: DrawerConfig, boardThickness: number): number[] {
    const hdfBottomThickness = 3; // each drawer box has a 3mm HDF bottom
    // Subtract: top rail + cabinet bottom panel + (N+1) gaps + N drawer HDF bottoms
    const usable =
      bodyHeight -
      boardThickness -
      boardThickness -
      (cfg.count + 1) * cfg.drawerGap -
      cfg.count * hdfBottomThickness;

    switch (cfg.layout) {
      case 'equal': {
        const h = Math.floor(usable / cfg.count);
        return Array.from({ length: cfg.count }, () => h);
      }
      case 'graduated': {
        // Proportional: 1 : 1.5 : 2 : 2.5 : ... for N drawers
        const ratios = Array.from({ length: cfg.count }, (_, i) => 1 + i * 0.5);
        const totalRatio = ratios.reduce((a, b) => a + b, 0);
        return ratios.map((r) => Math.floor((usable * r) / totalRatio));
      }
      case 'custom':
        return cfg.heights ?? [];
    }
  }
}
