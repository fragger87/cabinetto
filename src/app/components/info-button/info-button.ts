import { Component, input, signal, computed } from '@angular/core';
import { HELP_TEXTS } from './help-texts';

@Component({
  selector: 'app-info-button',
  standalone: true,
  templateUrl: './info-button.html',
})
export class InfoButton {
  readonly helpKey = input.required<string>();
  protected readonly isOpen = signal(false);

  protected readonly title = computed(() => HELP_TEXTS[this.helpKey()]?.title ?? this.helpKey());
  protected readonly description = computed(() => HELP_TEXTS[this.helpKey()]?.description ?? '');

  protected open(): void {
    this.isOpen.set(true);
  }
  protected close(): void {
    this.isOpen.set(false);
  }
}
