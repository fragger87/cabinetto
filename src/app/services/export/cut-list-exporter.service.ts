import { Injectable } from '@angular/core';
import { CutPiece, Material, ProjectConfig } from '../../models';

export type ExportFormat = 'csv' | 'pro100' | 'fastcut';

interface ExportPiece {
  name: string;
  length: number;
  width: number;
  quantity: number;
  material: string;
  sourceCabinet: string;
  edgeL1: boolean;
  edgeL2: boolean;
  edgeW1: boolean;
  edgeW2: boolean;
  edgeBandingSymbol: string; // resolved from material
  hasGrain: boolean;
}

@Injectable({ providedIn: 'root' })
export class CutListExporterService {
  export(pieces: CutPiece[], format: ExportFormat, config: ProjectConfig): string {
    const exportPieces = this.buildExportPieces(pieces, config);

    switch (format) {
      case 'csv':
        return this.toCsv(exportPieces);
      case 'pro100':
        return this.toPro100(exportPieces);
      case 'fastcut':
        return this.toFastCut(exportPieces);
    }
  }

  download(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  private buildExportPieces(pieces: CutPiece[], config: ProjectConfig): ExportPiece[] {
    // Map each materialType code to the actual material from config
    const carcassMat = config.materials[config.carcassMaterialIndex];
    const drawerIdx =
      config.drawerMaterialIndex === config.carcassMaterialIndex
        ? config.carcassMaterialIndex
        : config.drawerMaterialIndex;
    const drawerMat = config.materials[drawerIdx];
    const hdfMat = config.materials[config.hdfMaterialIndex];

    const lookup: Record<string, Material> = {};
    // "18mm" type → carcass material
    if (carcassMat) lookup[`${carcassMat.thickness}mm`] = carcassMat;
    // "15mm" type → drawer material (may be same as carcass)
    if (drawerMat) lookup[`${drawerMat.thickness}mm`] = drawerMat;
    // "hdf_3mm" type → hdf material
    if (hdfMat) lookup['hdf_3mm'] = hdfMat;

    return pieces.map((p) => {
      const mat = lookup[p.materialType];
      const materialName = mat?.name ?? p.materialType;
      const bandingSymbol = mat?.edgeBanding ?? '';
      const n = p.name.toLowerCase();
      const isCarcassSide = n.includes('side') && !n.includes('drawer');
      const isCarcassBottom = n.includes('bottom') && !n.includes('drawer');
      const isCarcassRail = n.includes('rail');
      const isDrawerSide = n.includes('drawer') && n.includes('side');
      const isDrawerFront = n.includes('drawer') && n.includes('front');
      const isDrawerBack = n.includes('drawer') && n.includes('back');
      // Band all non-glued edges (moisture sealing). HDF: no banding.
      // L1/L2 = long edges, W1/W2 = short edges.
      //
      // Piece              L1    L2    W1    W2
      // Carcass side       Yes   Yes   Yes   Yes   (all 4)
      // Carcass bottom     Yes   Yes   —     —     (front + back; sides glued)
      // Carcass rail       Yes   Yes   —     —     (front + back; sides glued)
      // Drawer side        Yes   Yes   —     —     (top + bottom; front/back glued)
      // Drawer front       Yes   Yes   Yes   Yes   (all 4)
      // Drawer back        Yes   Yes   Yes   Yes   (all 4)

      const allFour = isCarcassSide || isDrawerFront || isDrawerBack;
      const longOnly = isCarcassBottom || isCarcassRail || isDrawerSide;

      return {
        name: p.name,
        length: Math.max(p.width, p.height),
        width: Math.min(p.width, p.height),
        quantity: p.quantity,
        material: materialName,
        sourceCabinet: p.sourceCabinet,
        edgeL1: allFour || longOnly,
        edgeL2: allFour || longOnly,
        edgeW1: allFour,
        edgeW2: allFour,
        edgeBandingSymbol: bandingSymbol,
        hasGrain: isCarcassSide,
      };
    });
  }

  /** Generic CSV — semicolon separator (European standard), English headers */
  private toCsv(pieces: ExportPiece[]): string {
    const header = 'Material;Length;Width;Qty;Name;Edge L1;Edge L2;Edge W1;Edge W2;Grain';
    const rows = pieces.map((p) => {
      const eb = p.edgeBandingSymbol;
      return [
        p.material,
        p.length,
        p.width,
        p.quantity,
        p.name,
        p.edgeL1 ? eb : '',
        p.edgeL2 ? eb : '',
        p.edgeW1 ? eb : '',
        p.edgeW2 ? eb : '',
        p.hasGrain ? 1 : 0,
      ].join(';');
    });
    return [header, ...rows].join('\n');
  }

  /** Pro100-compatible CSV — semicolon separator, material first */
  private toPro100(pieces: ExportPiece[]): string {
    const header =
      'Material;Dlugosc;Szerokosc;Ilosc;Nazwa;Okl. Dl. 1;Okl. Dl. 2;Okl. Szer. 1;Okl. Szer. 2;Struktura';
    const rows = pieces.map((p) => {
      const eb = p.edgeBandingSymbol;
      return [
        p.material,
        p.length,
        p.width,
        p.quantity,
        p.name,
        p.edgeL1 ? eb : '',
        p.edgeL2 ? eb : '',
        p.edgeW1 ? eb : '',
        p.edgeW2 ? eb : '',
        p.hasGrain ? 1 : 0,
      ].join(';');
    });
    return [header, ...rows].join('\n');
  }

  /**
   * FastCut CSV (AGMAsoft eRozkroje) — 28 columns, semicolon, no header.
   * Spec: https://plyciarz.erozkroje.pl/data/doc/PL_FC2_help_import_csv.pdf
   */
  private toFastCut(pieces: ExportPiece[]): string {
    return pieces
      .map((p) => {
        const eb = p.edgeBandingSymbol;
        const allSame = p.edgeL1 && p.edgeL2 && p.edgeW1 && p.edgeW2;
        const cols: string[] = [
          p.material, // 1: Symbol płyty
          String(p.length), // 2: Długość
          String(p.width), // 3: Szerokość
          p.name, // 4: Opis
          String(p.quantity), // 5: Ilość
          p.edgeL1 ? eb : '', // 6: Okleina bok lewy
          p.edgeL2 ? eb : '', // 7: Okleina bok prawy
          p.edgeW1 ? eb : '', // 8: Okleina bok górny
          p.edgeW2 ? eb : '', // 9: Okleina bok dolny
          p.hasGrain ? '1' : '0', // 10: Struktura materiału
          '', // 11: Kod kreskowy 1
          '', // 12: Kod kreskowy 2
          '0', // 13: Operacja pogrubiania
          allSame ? eb : '', // 14: Symbol okleiny wszystkich boków
          '0', // 15: Kolejność oklejania
          p.sourceCabinet, // 16: Opis dodatkowy/cecha
          '',
          '',
          '',
          '',
          '', // 17-21: Pola informacyjne
          '',
          '',
          '',
          '',
          '',
          '',
          '', // 22-28: Pola dodatkowe
        ];
        return cols.join(';');
      })
      .join('\n');
  }
}
