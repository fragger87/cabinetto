import { Component, input } from '@angular/core';

@Component({
  selector: 'app-svg-cabinet-profile',
  standalone: true,
  templateUrl: './svg-cabinet-profile.html',
})
export class SvgCabinetProfile {
  readonly totalHeight = input(0);
  readonly isBase = input(false);
}
