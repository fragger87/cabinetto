import { Injectable, inject } from '@angular/core';
import {
  Cabinet,
  CabinetType,
  BoardSpec,
  CutPiece,
  BomSummary,
  CabinetBom,
  HdfSpec,
} from '../models';
import { ElementCalculatorService } from './element-calculator.service';
import { DrawerCalculatorService } from './drawer-calculator.service';

const DEFAULT_HDF: HdfSpec = { width: 2800, height: 2070, thickness: 3 };

@Injectable({ providedIn: 'root' })
export class BomSummaryService {
  private readonly elements = inject(ElementCalculatorService);
  private readonly drawers = inject(DrawerCalculatorService);

  build(
    cabinets: Cabinet[],
    depth: number,
    board: BoardSpec,
    bottomMode: 'full' | 'recessed',
    railWidth: number,
    cabinetType: CabinetType,
    boardCount18mm: number,
    boardCount15mm: number,
    drawerBottomMount: 'under' | 'grooved' = 'under',
    drawerBottomOverlap = 8,
  ): BomSummary {
    const allPieces18mm = this.elements.calculateCarcass(
      cabinets,
      depth,
      board,
      bottomMode,
      railWidth,
    );
    const allPieces15mm = this.drawers.calculateDrawerPieces(cabinets, depth, board.thickness);
    const allPiecesHdf = this.elements.calculateHdf(
      cabinets,
      depth,
      board.thickness,
      drawerBottomMount,
      drawerBottomOverlap,
    );
    const edgeBanding = this.elements.calculateEdgeBanding(cabinets, depth, board.thickness);
    const hardware = this.elements.calculateHardware(cabinets, cabinetType);

    const hdfTotalArea = this.sumPieceArea(allPiecesHdf);
    const hdfBoardArea = DEFAULT_HDF.width * DEFAULT_HDF.height;
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
      totalBoards18mm: boardCount18mm,
      totalBoards15mm: boardCount15mm,
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
