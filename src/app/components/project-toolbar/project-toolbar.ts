import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { PersistenceService } from '../../persistence/persistence.service';
import { ProjectStateService } from '../../services/project-state.service';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { I18nService } from '../../i18n/i18n.service';

@Component({
  selector: 'app-project-toolbar',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './project-toolbar.html',
})
export class ProjectToolbar {
  private readonly persistence = inject(PersistenceService);
  private readonly state = inject(ProjectStateService);
  private readonly i18n = inject(I18nService);
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);

  protected save(): void {
    this.persistence.save(this.state.snapshot());
    this.flash(this.i18n.t('toolbar.saved'));
  }

  protected load(): void {
    const config = this.persistence.load();
    if (config) {
      this.state.replace(config);
      this.flash(this.i18n.t('toolbar.loaded'));
    } else {
      this.showError(this.i18n.t('toolbar.noSaved'));
    }
  }

  protected exportJson(): void {
    this.persistence.exportJson(this.state.snapshot());
  }

  protected triggerImport(): void {
    this.fileInput()?.nativeElement.click();
  }

  protected async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const config = await this.persistence.importJson(file);
      this.state.replace(config);
      this.flash(this.i18n.t('toolbar.importSuccess'));
    } catch (e) {
      this.showError(e instanceof Error ? e.message : 'Import failed');
    }
    input.value = '';
  }

  private flash(msg: string): void {
    this.error.set(null);
    this.success.set(msg);
    setTimeout(() => this.success.set(null), 3000);
  }

  private showError(msg: string): void {
    this.success.set(null);
    this.error.set(msg);
    setTimeout(() => this.error.set(null), 5000);
  }
}
