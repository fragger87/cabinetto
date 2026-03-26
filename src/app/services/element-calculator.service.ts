import { Injectable } from '@angular/core';
import {
  BoardSpec,
  Cabinet,
  CutPiece,
  EdgeBandingEntry,
  EdgeBandingResult,
  HardwareResult,
  DRAWER_BACK_CLEARANCE,
  HdfMountType,
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
    railWidth: number,
  ): CutPiece[] {
    const thickness = board.thickness;
    const bottomDepth = depth;
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
    drawerBottomMount: HdfMountType = 'nailed',
    drawerBottomOverlap = 8,
    backPanelMount: HdfMountType = 'nailed',
    backPanelOverlap = 8,
  ): CutPiece[] {
    const pieces: CutPiece[] = [];

    for (const cab of cabinets) {
      const innerW = cab.width - 2 * boardThickness;
      // Nailed panel sits behind carcass, spanning from below the top rail
      // to the bottom edge (no bottom rail blocks it) → subtract one thickness.
      // Grooved panel slides into dadoes in both rails → subtract two thicknesses
      // but extend into both grooves by the overlap amount.
      const backW = backPanelMount === 'nailed' ? innerW : innerW + 2 * backPanelOverlap;
      const backHFinal =
        backPanelMount === 'nailed'
          ? cab.bodyHeight - boardThickness
          : cab.bodyHeight - 2 * boardThickness + 2 * backPanelOverlap;

      pieces.push({
        name: `Back panel [${cab.name}]`,
        width: backW,
        height: backHFinal,
        materialType: 'hdf_3mm',
        sourceCabinet: cab.name,
        quantity: cab.quantity,
      });

      if (cab.drawers && cab.drawers.count > 0) {
        const drawerW = innerW - 2 * cab.drawers.slideClearance;
        const backClearance = DRAWER_BACK_CLEARANCE;
        const drawerD = depth - cab.drawers.frontGap - backClearance;
        const matT = cab.drawers.drawerMaterialThickness;

        const bottomW =
          drawerBottomMount === 'nailed' ? drawerW : drawerW - 2 * matT + 2 * drawerBottomOverlap;
        const bottomD =
          drawerBottomMount === 'nailed' ? drawerD : drawerD - 2 * matT + 2 * drawerBottomOverlap;

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

      // Band all exposed front-facing edges for moisture protection:
      // sides (2 long edges visible) + bottom (front edge only, sides glued to panels)
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
