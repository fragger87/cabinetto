import { Component, input, computed } from '@angular/core';
import { Cabinet, BoardSpec, DRAWER_BACK_CLEARANCE, HDF_BOTTOM_THICKNESS } from '../../models';

const S = 0.25;
const MARGIN = 50;

@Component({
  selector: 'app-cabinet-side-view',
  standalone: true,
  templateUrl: './cabinet-side-view.html',
})
export class CabinetSideView {
  readonly cabinet = input.required<Cabinet>();
  readonly depth = input.required<number>();
  readonly board = input.required<BoardSpec>();
  readonly railWidth = input(80);

  protected readonly s = S;
  protected readonly margin = MARGIN;

  protected readonly layout = computed(() => {
    const cab = this.cabinet();
    const t = this.board().thickness;
    const d = this.depth();
    const bodyH = cab.bodyHeight;
    const legH = cab.legHeight;
    const rw = this.railWidth();
    const bottomDepth = d;
    const hdfThickness = HDF_BOTTOM_THICKNESS;

    const hasDrawers = !!(cab.drawers && cab.drawers.count > 0);
    const frontGap = hasDrawers ? cab.drawers!.frontGap : 0;
    const slideClearance = hasDrawers ? cab.drawers!.slideClearance : 0;
    const backClearance = DRAWER_BACK_CLEARANCE;
    const drawerDepth = hasDrawers ? d - frontGap - backClearance : 0;

    return {
      depth: d,
      bodyH,
      legH,
      totalH: bodyH + legH,
      thickness: t,
      railWidth: rw,
      bottomDepth,
      hdfThickness,
      hasDrawers,
      frontGap,
      slideClearance,
      drawerDepth,
      svgWidth: d * S + MARGIN * 2,
      svgHeight: (bodyH + legH) * S + MARGIN * 2,
    };
  });
}
