import { Injectable, inject } from '@angular/core';
import { BoardSpec, Cabinet, CutPiece, BoardLayout, ProjectConfig, isRange } from '../models';
import { CuttingOptimizerService } from './cutting-optimizer.service';
import { ElementCalculatorService } from './element-calculator.service';
import { DepthOptimizerService } from './depth-optimizer.service';
import { DrawerCalculatorService } from './drawer-calculator.service';

const STEP = 5;
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
  legTrials: TrialResult[];
  depthTrials: TrialResult[];
}

@Injectable({ providedIn: 'root' })
export class OptimizationOrchestratorService {
  private readonly cutter = inject(CuttingOptimizerService);
  private readonly elements = inject(ElementCalculatorService);
  private readonly depthOpt = inject(DepthOptimizerService);
  private readonly drawerCalc = inject(DrawerCalculatorService);

  run(config: ProjectConfig): OptimizationResult {
    const board = config.board;

    // Resolve fixed vs range for legs and depth
    const legsFixed = !isRange(config.legs);
    const depthFixed = !isRange(config.depth);

    const legMin = isRange(config.legs) ? config.legs.min : (config.legs as number);
    const legMax = isRange(config.legs) ? config.legs.max : (config.legs as number);
    const depthMin = isRange(config.depth) ? config.depth.min : (config.depth as number);
    const depthMax = isRange(config.depth) ? config.depth.max : (config.depth as number);

    // If depth is a range, compute heuristic seed for Stage 1
    const seedDepth = depthFixed
      ? depthMin
      : this.depthOpt.heuristicDepth(depthMin, depthMax, board.height, board.kerf);

    // Stage 1: Leg height optimization
    const legTrials: TrialResult[] = [];
    let bestLeg = legMin;

    if (!legsFixed) {
      let bestBoards = Infinity;
      let bestUtil = 0;

      for (let leg = legMin; leg <= legMax; leg += STEP) {
        const cabs = this.buildCabinets(config, leg);
        if (!cabs) continue;

        const pieces = this.elements.calculateCarcass(
          cabs,
          seedDepth,
          board,
          config.bottomMode,
          config.railWidth,
        );
        const layouts = this.cutter.optimize(pieces, board, seedDepth);
        const trial = this.scoreTrial(leg, seedDepth, layouts, board);
        legTrials.push(trial);

        if (
          trial.boardCount < bestBoards ||
          (trial.boardCount === bestBoards && trial.utilization > bestUtil)
        ) {
          bestBoards = trial.boardCount;
          bestUtil = trial.utilization;
          bestLeg = leg;
        }
      }
    }

    // Stage 2: Depth optimization
    const depthTrials: TrialResult[] = [];
    let bestDepth = seedDepth;

    if (!depthFixed) {
      let bestBoards = Infinity;
      let bestUtil = 0;

      for (let d = depthMin; d <= depthMax; d += STEP) {
        const cabs = this.buildCabinets(config, bestLeg);
        if (!cabs) continue;

        const pieces = this.elements.calculateCarcass(
          cabs,
          d,
          board,
          config.bottomMode,
          config.railWidth,
        );
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
    } else {
      bestDepth = depthMin;
    }

    // Final run with winning parameters
    const finalCabs = this.buildCabinets(config, bestLeg)!;
    const finalPieces = this.elements.calculateCarcass(
      finalCabs,
      bestDepth,
      board,
      config.bottomMode,
      config.railWidth,
    );
    const finalLayouts = this.cutter.optimize(finalPieces, board, bestDepth);

    // 15mm drawer pass (uses dedicated drawer board spec)
    const drawerPieces = this.drawerCalc.calculateDrawerPieces(
      finalCabs,
      bestDepth,
      board.thickness,
    );
    const drawerBoard = config.drawerBoard;
    const drawerLayouts =
      drawerPieces.length > 0 ? this.cutter.optimize(drawerPieces, drawerBoard, bestDepth) : [];

    // HDF layout (optimized with same guillotine bin packing)
    const hdfPieces = this.elements.calculateHdf(
      finalCabs,
      bestDepth,
      board.thickness,
      config.drawerBottomMount,
      config.drawerBottomOverlap,
    );
    const hdfBoard = config.hdfBoard;
    // Use full board height as strip depth — HDF pieces vary widely in size
    const hdfLayouts =
      hdfPieces.length > 0 ? this.cutter.optimize(hdfPieces, hdfBoard, hdfBoard.height) : [];

    return {
      legHeight: bestLeg,
      depth: bestDepth,
      cabinets: finalCabs,
      carcassLayouts: finalLayouts,
      carcassPieces: finalPieces,
      drawerLayouts,
      drawerPieces,
      hdfLayouts,
      hdfPieces,
      legTrials,
      depthTrials,
    };
  }

  private buildCabinets(config: ProjectConfig, legHeight: number): Cabinet[] | null {
    const cabs: Cabinet[] = [];
    for (const c of config.cabinets) {
      const totalH = c.totalHeight ?? config.totalHeight;
      const bodyHeight = config.cabinetType === 'base' ? totalH - legHeight : totalH;
      if (bodyHeight < MIN_BODY_HEIGHT) return null;

      cabs.push({
        ...c,
        bodyHeight,
        legHeight: config.cabinetType === 'base' ? legHeight : 0,
      });
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
