import { Injectable } from '@angular/core';
import { ProjectConfig, DEFAULT_DRAWER_BOARD, DEFAULT_HDF_BOARD } from '../models';

@Injectable({ providedIn: 'root' })
export class PersistenceService {
  private readonly storageKey = 'cabinet-calculator-project';

  save(config: ProjectConfig): void {
    localStorage.setItem(this.storageKey, JSON.stringify(config));
  }

  load(): ProjectConfig | null {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? this.parseAndValidate(raw) : null;
  }

  exportJson(config: ProjectConfig, filename = 'cabinet-project.json'): void {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    downloadBlob(blob, filename);
  }

  async importJson(file: File): Promise<ProjectConfig> {
    const text = await file.text();
    const config = this.parseAndValidate(text);
    if (!config) throw new Error('Invalid project file: missing required fields');
    return config;
  }

  private parseAndValidate(raw: string): ProjectConfig | null {
    try {
      const obj = JSON.parse(raw) as Record<string, unknown>;
      const valid =
        typeof obj['cabinetType'] === 'string' &&
        typeof obj['board'] === 'object' &&
        typeof obj['totalHeight'] === 'number' &&
        'legs' in obj &&
        'depth' in obj &&
        Array.isArray(obj['cabinets']);
      if (!valid) return null;

      // Fill defaults for optional board specs
      if (!obj['drawerBoard']) obj['drawerBoard'] = { ...DEFAULT_DRAWER_BOARD };
      if (!obj['hdfBoard']) obj['hdfBoard'] = { ...DEFAULT_HDF_BOARD };
      if (!obj['drawerBottomMount']) obj['drawerBottomMount'] = 'under';
      if (!obj['drawerBottomOverlap']) obj['drawerBottomOverlap'] = 8;

      return obj as unknown as ProjectConfig;
    } catch {
      return null;
    }
  }
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
