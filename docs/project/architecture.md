# Architecture

## System Overview

Frontend-only Angular SPA. All computation runs client-side in TypeScript. No backend server.

```
User Input (forms) → ProjectConfig → Optimization → BoardLayout[] + BomSummary → Report View
```

## Component Architecture

| Layer | Components | Responsibility |
|-------|-----------|----------------|
| **Input** | MaterialLibrary, MaterialAssignment, GlobalSettingsForm, CabinetList, DrawerConfigForm, PolymorphicField | Reactive forms → ProjectStateService |
| **State** | ProjectStateService | Signal-based state with `externalChange` for import re-sync |
| **Computation** | OptimizationOrchestratorService | Coordinates stages via `optimizeLegs()`, `optimizeDepth()`, `buildCabinets()`, `runCuttingPasses()`, `runHdfPass()` |
| **Algorithms** | CuttingOptimizerService | Guillotine bin packing with BSSF (shared by all 3 material types) |
| **Algorithms** | DepthOptimizerService | Heuristic depth + candidate generation at 5mm steps |
| **BOM** | ElementCalculatorService | Carcass parts, HDF (nailed/grooved mount), edge banding, hardware |
| **BOM** | DrawerCalculatorService | Drawer dimensions, heights (3 schemes), 15mm pieces |
| **BOM** | BomSummaryService | Aggregates via `build(config, result)` |
| **Persistence** | PersistenceService | localStorage + JSON file I/O with optional field defaults |
| **Export** | CutListExporterService | CSV, Pro100, FastCut cut-list export |
| **Report** | ReportPage, CuttingLayout, PartsList, CabinetVisualization | SVG rendering, tables, print CSS |
| **Report** | CabinetFrontView, CabinetSideView, CabinetDetailPanel | Detailed drawings + click-to-inspect |
| **UI** | ProjectToolbar, LanguageSelector, InfoButton | Toolbar actions, i18n, contextual help |
| **SVG Helpers** | SvgBoardDiagram, SvgCabinetMini, SvgCabinetProfile | Reusable SVG building blocks |
| **SVG Helpers** | SvgAssemblyCarcass, SvgAssemblyDrawer, AssemblyInstructions | Assembly visualization |

## Data Flow

| Step | Input | Output | Service |
|------|-------|--------|---------|
| 1 | User interaction | ProjectConfig | ProjectStateService |
| 2 | ProjectConfig | OptimizationResult (incl. board, hdfLayouts) | OptimizationOrchestratorService |
| 3 | ProjectConfig + OptimizationResult | BomSummary | BomSummaryService |
| 4 | Both | Report view | ReportPage component tree |

## Key Interfaces

| Interface | File | Purpose |
|-----------|------|---------|
| ProjectConfig | `models/project-config.ts` | Complete project: materials array, mount types, cabinets, params |
| HdfMountType | `models/project-config.ts` | `'nailed' \| 'grooved'` — for back panel and drawer bottom |
| Cabinet | `models/cabinet.ts` | Single cabinet with computed bodyHeight/legHeight |
| DrawerConfig | `models/drawer-config.ts` | Drawer params; `drawerMaterialThickness` propagated from board |
| CutPiece | `models/cut-piece.ts` | Rectangular part to cut (name, dimensions, material type) |
| BoardLayout | `models/board-layout.ts` | One board with placed pieces and utilization |
| BomSummary | `models/bom-summary.ts` | Aggregated BOM: pieces, edge banding, hardware |

## Shared Constants

| Constant | File | Value | Used by |
|----------|------|-------|---------|
| `DRAWER_BACK_CLEARANCE` | `models/drawer-config.ts` | 20 mm | DrawerCalculatorService, ElementCalculatorService, CabinetSideView |
| `HDF_BOTTOM_THICKNESS` | `models/drawer-config.ts` | 3 mm | DrawerCalculatorService, CabinetFrontView, CabinetSideView |

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| `drawerMaterialThickness` propagated from board | Eliminates mismatch between board spec and drawer formula |
| `drawerSameAsCarcass` merges pieces into one pass | Drawer pieces packed alongside carcass pieces for better utilization |
| HDF uses `board.height` as strip depth | HDF pieces vary in size; carcass depth would reject tall back panels |
| Orchestrator split into 5 private methods | `run()` delegates to `optimizeLegs`, `optimizeDepth`, `buildCabinets`, `runCuttingPasses`, `runHdfPass` |

## Algorithm: Guillotine Bin Packing

1. Expand pieces by quantity, sort by area descending
2. Initialize board with horizontal strips: `strips = (boardHeight + kerf) / (depth + kerf)`
3. For each piece, try both orientations, find best-fit rectangle (BSSF score = min waste)
4. Place piece, split remaining space (right + bottom), subtract kerf
5. Re-sort free rectangles: full-depth strips first, then by area
6. If piece doesn't fit, start new board; warn if piece can't fit on fresh board

## Maintenance

**Update when:** New service added, data flow changed, or algorithm modified.
**Verify:** Component table matches actual `src/app/` structure.
