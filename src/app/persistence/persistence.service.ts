import { Injectable } from '@angular/core';
import { ProjectConfig } from '../models';

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

      // Migration: convert old format (board/drawerBoard/hdfBoard) to new materials format
      if (!obj['materials'] && typeof obj['board'] === 'object') {
        const board = obj['board'] as Record<string, number>;
        const drawerBoard = (obj['drawerBoard'] as Record<string, number>) ?? {
          width: 2800,
          height: 2070,
          thickness: 15,
        };
        const hdfBoard = (obj['hdfBoard'] as Record<string, number>) ?? {
          width: 2800,
          height: 2070,
          thickness: 3,
        };
        obj['materials'] = [
          {
            name: `Particleboard ${board['thickness']}mm`,
            width: board['width'],
            height: board['height'],
            thickness: board['thickness'],
          },
          {
            name: `Particleboard ${drawerBoard['thickness']}mm`,
            width: drawerBoard['width'],
            height: drawerBoard['height'],
            thickness: drawerBoard['thickness'],
          },
          {
            name: `HDF ${hdfBoard['thickness']}mm`,
            width: hdfBoard['width'],
            height: hdfBoard['height'],
            thickness: hdfBoard['thickness'],
          },
        ];
        obj['kerf'] = board['kerf'] ?? 4;
        obj['carcassMaterialIndex'] = 0;
        obj['drawerMaterialIndex'] = 1;
        obj['hdfMaterialIndex'] = 2;
        // Clean up old fields
        delete obj['board'];
        delete obj['drawerBoard'];
        delete obj['hdfBoard'];
      }

      const valid =
        typeof obj['cabinetType'] === 'string' &&
        Array.isArray(obj['materials']) &&
        typeof obj['totalHeight'] === 'number' &&
        'legs' in obj &&
        'depth' in obj &&
        Array.isArray(obj['cabinets']);
      if (!valid) return null;

      // Fill defaults for optional fields
      if (obj['kerf'] === undefined) obj['kerf'] = 4;
      if (obj['carcassMaterialIndex'] === undefined) obj['carcassMaterialIndex'] = 0;
      if (obj['drawerMaterialIndex'] === undefined) obj['drawerMaterialIndex'] = 1;
      if (obj['hdfMaterialIndex'] === undefined) obj['hdfMaterialIndex'] = 2;
      if (!obj['drawerBottomMount']) obj['drawerBottomMount'] = 'nailed';
      if (!obj['drawerBottomOverlap']) obj['drawerBottomOverlap'] = 8;
      if (!obj['backPanelMount']) obj['backPanelMount'] = 'nailed';
      if (!obj['backPanelOverlap']) obj['backPanelOverlap'] = 8;
      // Remove legacy field if present
      delete obj['drawerSameAsCarcass'];

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
