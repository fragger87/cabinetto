import { Component, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { OptimizationResult } from '../../services/optimization-orchestrator.service';
import { BomSummary, Cabinet, CabinetBom } from '../../models';
import { CabinetVisualization } from '../cabinet-visualization/cabinet-visualization';
import { CabinetFrontView } from '../cabinet-front-view/cabinet-front-view';
import { CabinetSideView } from '../cabinet-side-view/cabinet-side-view';
import { CabinetDetailPanel } from '../cabinet-detail-panel/cabinet-detail-panel';
import { PartsList } from '../parts-list/parts-list';
import { CuttingLayout } from '../cutting-layout/cutting-layout';

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
  ],
  templateUrl: './report-page.html',
})
export class ReportPage {
  readonly result = input.required<OptimizationResult>();
  readonly bom = input.required<BomSummary>();

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
}
