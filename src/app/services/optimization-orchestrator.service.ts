import { Injectable, inject } from '@angular/core';
import {
  BoardSpec,
  Cabinet,
  CutPiece,
  BoardLayout,
  ProjectConfig,
  isRange,
  materialToBoardSpec,
} from '../models';
import { CuttingOptimizerService } from './cutting-optimizer.service';
import { ElementCalculatorService } from './element-calculator.service';
import { DepthOptimizerService } from './depth-optimizer.service';
import { DrawerCalculatorService } from './drawer-calculator.service';

// 5mm step balances resolution vs speed: finer steps yield diminishing returns
// because board kerf (typically 4mm) already limits meaningful granularity
const STEP = 5;
// Cabinets shorter than 200mm body are structurally unsound and waste board material
const MIN_BODY_HEIGHT = 200;

export interface TrialResult {
  legHeight: number;
  depth: number;
  boardCount: number;
  utilization: number;
  wasteM2: number;
}

export interface OptimizationResult {
  legHeight: number;
  depth: number;
  cabinets: Cabinet[];
  carcassLayouts: BoardLayout[];
  carcassPieces: CutPiece[];
  drawerLayouts: BoardLayout[];
  drawerPieces: CutPiece[];
  hdfLayouts: BoardLayout[];
  hdfPieces: CutPiece[];
  board: BoardSpec;
  legTrials: TrialResult[];
  depthTrials: TrialResult[];
}

@Injectable({ providedIn: 'root' })
export class OptimizationOrchestratorService {
  private readonly cutter = inject(CuttingOptimizerService);
  private readonly elements = inject(ElementCalculatorService);
  private readonly depthOpt = inject(DepthOptimizerService);
  private readonly drawerCalc = inject(DrawerCalculatorService);

  /**
   * Two-stage brute-force sweep: first find optimal leg height (using a
   * heuristic seed depth), then sweep depth at the winning leg height.
   * Separating the stages avoids an O(N^2) combined search while still
   * finding a near-optimal (leg, depth) pair in practice.
   */
  run(config: ProjectConfig): OptimizationResult {
    const carcassMat = config.materials[config.carcassMaterialIndex];
    const drawerMat =
      config.drawerMaterialIndex === config.carcassMaterialIndex
        ? carcassMat
        : config.materials[config.drawerMaterialIndex];
    const hdfMat = config.materials[config.hdfMaterialIndex];
    const board = materialToBoardSpec(carcassMat, config.kerf);
    const drawerBoard = materialToBoardSpec(drawerMat, config.kerf);
    const hdfBoard = materialToBoardSpec(hdfMat, config.kerf);

    const { legHeight: bestLeg, legTrials } = this.optimizeLegs(config, board);
    const { depth: bestDepth, depthTrials } = this.optimizeDepth(config, board, bestLeg);

    const finalCabs = this.buildCabinets(config, bestLeg, board.thickness, drawerBoard.thickness)!;
    const { finalPieces, carcassLayouts, drawerPieces, drawerLayouts } = this.runCuttingPasses(
      config,
      finalCabs,
      board,
      drawerBoard,
      bestDepth,
    );
    const { hdfPieces, hdfLayouts } = this.runHdfPass(
      config,
      finalCabs,
      board,
      hdfBoard,
      bestDepth,
    );

    return {
      legHeight: bestLeg,
      depth: bestDepth,
      cabinets: finalCabs,
      carcassLayouts,
      carcassPieces: finalPieces,
      drawerLayouts,
      drawerPieces,
      hdfLayouts,
      hdfPieces,
      board,
      legTrials,
      depthTrials,
    };
  }

  private optimizeLegs(
    config: ProjectConfig,
    board: BoardSpec,
  ): { legHeight: number; legTrials: TrialResult[] } {
    const legMin = isRange(config.legs) ? config.legs.min : (config.legs as number);
    const legMax = isRange(config.legs) ? config.legs.max : (config.legs as number);
    const depthMin = isRange(config.depth) ? config.depth.min : (config.depth as number);
    const depthMax = isRange(config.depth) ? config.depth.max : (config.depth as number);
    const depthFixed = !isRange(config.depth);

    // Use heuristic depth as seed so the leg sweep doesn't depend on an
    // arbitrary depth — the heuristic picks the depth that maximizes strip
    // count, giving a representative board utilization for leg comparison
    const seedDepth = depthFixed
      ? depthMin
      : this.depthOpt.heuristicDepth(depthMin, depthMax, board.height, board.kerf);

    if (!isRange(config.legs)) {
      return { legHeight: legMin, legTrials: [] };
    }

    const legTrials: TrialResult[] = [];
    let bestLeg = legMin;
    let bestBoards = Infinity;
    let bestUtil = 0;

    for (let leg = legMin; leg <= legMax; leg += STEP) {
      const cabs = this.buildCabinets(config, leg, board.thickness, board.thickness);
      if (!cabs) continue;
      const pieces = this.elements.calculateCarcass(cabs, seedDepth, board, config.railWidth);
      const layouts = this.cutter.optimize(pieces, board, seedDepth);
      const trial = this.scoreTrial(leg, seedDepth, layouts, board);
      legTrials.push(trial);
      // Primary: fewer boards = fewer sheets to buy
      // Tiebreaker: higher utilization = less offcut waste
      if (
        trial.boardCount < bestBoards ||
        (trial.boardCount === bestBoards && trial.utilization > bestUtil)
      ) {
        bestBoards = trial.boardCount;
        bestUtil = trial.utilization;
        bestLeg = leg;
      }
    }

    return { legHeight: bestLeg, legTrials };
  }

