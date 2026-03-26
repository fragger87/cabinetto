import { Component, input, output, computed } from '@angular/core';
import { Cabinet, BoardSpec, HDF_BOTTOM_THICKNESS } from '../../models';

// Scale chosen so a 600mm-wide cabinet renders at ~150px — fits two per row on 1024px screens
const S = 0.25; // px per mm
// Margin reserves space for external dimension arrows and labels
const MARGIN = 50;

interface DrawerRect {
  y: number;
  height: number;
  label: string;
}

@Component({
  selector: 'app-cabinet-front-view',
  standalone: true,
  templateUrl: './cabinet-front-view.html',
})
export class CabinetFrontView {
  readonly cabinet = input.required<Cabinet>();
  readonly depth = input.required<number>();
  readonly board = input.required<BoardSpec>();
  readonly railWidth = input(80);
  readonly cabinetClick = output<Cabinet>();

  protected readonly s = S;
  protected readonly margin = MARGIN;

  protected readonly layout = computed(() => {
    const cab = this.cabinet();
    const t = this.board().thickness;
    const innerW = cab.width - 2 * t;
    const bodyH = cab.bodyHeight;
    const legH = cab.legHeight;
    const rw = this.railWidth();

    // Positions in mm (origin = top-left of body)
    const outerW = cab.width;
    const totalH = bodyH + legH;

    // Drawer layout: vertical space between top and bottom rails, minus gaps
    // and HDF bottoms, divided equally among drawers
    const drawers: DrawerRect[] = [];
    if (cab.drawers && cab.drawers.count > 0) {
      const gap = cab.drawers.drawerGap;
      const hdfBottom = HDF_BOTTOM_THICKNESS;
      // Usable = body minus 2 rails, (count+1) gaps, and count HDF bottoms
      const usable = bodyH - t - t - (cab.drawers.count + 1) * gap - cab.drawers.count * hdfBottom;
      const drawerH = Math.floor(usable / cab.drawers.count);
      let y = t + gap; // start below rail + top gap
      for (let i = 0; i < cab.drawers.count; i++) {
        drawers.push({ y, height: drawerH, label: `${drawerH}` });
        y += drawerH + hdfBottom + gap; // drawer + its bottom + gap
      }
    }

    return {
      outerW,
      bodyH,
      legH,
      totalH,
      thickness: t,
      innerW,
      railWidth: rw,
      drawers,
      svgWidth: outerW * S + MARGIN * 2,
      svgHeight: totalH * S + MARGIN * 2,
    };
  });

  protected onClick(): void {
    this.cabinetClick.emit(this.cabinet());
  }
}
