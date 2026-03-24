import { BoardSpec } from './board-spec';
import { Cabinet, CabinetType } from './cabinet';

export interface RangeValue {
  min: number;
  max: number;
}

export type PolymorphicValue = number | RangeValue;

export function isRange(value: PolymorphicValue): value is RangeValue {
  return typeof value === 'object' && 'min' in value && 'max' in value;
}

export type HdfMountType = 'nailed' | 'grooved';

export interface Material {
  name: string;
  width: number; // mm
  height: number; // mm
  thickness: number; // mm
  edgeBanding: string; // banding symbol/name for exports (e.g. "PCV_1", "ABS 0.5mm White")
}

export interface ProjectConfig {
  cabinetType: CabinetType;
  materials: Material[];
  kerf: number; // global saw kerf, mm
  carcassMaterialIndex: number;
  drawerMaterialIndex: number;
  hdfMaterialIndex: number;
  totalHeight: number;
  legs: PolymorphicValue;
  depth: PolymorphicValue;
  railWidth: number;
  drawerBottomMount: HdfMountType;
  drawerBottomOverlap: number;
  backPanelMount: HdfMountType;
  backPanelOverlap: number;
  cabinets: Omit<Cabinet, 'bodyHeight' | 'legHeight'>[];
}

export const DEFAULT_MATERIALS: Material[] = [
  { name: 'Particleboard 18mm', width: 2800, height: 2070, thickness: 18, edgeBanding: 'PCV_1' },
  { name: 'Particleboard 15mm', width: 2800, height: 2070, thickness: 15, edgeBanding: 'PCV_2' },
  { name: 'HDF 3mm', width: 2800, height: 2070, thickness: 3, edgeBanding: '' },
];

export function materialToBoardSpec(material: Material, kerf: number): BoardSpec {
  return { width: material.width, height: material.height, thickness: material.thickness, kerf };
}

export function createDefaultConfig(): ProjectConfig {
  return {
    cabinetType: 'base',
    materials: DEFAULT_MATERIALS.map((m) => ({ ...m })),
    kerf: 4,
    carcassMaterialIndex: 0,
    drawerMaterialIndex: 1,
    hdfMaterialIndex: 2,
    totalHeight: 890,
    legs: { min: 95, max: 165 },
    depth: { min: 500, max: 550 },
    railWidth: 80,
    drawerBottomMount: 'nailed',
    drawerBottomOverlap: 8,
    backPanelMount: 'nailed',
    backPanelOverlap: 8,
    cabinets: [],
  };
}
