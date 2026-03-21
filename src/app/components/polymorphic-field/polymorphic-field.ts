import { Component, input, output, OnInit, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PolymorphicValue, isRange } from '../../models';

@Component({
  selector: 'app-polymorphic-field',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './polymorphic-field.html',
})
export class PolymorphicField implements OnInit, OnChanges {
  readonly label = input.required<string>();
  readonly value = input.required<PolymorphicValue>();
  readonly valueChange = output<PolymorphicValue>();

  protected isRangeMode = false;
  protected fixedValue = 0;
  protected minValue = 0;
  protected maxValue = 0;

  ngOnInit(): void {
    this.syncFromValue(this.value());
  }

  ngOnChanges(): void {
    this.syncFromValue(this.value());
  }

  private syncFromValue(val: PolymorphicValue): void {
    if (isRange(val)) {
      this.isRangeMode = true;
      this.minValue = val.min;
      this.maxValue = val.max;
      this.fixedValue = val.min;
    } else {
      this.isRangeMode = false;
      this.fixedValue = val;
      this.minValue = val;
      this.maxValue = val;
    }
  }

  protected toggleMode(): void {
    this.isRangeMode = !this.isRangeMode;
    this.emit();
  }

  protected emit(): void {
    if (this.isRangeMode) {
      this.valueChange.emit({ min: this.minValue, max: this.maxValue });
    } else {
      this.valueChange.emit(this.fixedValue);
    }
  }
}
