import { Component, effect, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectStateService } from '../../services/project-state.service';
import { Material } from '../../models';
import { TranslatePipe } from '../../i18n/translate.pipe';

@Component({
  selector: 'app-material-assignment',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './material-assignment.html',
})
export class MaterialAssignment implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly state = inject(ProjectStateService);

  readonly form: FormGroup = this.fb.group({
    kerf: [4, [Validators.required, Validators.min(0)]],
    carcassMaterialIndex: [0, Validators.required],
    drawerMaterialIndex: [1, Validators.required],
    hdfMaterialIndex: [2, Validators.required],
  });

  protected materials: Material[] = [];

  constructor() {
    effect(() => {
      this.state.externalChange();
      const config = this.state.config();
      this.materials = config.materials;
      this.form.patchValue(
        {
          kerf: config.kerf,
          carcassMaterialIndex: config.carcassMaterialIndex,
          drawerMaterialIndex: config.drawerMaterialIndex,
          hdfMaterialIndex: config.hdfMaterialIndex,
        },
        { emitEvent: false },
      );
    });
  }

  ngOnInit(): void {
    this.form.valueChanges.subscribe((val) => {
      if (this.form.valid) {
        this.state.update({
          kerf: val.kerf,
          carcassMaterialIndex: val.carcassMaterialIndex,
          drawerMaterialIndex: val.drawerMaterialIndex,
          hdfMaterialIndex: val.hdfMaterialIndex,
        });
      }
    });
  }
}
