export type DrawerLayout = 'equal' | 'graduated' | 'custom';

export interface DrawerConfig {
  count: number;
  layout: DrawerLayout;
  slideClearance: number; // mm per side, default 13
  frontGap: number; // mm, default 30
  drawerGap: number; // mm between drawers, default 3
  drawerMaterialThickness: number; // mm, default 15
  heights?: number[]; // explicit drawer heights for 'custom' layout
}

export const DRAWER_DEFAULTS: Omit<DrawerConfig, 'count' | 'layout'> = {
  slideClearance: 13,
  frontGap: 30,
  drawerGap: 3,
  drawerMaterialThickness: 15,
};

/** Back clearance between drawer box rear and cabinet back panel (mm). */
export const DRAWER_BACK_CLEARANCE = 20;

/** HDF drawer bottom thickness (mm). Used in height calculations. */
export const HDF_BOTTOM_THICKNESS = 3;
