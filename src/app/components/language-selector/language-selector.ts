import { Component, inject } from '@angular/core';
import { I18nService, LANGUAGES, Language } from '../../i18n/i18n.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  templateUrl: './language-selector.html',
})
export class LanguageSelector {
  protected readonly i18n = inject(I18nService);
  protected readonly languages = LANGUAGES;

  protected onChange(lang: Language): void {
    this.i18n.setLanguage(lang);
  }
}
