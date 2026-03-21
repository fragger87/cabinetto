import { Injectable } from '@angular/core';

export interface DepthCandidate {
  depth: number;
  strips: number;
  stripWaste: number;
}

@Injectable({ providedIn: 'root' })
export class DepthOptimizerService {
  /**
   * Fast heuristic: find depth that minimizes strip waste from board height.
   * Used as seed for Stage 1 when depth is a range.
   */
  heuristicDepth(minDepth: number, maxDepth: number, boardHeight: number, kerf: number): number {
    let bestDepth = minDepth;
    let bestWaste = Infinity;

    for (let d = minDepth; d <= maxDepth; d++) {
      const strips = Math.floor((boardHeight + kerf) / (d + kerf));
      if (strips < 1) continue;
      const used = strips * d + (strips - 1) * kerf;
      const waste = boardHeight - used;
      if (waste < bestWaste) {
        bestWaste = waste;
        bestDepth = d;
      }
    }

    return bestDepth;
  }

  /**
   * Generate all depth candidates at 5mm steps for comparison display.
   */
  generateCandidates(
    minDepth: number,
    maxDepth: number,
    boardHeight: number,
    kerf: number,
  ): DepthCandidate[] {
    const candidates: DepthCandidate[] = [];
    for (let d = minDepth; d <= maxDepth; d += 5) {
      const strips = Math.floor((boardHeight + kerf) / (d + kerf));
      if (strips < 1) continue;
      const used = strips * d + (strips - 1) * kerf;
      candidates.push({ depth: d, strips, stripWaste: boardHeight - used });
    }
    return candidates;
  }
}
