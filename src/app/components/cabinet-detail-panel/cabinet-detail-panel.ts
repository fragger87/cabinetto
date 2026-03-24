import { Component, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Cabinet, CabinetBom } from '../../models';
import { TranslatePipe } from '../../i18n/translate.pipe';

@Component({
  selector: 'app-cabinet-detail-panel',
  standalone: true,
  imports: [DecimalPipe, TranslatePipe],
  templateUrl: './cabinet-detail-panel.html',
})
export class CabinetDetailPanel {
  readonly cabinet = input.required<Cabinet>();
  readonly bom = input.required<CabinetBom>();
  readonly panelClose = output<void>();

  protected onClose(): void {
    this.panelClose.emit();
  }
}
