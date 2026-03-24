import { Component, input } from '@angular/core';

@Component({
  selector: 'app-svg-board-diagram',
  standalone: true,
  templateUrl: './svg-board-diagram.html',
})
export class SvgBoardDiagram {
  readonly width = input(0);
  readonly height = input(0);
  readonly thickness = input(0);
  readonly kerf = input(0);
}
