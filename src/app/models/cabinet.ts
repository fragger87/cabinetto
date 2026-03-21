import { DrawerConfig } from './drawer-config';

export type CabinetType = 'base' | 'wall' | 'tall';

export interface Cabinet {
  name: string;
  width: number; // outer width, mm
  quantity: number;
  totalHeight?: number; // per-cabinet override, mm
  bodyHeight: number; // computed: totalHeight - legHeight
  legHeight: number; // computed, 0 for wall/tall
  drawers?: DrawerConfig;
}
