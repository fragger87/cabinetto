import { Component, inject, signal } from '@angular/core';
import { MaterialLibrary } from './components/material-library/material-library';
import { MaterialAssignment } from './components/material-assignment/material-assignment';
import { GlobalSettingsForm } from './components/global-settings-form/global-settings-form';
import { CabinetList } from './components/cabinet-list/cabinet-list';
import { ProjectToolbar } from './components/project-toolbar/project-toolbar';
import { LanguageSelector } from './components/language-selector/language-selector';
import { ReportPage } from './components/report-page/report-page';
import { ProjectStateService } from './services/project-state.service';
import {
  OptimizationOrchestratorService,
  OptimizationResult,
} from './services/optimization-orchestrator.service';
import { BomSummaryService } from './services/bom-summary.service';
import { BomSummary, ProjectConfig } from './models';
import { TranslatePipe } from './i18n/translate.pipe';
import { I18nService } from './i18n/i18n.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MaterialLibrary,
    MaterialAssignment,
    GlobalSettingsForm,
    CabinetList,
    ProjectToolbar,
    ReportPage,
    LanguageSelector,
    TranslatePipe,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly state = inject(ProjectStateService);
  private readonly optimizer = inject(OptimizationOrchestratorService);
  private readonly bomService = inject(BomSummaryService);
  private readonly i18n = inject(I18nService);

  protected readonly result = signal<OptimizationResult | null>(null);
  protected readonly bom = signal<BomSummary | null>(null);
  protected readonly lastConfig = signal<ProjectConfig | null>(null);
  protected readonly error = signal<string | null>(null);

  protected calculate(): void {
    const config = this.state.snapshot();

    if (config.cabinets.length === 0) {
      this.error.set(this.i18n.t('app.noCabinets'));
      return;
    }

    this.error.set(null);

    const optResult = this.optimizer.run(config);
    this.result.set(optResult);
    this.lastConfig.set(config);

    const bomResult = this.bomService.build(config, optResult);
    this.bom.set(bomResult);
  }
}
