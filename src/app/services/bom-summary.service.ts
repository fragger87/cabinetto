import { Injectable, inject } from '@angular/core';
import {
  Cabinet,
  CutPiece,
  BomSummary,
  CabinetBom,
  ProjectConfig,
  materialToBoardSpec,
} from '../models';
import { OptimizationResult } from './optimization-orchestrator.service';
import { ElementCalculatorService } from './element-calculator.service';
import { DrawerCalculatorService } from './drawer-calculator.service';

@Injectable({ providedIn: 'root' })
export class BomSummaryService {
  private readonly elements = inject(ElementCalculatorService);
  private readonly drawers = inject(DrawerCalculatorService);

  build(config: ProjectConfig, result: OptimizationResult): BomSummary {
    const board = result.board;
    const { railWidth, cabinetType } = config;
    const { cabinets, depth } = result;

    const allPieces18mm = this.elements.calculateCarcass(cabinets, depth, board, railWidth);
    const drawerMat = config.materials[config.drawerMaterialIndex];
    const drawerMatType = drawerMat ? `${drawerMat.thickness}mm` : '15mm';
    const allPieces15mm = this.drawers.calculateDrawerPieces(
      cabinets,
      depth,
      board.thickness,
      drawerMatType,
    );
    const allPiecesHdf = this.elements.calculateHdf(
      cabinets,
      depth,
      board.thickness,
      config.drawerBottomMount,
      config.drawerBottomOverlap,
      config.backPanelMount,
      config.backPanelOverlap,
    );
    const edgeBanding = this.elements.calculateEdgeBanding(cabinets, depth, board.thickness);
    const hardware = this.elements.calculateHardware(cabinets, cabinetType);

    const hdfMat = config.materials[config.hdfMaterialIndex];
    const hdfBoard = materialToBoardSpec(hdfMat, config.kerf);
    const hdfTotalArea = this.sumPieceArea(allPiecesHdf);
    const hdfBoardArea = hdfBoard.width * hdfBoard.height;
    const hdfBoardCount = hdfBoardArea > 0 ? Math.ceil(hdfTotalArea / hdfBoardArea) : 0;

    const cabinetBoms = this.buildPerCabinet(
      cabinets,
      allPieces18mm,
      allPieces15mm,
      allPiecesHdf,
      edgeBanding.entries,
    );

    return {
      cabinetBoms,
      allPieces18mm,
      allPieces15mm,
      allPiecesHdf,
      edgeBanding,
      hardware,
      totalBoards18mm: result.carcassLayouts.length,
      totalBoards15mm: result.drawerLayouts.length,
      hdfBoardCount,
    };
  }

  private buildPerCabinet(
    cabinets: Cabinet[],
    pieces18: CutPiece[],
    pieces15: CutPiece[],
    piecesHdf: CutPiece[],
    edgeEntries: { cabinetName: string; lengthMm: number }[],
  ): CabinetBom[] {
    return cabinets.map((cab) => ({
      cabinetName: cab.name,
      pieces18mm: pieces18.filter((p) => p.sourceCabinet === cab.name),
      pieces15mm: pieces15.filter((p) => p.sourceCabinet === cab.name),
      piecesHdf: piecesHdf.filter((p) => p.sourceCabinet === cab.name),
      edgeBandingMm: edgeEntries.find((e) => e.cabinetName === cab.name)?.lengthMm ?? 0,
    }));
  }

  private sumPieceArea(pieces: CutPiece[]): number {
    return pieces.reduce((sum, p) => sum + p.width * p.height * p.quantity, 0);
  }
}
