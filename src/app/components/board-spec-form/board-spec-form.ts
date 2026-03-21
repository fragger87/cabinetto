import { Component, effect, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectStateService } from '../../services/project-state.service';

const MIN_DIM = 1;

function boardGroup(fb: FormBuilder, w: number, h: number, t: number, k: number): FormGroup {
  return fb.group({
    width: [w, [Validators.required, Validators.min(MIN_DIM)]],
    height: [h, [Validators.required, Validators.min(MIN_DIM)]],
    thickness: [t, [Validators.required, Validators.min(MIN_DIM)]],
    kerf: [k, [Validators.required, Validators.min(0)]],
  });
}

@Component({
  selector: 'app-board-spec-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './board-spec-form.html',
})
export class BoardSpecForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly state = inject(ProjectStateService);

  readonly form = boardGroup(this.fb, 2800, 2070, 18, 4);
  readonly drawerForm = boardGroup(this.fb, 2800, 2070, 15, 4);
  readonly hdfForm = boardGroup(this.fb, 2800, 2070, 3, 4);

  constructor() {
    effect(() => {
      this.state.externalChange();
      this.form.patchValue(this.state.board(), { emitEvent: false });
      this.drawerForm.patchValue(this.state.drawerBoard(), { emitEvent: false });
      this.hdfForm.patchValue(this.state.hdfBoard(), { emitEvent: false });
    });
  }

  ngOnInit(): void {
    this.form.valueChanges.subscribe((val) => {
      if (this.form.valid) this.state.update({ board: val });
    });
    this.drawerForm.valueChanges.subscribe((val) => {
      if (this.drawerForm.valid) this.state.update({ drawerBoard: val });
    });
    this.hdfForm.valueChanges.subscribe((val) => {
      if (this.hdfForm.valid) this.state.update({ hdfBoard: val });
    });
  }
}
