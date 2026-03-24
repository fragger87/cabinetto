import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { CutPiece, EdgeBandingResult } from '../../models';
import { TranslatePipe } from '../../i18n/translate.pipe';

@Component({
  selector: 'app-parts-list',
  standalone: true,
  imports: [DecimalPipe, TranslatePipe],
  templateUrl: './parts-list.html',
})
export class PartsList {
  readonly pieces18mm = input.required<CutPiece[]>();
  readonly pieces15mm = input.required<CutPiece[]>();
  readonly piecesHdf = input.required<CutPiece[]>();
  readonly edgeBanding = input.required<EdgeBandingResult>();
}
