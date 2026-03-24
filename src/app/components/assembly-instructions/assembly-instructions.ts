import { Component, input, computed } from '@angular/core';
import { HdfMountType } from '../../models';
import { SvgAssemblyCarcass } from '../svg-assembly-carcass/svg-assembly-carcass';
import { SvgAssemblyDrawer } from '../svg-assembly-drawer/svg-assembly-drawer';
import { TranslatePipe } from '../../i18n/translate.pipe';

@Component({
  selector: 'app-assembly-instructions',
  standalone: true,
  imports: [SvgAssemblyCarcass, SvgAssemblyDrawer, TranslatePipe],
  templateUrl: './assembly-instructions.html',
})
export class AssemblyInstructions {
  readonly backPanelMount = input.required<HdfMountType>();
  readonly drawerBottomMount = input.required<HdfMountType>();
  readonly hasDrawers = input(false);
  readonly thickness = input(18);
  readonly drawerThickness = input(15);

  protected readonly carcassSteps = computed(() => {
    const t = this.thickness();
    const backMount = this.backPanelMount();

    const steps: string[] = [];

    if (backMount === 'grooved') {
      steps.push(
        `Route grooves for back panel in both side panels and both rails (groove depth per project settings, ${t}mm from rear edge).`,
      );
    }

    steps.push(
      `Drill confirmat screw holes: 2 per joint. Side panels receive holes on top edge (for rails) and bottom edge (for bottom panel). Use 5mm drill for side panels, 8mm for end-grain.`,
    );

    steps.push(
      `Attach bottom panel to one side panel using 2 confirmat screws. Bottom is flush with front edge (full depth).`,
    );

    steps.push(
      `Attach both top rails (front and back) to the same side panel using confirmat screws.`,
    );

    steps.push(
      `Place the second side panel on top and secure with confirmat screws into bottom panel and both rails.`,
    );

    if (backMount === 'nailed') {
      steps.push(
        `Slide back panel (HDF) into position behind the carcass. Secure with panel pins or staples every 150-200mm along all four edges.`,
      );
    } else {
      steps.push(
        `Slide HDF back panel into grooves from one side before attaching the second side panel. Ensure panel sits fully in all grooves.`,
      );
    }

    steps.push(`Check squareness by measuring diagonals — both should be equal (±1mm tolerance).`);

    steps.push(
      `Attach adjustable legs: 4 per cabinet, positioned 50mm from each corner. Screw into bottom panel.`,
    );

    return steps;
  });

  protected readonly drawerSteps = computed(() => {
    const bottomMount = this.drawerBottomMount();
    const dt = this.drawerThickness();

    const steps: string[] = [];

    if (bottomMount === 'grooved') {
      steps.push(
        `Route grooves for HDF bottom in all four drawer box pieces: front, back, and both sides (groove depth per project settings, ${dt}mm from bottom edge).`,
      );
    }

    steps.push(
      `Drill holes for assembly: front and back panels attach to side panels with confirmat screws (2 per joint) or wood screws + glue.`,
    );

    steps.push(
      `Assemble drawer box: attach front panel to one side, then back panel to the same side.`,
    );

    steps.push(`Attach the second side panel to complete the box.`);

    if (bottomMount === 'nailed') {
      steps.push(
        `Place HDF bottom panel underneath the drawer box. Secure with panel pins or staples along all edges.`,
      );
    } else {
      steps.push(`Slide HDF bottom panel into grooves before attaching the last side panel.`);
    }

    steps.push(`Check squareness — diagonals must be equal.`);

    steps.push(
      `Mount drawer slides on cabinet side panels at the correct height for each drawer position. Use the slide clearance value from your project settings to position the slides.`,
    );

    steps.push(
      `Attach slide runners to drawer box sides. Test slide action — drawer should open and close smoothly.`,
    );

    return steps;
  });
}
