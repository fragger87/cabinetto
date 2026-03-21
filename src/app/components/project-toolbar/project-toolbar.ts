import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { PersistenceService } from '../../persistence/persistence.service';
import { ProjectStateService } from '../../services/project-state.service';

@Component({
  selector: 'app-project-toolbar',
  standalone: true,
  templateUrl: './project-toolbar.html',
})
export class ProjectToolbar {
  private readonly persistence = inject(PersistenceService);
  private readonly state = inject(ProjectStateService);
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);

  protected save(): void {
    this.persistence.save(this.state.snapshot());
    this.flash('Saved to browser storage');
  }

  protected load(): void {
    const config = this.persistence.load();
    if (config) {
      this.state.replace(config);
      this.flash('Loaded from browser storage');
    } else {
      this.showError('No saved project found');
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
      this.flash('Imported successfully');
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
