import { Injectable } from '@angular/core';
import { BoardSpec, CutPiece, BoardLayout, PlacedPiece } from '../models';

interface FreeRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

@Injectable({ providedIn: 'root' })
export class CuttingOptimizerService {
  /**
   * Guillotine bin packing with Best Short Side Fit (BSSF).
   * Pieces are placed into horizontal strips pre-cut at `depth` intervals,
   * then free space is split into right and bottom remainders after each placement.
   */
  optimize(pieces: CutPiece[], board: BoardSpec, depth: number): BoardLayout[] {
    const expanded = this.expandPieces(pieces);
    if (expanded.length === 0) return [];

    // Area-descending sort: large pieces first reduces fragmentation because
    // they are hardest to place and benefit from the most free-space options
    expanded.sort((a, b) => b.width * b.height - a.width * a.height);

    const kerf = board.kerf;
    const boards: InternalBoard[] = [];
    let current = this.createBoard(board, depth, kerf);
    boards.push(current);

    for (const piece of expanded) {
      if (!this.placePiece(current, piece, depth, kerf)) {
        current = this.createBoard(board, depth, kerf);
        boards.push(current);
        if (!this.placePiece(current, piece, depth, kerf)) {
          console.warn(
            `Piece "${piece.name}" (${piece.width}×${piece.height}) cannot fit on board ${board.width}×${board.height} with depth ${depth}`,
          );
        }
      }
    }

    return boards.map((b, i) => this.toBoardLayout(b, i, board));
  }

  private expandPieces(pieces: CutPiece[]): CutPiece[] {
    const result: CutPiece[] = [];
    for (const p of pieces) {
      for (let i = 0; i < p.quantity; i++) {
        result.push({ ...p, quantity: 1 });
      }
    }
    return result;
  }

  /**
   * Pre-slices the board into horizontal strips of height `depth`.
   * This mirrors how a table saw makes rip cuts first, then cross-cuts —
   * each strip becomes a free rectangle spanning the full board width.
   */
  private createBoard(board: BoardSpec, depth: number, kerf: number): InternalBoard {
    // +kerf in numerator accounts for no trailing kerf after the last strip
    const numStrips = Math.floor((board.height + kerf) / (depth + kerf));
    const freeRects: FreeRect[] = [];
    for (let i = 0; i < numStrips; i++) {
      freeRects.push({ x: 0, y: i * (depth + kerf), w: board.width, h: depth });
    }
    return { width: board.width, height: board.height, placed: [], freeRects, usedArea: 0 };
  }

  /**
   * BSSF heuristic: for each orientation, find the free rect where the
   * shorter leftover dimension is minimized. This avoids creating thin
   * slivers that are too narrow for future pieces.
   */
  private placePiece(layout: InternalBoard, piece: CutPiece, depth: number, kerf: number): boolean {
    const orientations: [number, number][] = [
      [piece.width, piece.height],
      [piece.height, piece.width],
    ];

    let bestIdx = -1;
    let bestW = 0;
    let bestH = 0;
    let bestScore = Infinity;

    for (const [w, h] of orientations) {
      const idx = this.findBestRect(layout, w, h);
      if (idx >= 0) {
        const r = layout.freeRects[idx];
        // BSSF score: min(width gap, height gap) — lower = tighter fit
        const score = Math.min(r.w - w, r.h - h);
        if (score < bestScore) {
          bestScore = score;
          bestIdx = idx;
          bestW = w;
          bestH = h;
        }
      }
    }

    if (bestIdx < 0) return false;

    const rect = layout.freeRects[bestIdx];
    layout.placed.push({
      x: rect.x,
      y: rect.y,
      width: bestW,
      height: bestH,
      name: piece.name,
      sourceCabinet: piece.sourceCabinet,
      originalWidth: piece.width,
      originalHeight: piece.height,
    });
    layout.usedArea += bestW * bestH;

    layout.freeRects.splice(bestIdx, 1);

    // Guillotine split: carve right remainder (full strip height) and
    // bottom remainder (piece width only) — kerf consumed at each cut
    const rightW = rect.w - bestW - kerf;
    const bottomH = rect.h - bestH - kerf;

    if (rightW > 0) {
      layout.freeRects.push({
        x: rect.x + bestW + kerf,
        y: rect.y,
        w: rightW,
        h: rect.h,
      });
    }
    if (bottomH > 0) {
      layout.freeRects.push({
        x: rect.x,
        y: rect.y + bestH + kerf,
        w: bestW,
        h: bottomH,
      });
    }

    // Prioritize full-depth strips so pieces land in intact rows first,
    // only falling back to fragmented remainders when strips are exhausted
    layout.freeRects.sort((a, b) => {
      const aPri = a.h === depth ? 0 : 1;
      const bPri = b.h === depth ? 0 : 1;
      if (aPri !== bPri) return aPri - bPri;
      return b.w * b.h - a.w * a.h;
    });

    return true;
  }

  private findBestRect(layout: InternalBoard, w: number, h: number): number {
    let bestIdx = -1;
    let bestScore = Infinity;
    for (let i = 0; i < layout.freeRects.length; i++) {
      const r = layout.freeRects[i];
      if (w <= r.w && h <= r.h) {
        const score = Math.min(r.w - w, r.h - h);
        if (score < bestScore) {
          bestScore = score;
          bestIdx = i;
        }
      }
    }
    return bestIdx;
  }

  private toBoardLayout(b: InternalBoard, index: number, board: BoardSpec): BoardLayout {
    return {
      boardIndex: index,
      boardWidth: board.width,
      boardHeight: board.height,
      placedPieces: b.placed,
      utilization: (b.usedArea / (board.width * board.height)) * 100,
    };
  }
}

interface InternalBoard {
  width: number;
  height: number;
  placed: PlacedPiece[];
  freeRects: FreeRect[];
  usedArea: number;
}
