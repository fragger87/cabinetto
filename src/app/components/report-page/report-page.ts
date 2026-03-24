import { Component, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { OptimizationResult } from '../../services/optimization-orchestrator.service';
import { BomSummary, Cabinet, CabinetBom, CutPiece } from '../../models';
import {
  CutListExporterService,
  ExportFormat,
} from '../../services/export/cut-list-exporter.service';
import { CabinetVisualization } from '../cabinet-visualization/cabinet-visualization';
import { CabinetFrontView } from '../cabinet-front-view/cabinet-front-view';
import { CabinetSideView } from '../cabinet-side-view/cabinet-side-view';
import { CabinetDetailPanel } from '../cabinet-detail-panel/cabinet-detail-panel';
import { PartsList } from '../parts-list/parts-list';
import { CuttingLayout } from '../cutting-layout/cutting-layout';
import { AssemblyInstructions } from '../assembly-instructions/assembly-instructions';
import { ProjectConfig } from '../../models';
import { TranslatePipe } from '../../i18n/translate.pipe';

@Component({
  selector: 'app-report-page',
  standalone: true,
  imports: [
    DecimalPipe,
    CabinetVisualization,
    CabinetFrontView,
    CabinetSideView,
    CabinetDetailPanel,
    PartsList,
    CuttingLayout,
    AssemblyInstructions,
    TranslatePipe,
  ],
  templateUrl: './report-page.html',
})
export class ReportPage {
  private readonly exporter = inject(CutListExporterService);

  readonly result = input.required<OptimizationResult>();
  readonly bom = input.required<BomSummary>();
  readonly config = input.required<ProjectConfig>();

  protected readonly selectedCabinet = signal<Cabinet | null>(null);
  protected readonly selectedBom = signal<CabinetBom | null>(null);

  protected onCabinetClick(cab: Cabinet): void {
    const cabBom = this.bom().cabinetBoms.find((b) => b.cabinetName === cab.name) ?? null;
    this.selectedCabinet.set(cab);
    this.selectedBom.set(cabBom);
  }

  protected closeDetail(): void {
    this.selectedCabinet.set(null);
    this.selectedBom.set(null);
  }

  protected print(): void {
    window.print();
  }

  protected exportCutList(format: ExportFormat): void {
    const bom = this.bom();
    const allPieces: CutPiece[] = [...bom.allPieces18mm, ...bom.allPieces15mm, ...bom.allPiecesHdf];
    const content = this.exporter.export(allPieces, format, this.config());
    const ext = format === 'csv' ? 'csv' : 'csv';
    const prefix = format === 'fastcut' ? 'fastcut' : format;
    this.exporter.download(content, `cutlist-${prefix}.${ext}`);
  }
}
