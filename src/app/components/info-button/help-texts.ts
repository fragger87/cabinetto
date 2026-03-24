export interface HelpText {
  title: string;
  description: string;
}

export const HELP_TEXTS: Record<string, HelpText> = {
  boardWidth: {
    title: 'Board Width',
    description:
      'The length of the sheet material in mm. Standard particleboard sheets are 2800mm. This is the longer dimension of the board as it comes from the supplier.',
  },
  boardHeight: {
    title: 'Board Height',
    description:
      'The shorter dimension of the sheet material in mm. Standard sheets are 2070mm. The optimizer divides this into horizontal strips based on cabinet depth.',
  },
  thickness: {
    title: 'Board Thickness',
    description:
      'Material thickness in mm. Standard carcass particleboard is 18mm. This affects inner cabinet width (outer width minus 2\u00d7 thickness) and is used in all dimensional calculations.',
  },
  kerf: {
    title: 'Saw Kerf',
    description:
      'Width of material lost to each saw cut in mm. Typical panel saw kerf is 3-5mm. The optimizer subtracts this at every cut boundary when splitting free rectangles.',
  },
  cabinetType: {
    title: 'Cabinet Type',
    description:
      '<strong>Base</strong>: Floor cabinets with adjustable legs. Leg height is shared across all cabinets.<br><strong>Wall</strong>: Wall-mounted, no legs (future feature).<br><strong>Tall</strong>: Floor-to-ceiling, may have legs (future feature).',
  },
  totalHeight: {
    title: 'Total Height',
    description:
      'Default total cabinet height including legs (for base cabinets). Individual cabinets can override this. Body height = total height minus leg height.',
  },
  railWidth: {
    title: 'Top Rail Width',
    description:
      'Width of the top rails (cross-members) in mm. Default 80mm. Two rails connect the side panels at the top \u2014 one at the front edge, one at the back. They provide structural rigidity and a mounting surface for the countertop.',
  },
  backPanelMount: {
    title: 'Back Panel Mount',
    description:
      '<strong>Nailed</strong>: HDF back panel sits behind the cabinet and is secured with panel pins/staples along all edges. Simpler, faster assembly.<br><strong>Grooved</strong>: HDF panel slides into grooves routed in the side panels and rails. Stronger, cleaner look, but requires routing before assembly. Groove depth (overlap) is configurable.',
  },
  drawerBottomMount: {
    title: 'Drawer Bottom Mount',
    description:
      '<strong>Nailed</strong>: HDF bottom panel sits underneath the drawer box and is pinned/stapled from below. Drawer box dimensions = outer dimensions of the HDF.<br><strong>Grooved</strong>: HDF bottom slides into grooves routed in all four drawer box sides. The HDF is smaller (inner dimensions + 2\u00d7 groove overlap). Requires routing before assembly.',
  },
  legs: {
    title: 'Leg Height',
    description:
      '<strong>Fixed value</strong>: All cabinets use this exact leg height. No optimization.<br><strong>Range (min/max)</strong>: The optimizer sweeps all values at 5mm steps, running a full cutting simulation for each. The leg height producing the fewest boards (with highest utilization as tiebreaker) wins.<br><br>All cabinets share the same leg height \u2014 adjustable legs are pre-set to one height during installation.',
  },
  depth: {
    title: 'Cabinet Depth',
    description:
      '<strong>Fixed value</strong>: All cabinets use this exact depth. No optimization.<br><strong>Range (min/max)</strong>: The optimizer sweeps all values at 5mm steps after determining the best leg height. The depth producing the fewest boards wins.<br><br>Depth affects: side panel height dimension, bottom panel depth, drawer depth, and how many horizontal strips fit on each board.',
  },
  cabinetName: {
    title: 'Cabinet Name',
    description:
      'A label to identify this cabinet in the report and cutting lists. Use descriptive names like "Sink 80cm" or "Corner drawer unit". The name appears on cutting layout tooltips and in CSV exports.',
  },
  cabinetWidth: {
    title: 'Cabinet Width',
    description:
      'Outer width of the cabinet in mm. The inner width (available space between sides) = outer width minus 2\u00d7 board thickness. Minimum practical width is about 200mm.',
  },
  cabinetQuantity: {
    title: 'Quantity',
    description:
      'Number of identical cabinets to produce. All pieces are multiplied by this number in the BOM and cutting optimization.',
  },
  cabinetHeightOverride: {
    title: 'Height Override',
    description:
      'Optional per-cabinet total height. If set, this cabinet uses a different total height than the global default. Useful for under-window cabinets or varied counter heights. Leave empty to use the global total height.',
  },
  drawerCount: {
    title: 'Drawer Count',
    description:
      'Number of drawers in this cabinet (1-10). Each drawer gets its own slide pair and box pieces. The available height is divided among drawers based on the selected layout scheme.',
  },
  drawerLayout: {
    title: 'Drawer Layout',
    description:
      '<strong>Equal</strong>: All drawers have the same height.<br><strong>Graduated</strong>: Top drawers are shorter, bottom drawers are taller. Ratio 1 : 1.5 : 2 for 3 drawers.<br><strong>Custom</strong>: You specify the exact height for each drawer in mm.',
  },
  slideClearance: {
    title: 'Slide Clearance',
    description:
      'Gap between the drawer box side and the cabinet side panel, per side, in mm. This space is occupied by the drawer slide mechanism. Standard ball-bearing slides need 13mm per side.',
  },
  frontGap: {
    title: 'Front Gap',
    description:
      'Distance from the front edge of the cabinet to the front of the drawer box in mm. Default 30mm. This accounts for the drawer front overlay panel that covers the cabinet opening.',
  },
  drawerGap: {
    title: 'Drawer Gap',
    description:
      'Vertical clearance between stacked drawers in mm. Default 3mm. Applied N+1 times: above the top drawer, between each pair, and below the bottom drawer.',
  },
};
