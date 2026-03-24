import { Injectable, signal, computed } from '@angular/core';
import { ProjectConfig, createDefaultConfig } from '../models';

@Injectable({ providedIn: 'root' })
export class ProjectStateService {
  private readonly _config = signal<ProjectConfig>(createDefaultConfig());

  /** Increments on replace() only — forms watch this to re-sync after import/load. */
  readonly externalChange = signal(0);

  readonly config = this._config.asReadonly();
  readonly cabinets = computed(() => this._config().cabinets);
  readonly materials = computed(() => this._config().materials);

  update(partial: Partial<ProjectConfig>): void {
    this._config.update((prev) => ({ ...prev, ...partial }));
  }

  replace(config: ProjectConfig): void {
    this._config.set(config);
    this.externalChange.update((v) => v + 1);
  }

  snapshot(): ProjectConfig {
    return structuredClone(this._config());
  }
}
