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

export type DrawerBottomMount = 'under' | 'grooved';

export interface ProjectConfig {
  cabinetType: CabinetType;
  board: BoardSpec;
  drawerBoard: BoardSpec;
  hdfBoard: BoardSpec;
  totalHeight: number;
  legs: PolymorphicValue;
  depth: PolymorphicValue;
  bottomMode: 'full' | 'recessed';
  railWidth: number;
  drawerBottomMount: DrawerBottomMount;
  drawerBottomOverlap: number; // mm, groove depth for 'grooved' mode (default 8)
  cabinets: Omit<Cabinet, 'bodyHeight' | 'legHeight'>[];
}

export const DEFAULT_BOARD: BoardSpec = {
  width: 2800,
  height: 2070,
  thickness: 18,
  kerf: 4,
};

export const DEFAULT_DRAWER_BOARD: BoardSpec = {
  width: 2800,
  height: 2070,
  thickness: 15,
  kerf: 4,
};

export const DEFAULT_HDF_BOARD: BoardSpec = {
  width: 2800,
  height: 2070,
  thickness: 3,
  kerf: 4,
};

export function createDefaultConfig(): ProjectConfig {
  return {
    cabinetType: 'base',
    board: { ...DEFAULT_BOARD },
    drawerBoard: { ...DEFAULT_DRAWER_BOARD },
    hdfBoard: { ...DEFAULT_HDF_BOARD },
    totalHeight: 890,
    legs: { min: 95, max: 165 },
    depth: { min: 500, max: 550 },
    bottomMode: 'full',
    railWidth: 80,
    drawerBottomMount: 'under',
    drawerBottomOverlap: 8,
    cabinets: [],
  };
}
