import { CutPiece } from './cut-piece';

export interface EdgeBandingEntry {
  cabinetName: string;
  lengthMm: number;
}

export interface EdgeBandingResult {
  entries: EdgeBandingEntry[];
  totalMm: number;
  totalMeters: number;
}

export interface HardwareResult {
  legSets: number;
  slidePairs: number;
}

export interface CabinetBom {
  cabinetName: string;
  pieces18mm: CutPiece[];
  pieces15mm: CutPiece[];
  piecesHdf: CutPiece[];
  edgeBandingMm: number;
}

export interface BomSummary {
  cabinetBoms: CabinetBom[];
  allPieces18mm: CutPiece[];
  allPieces15mm: CutPiece[];
  allPiecesHdf: CutPiece[];
  edgeBanding: EdgeBandingResult;
  hardware: HardwareResult;
  totalBoards18mm: number;
  totalBoards15mm: number;
  hdfBoardCount: number;
}
