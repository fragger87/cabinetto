export interface BoardSpec {
  width: number; // mm, e.g. 2800
  height: number; // mm, e.g. 2070
  thickness: number; // mm, e.g. 18
  kerf: number; // mm, saw blade kerf, e.g. 4
}

export interface HdfSpec {
  width: number;
  height: number;
  thickness: number; // typically 3mm
}
