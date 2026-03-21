import { Component, inject, signal } from '@angular/core';
import { BoardSpecForm } from './components/board-spec-form/board-spec-form';
import { GlobalSettingsForm } from './components/global-settings-form/global-settings-form';
import { CabinetList } from './components/cabinet-list/cabinet-list';
import { ProjectToolbar } from './components/project-toolbar/project-toolbar';
import { ReportPage } from './components/report-page/report-page';
import { ProjectStateService } from './services/project-state.service';
import {
  OptimizationOrchestratorService,
  OptimizationResult,
} from './services/optimization-orchestrator.service';
import { BomSummaryService } from './services/bom-summary.service';
import { BomSummary } from './models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BoardSpecForm, GlobalSettingsForm, CabinetList, ProjectToolbar, ReportPage],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly state = inject(ProjectStateService);
  private readonly optimizer = inject(OptimizationOrchestratorService);
  private readonly bomService = inject(BomSummaryService);

  protected readonly result = signal<OptimizationResult | null>(null);
  protected readonly bom = signal<BomSummary | null>(null);
  protected readonly error = signal<string | null>(null);

  protected calculate(): void {
    const config = this.state.snapshot();

    if (config.cabinets.length === 0) {
      this.error.set('Add at least one cabinet before calculating.');
      return;
    }

    this.error.set(null);

    const optResult = this.optimizer.run(config);
    this.result.set(optResult);

    const bomResult = this.bomService.build(
      optResult.cabinets,
      optResult.depth,
      config.board,
      config.bottomMode,
      config.railWidth,
      config.cabinetType,
      optResult.carcassLayouts.length,
      optResult.drawerLayouts.length,
      config.drawerBottomMount,
      config.drawerBottomOverlap,
    );
    this.bom.set(bomResult);
  }
}