  private optimizeDepth(
    config: ProjectConfig,
    board: BoardSpec,
    bestLeg: number,
  ): { depth: number; depthTrials: TrialResult[] } {
    const depthMin = isRange(config.depth) ? config.depth.min : (config.depth as number);
    const depthMax = isRange(config.depth) ? config.depth.max : (config.depth as number);

    if (!isRange(config.depth)) {
      return { depth: depthMin, depthTrials: [] };
    }

    const depthTrials: TrialResult[] = [];
    let bestDepth = depthMin;
    let bestBoards = Infinity;
    let bestUtil = 0;

    for (let d = depthMin; d <= depthMax; d += STEP) {
      const cabs = this.buildCabinets(config, bestLeg, board.thickness, board.thickness);
      if (!cabs) continue;
      const pieces = this.elements.calculateCarcass(cabs, d, board, config.railWidth);
      const layouts = this.cutter.optimize(pieces, board, d);
      const trial = this.scoreTrial(bestLeg, d, layouts, board);
      depthTrials.push(trial);
      if (
        trial.boardCount < bestBoards ||
        (trial.boardCount === bestBoards && trial.utilization > bestUtil)
      ) {
        bestBoards = trial.boardCount;
        bestUtil = trial.utilization;
        bestDepth = d;
      }
    }

    return { depth: bestDepth, depthTrials };
  }

  private runCuttingPasses(
    config: ProjectConfig,
    cabs: Cabinet[],
    board: BoardSpec,
    drawerBoard: BoardSpec,
    depth: number,
  ) {
    const carcassPieces = this.elements.calculateCarcass(cabs, depth, board, config.railWidth);
    const drawerMatType = `${drawerBoard.thickness}mm`;
    const drawerPieces = this.drawerCalc.calculateDrawerPieces(
      cabs,
      depth,
      board.thickness,
      drawerMatType,
    );

    // When drawer material matches carcass, merge into a single pass —
    // mixed pieces pack tighter than two separate optimizations
    if (config.drawerMaterialIndex === config.carcassMaterialIndex && drawerPieces.length > 0) {
      const finalPieces = [...carcassPieces, ...drawerPieces];
      return {
        finalPieces,
        carcassLayouts: this.cutter.optimize(finalPieces, board, depth),
        drawerPieces,
        drawerLayouts: [] as BoardLayout[],
      };
    }

    // Different materials must be cut from separate boards
    return {
      finalPieces: carcassPieces,
      carcassLayouts: this.cutter.optimize(carcassPieces, board, depth),
      drawerPieces,
      drawerLayouts:
        drawerPieces.length > 0 ? this.cutter.optimize(drawerPieces, drawerBoard, depth) : [],
    };
  }

  private runHdfPass(
    config: ProjectConfig,
    cabs: Cabinet[],
    board: BoardSpec,
    hdfBoard: BoardSpec,
    depth: number,
  ) {
    const hdfPieces = this.elements.calculateHdf(
      cabs,
      depth,
      board.thickness,
      config.drawerBottomMount,
      config.drawerBottomOverlap,
      config.backPanelMount,
      config.backPanelOverlap,
    );
    // HDF uses board.height as strip depth because HDF pieces (back panels,
    // drawer bottoms) vary widely in size — a fixed carcass depth would
    // reject tall back panels that exceed it
    const hdfLayouts =
      hdfPieces.length > 0 ? this.cutter.optimize(hdfPieces, hdfBoard, hdfBoard.height) : [];
    return { hdfPieces, hdfLayouts };
  }

  private buildCabinets(
    config: ProjectConfig,
    legHeight: number,
    carcassThickness: number,
    drawerThickness: number,
  ): Cabinet[] | null {
    const effectiveDrawerThickness =
      config.drawerMaterialIndex === config.carcassMaterialIndex
        ? carcassThickness
        : drawerThickness;

    const cabs: Cabinet[] = [];
    for (const c of config.cabinets) {
      const totalH = c.totalHeight ?? config.totalHeight;
      const bodyHeight = config.cabinetType === 'base' ? totalH - legHeight : totalH;
      if (bodyHeight < MIN_BODY_HEIGHT) return null;

      const cab: Cabinet = {
        ...c,
        bodyHeight,
        legHeight: config.cabinetType === 'base' ? legHeight : 0,
      };

      // Propagate board thickness into drawer config
      if (cab.drawers) {
        cab.drawers = { ...cab.drawers, drawerMaterialThickness: effectiveDrawerThickness };
      }

      cabs.push(cab);
    }
    return cabs;
  }

  private scoreTrial(
    legHeight: number,
    depth: number,
    layouts: BoardLayout[],
    board: BoardSpec,
  ): TrialResult {
    const boardArea = board.width * board.height;
    const totalUsed = layouts.reduce((sum, l) => sum + (l.utilization / 100) * boardArea, 0);
    const totalArea = layouts.length * boardArea;
    return {
      legHeight,
      depth,
      boardCount: layouts.length,
      utilization: totalArea > 0 ? (totalUsed / totalArea) * 100 : 0,
      wasteM2: (totalArea - totalUsed) / 1_000_000,
    };
  }
}
