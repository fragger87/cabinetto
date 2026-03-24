import { Component, effect, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectStateService } from '../../services/project-state.service';
import { PolymorphicField } from '../polymorphic-field/polymorphic-field';
import { CabinetType, PolymorphicValue } from '../../models';
import { SvgCabinetProfile } from '../svg-cabinet-profile/svg-cabinet-profile';
import { InfoButton } from '../info-button/info-button';
import { TranslatePipe } from '../../i18n/translate.pipe';

@Component({
  selector: 'app-global-settings-form',
  standalone: true,
  imports: [ReactiveFormsModule, PolymorphicField, SvgCabinetProfile, InfoButton, TranslatePipe],
  templateUrl: './global-settings-form.html',
})
export class GlobalSettingsForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly state = inject(ProjectStateService);

  readonly form: FormGroup = this.fb.group({
    cabinetType: ['base', Validators.required],
    totalHeight: [890, [Validators.required, Validators.min(200)]],
    railWidth: [80, [Validators.required, Validators.min(1)]],
    drawerBottomMount: ['nailed', Validators.required],
    drawerBottomOverlap: [8, [Validators.required, Validators.min(1)]],
    backPanelMount: ['nailed', Validators.required],
    backPanelOverlap: [8, [Validators.required, Validators.min(1)]],
  });

  protected legs: PolymorphicValue = { min: 95, max: 165 };
  protected depth: PolymorphicValue = { min: 500, max: 550 };

  constructor() {
    effect(() => {
      this.state.externalChange(); // track the signal
      const config = this.state.config();
      this.form.patchValue(
        {
          cabinetType: config.cabinetType,
          totalHeight: config.totalHeight,
          railWidth: config.railWidth,
          drawerBottomMount: config.drawerBottomMount,
          drawerBottomOverlap: config.drawerBottomOverlap,
          backPanelMount: config.backPanelMount,
          backPanelOverlap: config.backPanelOverlap,
        },
        { emitEvent: false },
      );
      this.legs = config.legs;
      this.depth = config.depth;
    });
  }

  ngOnInit(): void {
    this.form.valueChanges.subscribe((val) => {
      if (this.form.valid) {
        this.state.update(val);
      }
    });
  }

  protected get isBase(): boolean {
    return this.form.get('cabinetType')?.value === 'base';
  }

  protected onLegsChange(value: PolymorphicValue): void {
    this.legs = value;
    this.state.update({ legs: value });
  }

  protected onDepthChange(value: PolymorphicValue): void {
    this.depth = value;
    this.state.update({ depth: value });
  }

  protected get cabinetTypes(): CabinetType[] {
    return ['base', 'wall', 'tall'];
  }
}
