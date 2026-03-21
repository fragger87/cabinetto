export type MaterialType = '18mm' | '15mm' | 'hdf_3mm';

export interface CutPiece {
  name: string;
  width: number;
  height: number;
  materialType: MaterialType;
  sourceCabinet: string;
  quantity: number;
}
