import { Component, input } from '@angular/core';
import { Cabinet } from '../../models';

const VIZ_SCALE = 0.15; // px per mm for cabinet blocks

@Component({
  selector: 'app-cabinet-visualization',
  standalone: true,
  templateUrl: './cabinet-visualization.html',
})
export class CabinetVisualization {
  readonly cabinets = input.required<Cabinet[]>();
  readonly depth = input.required<number>();

  protected readonly scale = VIZ_SCALE;

  protected blockWidth(cab: Cabinet): number {
    return cab.width * VIZ_SCALE;
  }

  protected blockHeight(cab: Cabinet): number {
    return (cab.bodyHeight + cab.legHeight) * VIZ_SCALE;
  }

  protected bodyHeight(cab: Cabinet): number {
    return cab.bodyHeight * VIZ_SCALE;
  }

  protected legHeight(cab: Cabinet): number {
    return cab.legHeight * VIZ_SCALE;
  }

  protected drawerLines(cab: Cabinet): number[] {
    if (!cab.drawers || cab.drawers.count <= 1) return [];
    const lines: number[] = [];
    const step = cab.bodyHeight / cab.drawers.count;
    for (let i = 1; i < cab.drawers.count; i++) {
      lines.push(i * step * VIZ_SCALE);
    }
    return lines;
  }
}
