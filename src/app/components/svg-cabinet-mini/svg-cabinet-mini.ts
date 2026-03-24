import { Component, input } from '@angular/core';

@Component({
  selector: 'app-svg-cabinet-mini',
  standalone: true,
  templateUrl: './svg-cabinet-mini.html',
})
export class SvgCabinetMini {
  readonly width = input(0);
  readonly drawerCount = input(0);
  readonly drawerLines = input<number[]>([]);
}
