import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { BoardLayout, PlacedPiece } from '../../models';

const SCALE = 0.2; // 0.2px per mm

@Component({
  selector: 'app-cutting-layout',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './cutting-layout.html',
})
export class CuttingLayout {
  readonly layouts = input.required<BoardLayout[]>();
  readonly label = input('18 mm Boards');

  protected readonly scale = SCALE;

  protected svgWidth(layout: BoardLayout): number {
    return layout.boardWidth * SCALE;
  }

  protected svgHeight(layout: BoardLayout): number {
    return layout.boardHeight * SCALE;
  }

  protected pieceColor(piece: PlacedPiece): string {
    const name = piece.name.toLowerCase();
    if (name.includes('side')) return 'rgba(139,69,19,0.7)';
    if (name.includes('bottom')) return 'rgba(34,139,34,0.6)';
    if (name.includes('rail')) return 'rgba(70,130,180,0.7)';
    if (name.includes('drawer')) return 'rgba(255,140,0,0.7)';
    return 'rgba(150,150,150,0.5)';
  }

  protected pieceTooltip(piece: PlacedPiece): string {
    return `${piece.name}\n${piece.originalWidth} × ${piece.originalHeight} mm\nPlaced: ${piece.width} × ${piece.height} mm`;
  }

  protected showLabel(piece: PlacedPiece): boolean {
    return piece.width * SCALE > 40 && piece.height * SCALE > 20;
  }

  protected labelText(piece: PlacedPiece): string {
    return `${piece.originalWidth}×${piece.originalHeight}`;
  }

  protected labelX(piece: PlacedPiece): number {
    return (piece.x + piece.width / 2) * SCALE;
  }

  protected labelY(piece: PlacedPiece): number {
    return (piece.y + piece.height / 2) * SCALE;
  }
}
