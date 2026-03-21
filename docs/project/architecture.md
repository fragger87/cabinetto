# Architecture

## System Overview

Frontend-only Angular SPA. All computation runs client-side in TypeScript. No backend server.

```
User Input (forms) → ProjectConfig → Optimization → BoardLayout[] + BomSummary → Report View
```

## Component Architecture

| Layer | Components | Responsibility |
|-------|-----------|----------------|
| **Input** | BoardSpecForm, GlobalSettingsForm, CabinetList, DrawerConfigForm, PolymorphicField | Reactive forms → ProjectStateService |
| **State** | ProjectStateService | Signal-based project state (single source of truth) |
| **Computation** | OptimizationOrchestratorService | Coordinates leg/depth sweeps + bin packing |
| **Algorithms** | CuttingOptimizerService | Guillotine bin packing with BSSF |
| **Algorithms** | LegOptimizerService, DepthOptimizerService | Parametric sweep at 5mm steps |
| **BOM** | ElementCalculatorService, DrawerCalculatorService, BomSummaryService | Parts lists, edge banding, hardware |
| **Persistence** | PersistenceService | localStorage + JSON file I/O |
| **Report** | ReportPage, CuttingLayout, PartsList, CabinetVisualization | SVG rendering, tables, print CSS |

## Data Flow

| Step | Input | Output | Service |
|------|-------|--------|---------|
| 1 | User interaction | ProjectConfig | ProjectStateService |
| 2 | ProjectConfig | OptimizationResult | OptimizationOrchestratorService |
| 3 | OptimizationResult | BomSummary | BomSummaryService |
| 4 | Both | Report view | ReportPage component |

## Key Interfaces

| Interface | File | Purpose |
|-----------|------|---------|
| ProjectConfig | `models/project-config.ts` | Complete project definition (board, cabinets, params) |
| Cabinet | `models/cabinet.ts` | Single cabinet with computed bodyHeight/legHeight |
| DrawerConfig | `models/drawer-config.ts` | Drawer parameters per cabinet |
| CutPiece | `models/cut-piece.ts` | Rectangular part to cut (name, dimensions, material type) |
| BoardLayout | `models/board-layout.ts` | One board with placed pieces and utilization |
| BomSummary | `models/bom-summary.ts` | Aggregated BOM: pieces, edge banding, hardware |

## Algorithm: Guillotine Bin Packing

1. Expand pieces by quantity, sort by area descending
2. Initialize board with horizontal strips: `strips = (boardHeight + kerf) / (depth + kerf)`
3. For each piece, try both orientations, find best-fit rectangle (BSSF score = min waste)
4. Place piece, split remaining space (right + bottom), subtract kerf
5. Re-sort free rectangles: full-depth strips first, then by area
6. If piece doesn't fit, start new board

## Maintenance

**Update when:** New service added, data flow changed, or algorithm modified.
**Verify:** Component table matches actual `src/app/` structure.
