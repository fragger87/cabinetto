import { Component, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProjectStateService } from '../../services/project-state.service';
import { DrawerConfigForm } from '../drawer-config/drawer-config';
import { Cabinet, DrawerConfig } from '../../models';

type CabinetInput = Omit<Cabinet, 'bodyHeight' | 'legHeight'>;

@Component({
  selector: 'app-cabinet-list',
  standalone: true,
  imports: [FormsModule, DrawerConfigForm],
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
    const step = 74 / cab.drawers.count; // 74px = usable area in mini SVG
    for (let i = 1; i < cab.drawers.count; i++) {
      lines.push(12 + i * step); // 12px = top offset in mini SVG
    }
    return lines;
  }

  protected emit(): void {
    this.state.update({ cabinets: [...this.cabinets] });
  }
}
