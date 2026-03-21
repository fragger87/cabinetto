export interface PlacedPiece {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  sourceCabinet: string;
  originalWidth: number;
  originalHeight: number;
}

export interface BoardLayout {
  boardIndex: number;
  boardWidth: number;
  boardHeight: number;
  placedPieces: PlacedPiece[];
  utilization: number; // percentage 0-100
}
