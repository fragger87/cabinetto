import { Component, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProjectStateService } from '../../services/project-state.service';
import { Material } from '../../models';
import { TranslatePipe } from '../../i18n/translate.pipe';

@Component({
  selector: 'app-material-library',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './material-library.html',
})
export class MaterialLibrary {
  private readonly state = inject(ProjectStateService);
  protected materials: Material[] = [];

  constructor() {
    effect(() => {
      this.state.externalChange();
      this.materials = this.state.materials().map((m) => ({ ...m }));
    });
  }

  protected onFieldChange(): void {
    this.state.update({ materials: this.materials.map((m) => ({ ...m })) });
  }

  protected addMaterial(): void {
    this.materials = [
      ...this.materials,
      { name: 'New material', width: 2800, height: 2070, thickness: 18, edgeBanding: '' },
    ];
    this.state.update({ materials: this.materials.map((m) => ({ ...m })) });
  }

  protected removeMaterial(index: number): void {
    this.materials = this.materials.filter((_, i) => i !== index);
    this.state.update({ materials: this.materials.map((m) => ({ ...m })) });
  }

  protected trackByIndex(index: number): number {
    return index;
  }
}
