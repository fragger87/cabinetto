export interface CutPiece {
  name: string;
  width: number;
  height: number;
  materialType: string; // e.g. "18mm", "15mm", "hdf_3mm" — derived from material thickness
  sourceCabinet: string;
  quantity: number;
}
