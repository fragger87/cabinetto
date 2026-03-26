import { Component, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProjectStateService } from '../../services/project-state.service';
import { DrawerConfigForm } from '../drawer-config/drawer-config';
import { Cabinet, DrawerConfig } from '../../models';
import { SvgCabinetMini } from '../svg-cabinet-mini/svg-cabinet-mini';
import { InfoButton } from '../info-button/info-button';
import { TranslatePipe } from '../../i18n/translate.pipe';

const MINI_SVG_USABLE_HEIGHT = 74;
const MINI_SVG_TOP_OFFSET = 12;

type CabinetInput = Omit<Cabinet, 'bodyHeight' | 'legHeight'>;

@Component({
  selector: 'app-cabinet-list',
  standalone: true,
  imports: [FormsModule, DrawerConfigForm, SvgCabinetMini, InfoButton, TranslatePipe],
  templateUrl: './cabinet-list.html',
})
export class CabinetList {
  private readonly state = inject(ProjectStateService);

  protected cabinets: CabinetInput[] = [];

  constructor() {
    effect(() => {
      this.state.externalChange(); // track the signal
      this.cabinets = [...this.state.cabinets()];
    });
  }

  protected addCabinet(): void {
    this.cabinets.push({ name: '', width: 600, quantity: 1 });
    this.emit();
  }

  protected removeCabinet(index: number): void {
    this.cabinets.splice(index, 1);
    this.emit();
  }

  protected onDrawerChange(index: number, config: DrawerConfig | undefined): void {
    this.cabinets[index] = { ...this.cabinets[index], drawers: config };
    this.emit();
  }

  protected drawerLinePositions(cab: CabinetInput): number[] {
    if (!cab.drawers || cab.drawers.count <= 1) return [];
    const lines: number[] = [];
    const step = MINI_SVG_USABLE_HEIGHT / cab.drawers.count;
    for (let i = 1; i < cab.drawers.count; i++) {
      lines.push(MINI_SVG_TOP_OFFSET + i * step);
    }
    return lines;
  }

  protected emit(): void {
    this.state.update({ cabinets: [...this.cabinets] });
  }
}
