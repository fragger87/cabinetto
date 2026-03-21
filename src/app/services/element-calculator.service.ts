import { Injectable } from '@angular/core';
import {
  BoardSpec,
  Cabinet,
  CutPiece,
  EdgeBandingEntry,
  EdgeBandingResult,
  HardwareResult,
} from '../models';

@Injectable({ providedIn: 'root' })
export class ElementCalculatorService {
  /**
   * Generate 18mm carcass cut pieces for given cabinets.
   * Requires pre-computed bodyHeight and legHeight on each cabinet.
   */
  calculateCarcass(
    cabinets: Cabinet[],
    depth: number,
    board: BoardSpec,
    bottomMode: 'full' | 'recessed',
    railWidth: number,
  ): CutPiece[] {
    const thickness = board.thickness;
    const bottomDepth = bottomMode === 'full' ? depth : depth - thickness;
    const pieces: CutPiece[] = [];

    for (const cab of cabinets) {
      const innerW = cab.width - 2 * thickness;

      pieces.push({
        name: `Side [${cab.name}]`,
        width: cab.bodyHeight,
        height: depth,
        materialType: '18mm',
        sourceCabinet: cab.name,
        quantity: 2 * cab.quantity,
      });

      pieces.push({
        name: `Bottom [${cab.name}]`,
        width: innerW,
        height: bottomDepth,
        materialType: '18mm',
        sourceCabinet: cab.name,
        quantity: cab.quantity,
      });

      pieces.push({
        name: `Rail [${cab.name}]`,
        width: innerW,
        height: railWidth,
        materialType: '18mm',
        sourceCabinet: cab.name,
        quantity: 2 * cab.quantity,
      });
    }

    return pieces;
  }

  /**
   * Generate HDF (3mm) cut pieces: back panels for all cabinets,
   * drawer bottoms for drawer cabinets.
   */
  calculateHdf(
    cabinets: Cabinet[],
    depth: number,
    boardThickness: number,
    drawerBottomMount: 'under' | 'grooved' = 'under',
    drawerBottomOverlap = 8,
  ): CutPiece[] {
    const pieces: CutPiece[] = [];

    for (const cab of cabinets) {
      const innerW = cab.width - 2 * boardThickness;

      pieces.push({
        name: `Back panel [${cab.name}]`,
        width: innerW,
        height: cab.bodyHeight - boardThickness,
        materialType: 'hdf_3mm',
        sourceCabinet: cab.name,
        quantity: cab.quantity,
      });

      if (cab.drawers && cab.drawers.count > 0) {
        const drawerW = innerW - 2 * cab.drawers.slideClearance;
        const backClearance = 20;
        const drawerD = depth - cab.drawers.frontGap - backClearance;
        const matT = cab.drawers.drawerMaterialThickness;

        // under: HDF = outer drawer box dimensions (sits under sides)
        // grooved: HDF = inner dimensions + 2×overlap (captured in grooves)
        const bottomW =
          drawerBottomMount === 'under' ? drawerW : drawerW - 2 * matT + 2 * drawerBottomOverlap;
        const bottomD =
          drawerBottomMount === 'under' ? drawerD : drawerD - 2 * matT + 2 * drawerBottomOverlap;

        pieces.push({
          name: `Drawer bottom [${cab.name}]`,
          width: bottomW,
          height: bottomD,
          materialType: 'hdf_3mm',
          sourceCabinet: cab.name,
          quantity: cab.drawers.count * cab.quantity,
        });
      }
    }

    return pieces;
  }

  /**
   * Calculate edge banding in running millimeters (with +10% safety margin).
   */
  calculateEdgeBanding(
    cabinets: Cabinet[],
    depth: number,
    boardThickness: number,
  ): EdgeBandingResult {
    const entries: EdgeBandingEntry[] = [];
    let totalMm = 0;

    for (const cab of cabinets) {
      const innerW = cab.width - 2 * boardThickness;
      const qty = cab.quantity;

      // Side front edges + bottom front edge
      let cabMm = cab.bodyHeight * 2 * qty + innerW * qty;

      // Drawer front panel edges (top edge + 2 side edges per drawer front)
      if (cab.drawers && cab.drawers.count > 0) {
        const drawerInnerW = innerW - 2 * cab.drawers.slideClearance;
        // Simplified: front panel top edge per drawer
        cabMm += drawerInnerW * cab.drawers.count * qty;
      }

      entries.push({ cabinetName: cab.name, lengthMm: cabMm });
      totalMm += cabMm;
    }

    const withMargin = Math.ceil(totalMm * 1.1);

    return { entries, totalMm: withMargin, totalMeters: withMargin / 1000 };
  }

  /**
   * Calculate hardware counts.
   */
  calculateHardware(cabinets: Cabinet[], cabinetType: 'base' | 'wall' | 'tall'): HardwareResult {
    let legSets = 0;
    let slidePairs = 0;

    for (const cab of cabinets) {
      if (cabinetType === 'base') {
        legSets += cab.quantity;
      }
      if (cab.drawers && cab.drawers.count > 0) {
        slidePairs += cab.drawers.count * cab.quantity;
      }
    }

    return { legSets, slidePairs };
  }
}
