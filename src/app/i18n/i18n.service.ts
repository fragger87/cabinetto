import { Injectable, signal } from '@angular/core';
import { en } from './translations/en';
import { pl } from './translations/pl';
import { de } from './translations/de';
import { fr } from './translations/fr';
import { es } from './translations/es';

export type Language = 'en' | 'pl' | 'de' | 'fr' | 'es';

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'pl', label: 'Polski' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Fran\u00e7ais' },
  { code: 'es', label: 'Espa\u00f1ol' },
];

const TRANSLATIONS: Record<Language, Record<string, string>> = { en, pl, de, fr, es };

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly _lang = signal<Language>(this.detectLanguage());
  readonly lang = this._lang.asReadonly();

  setLanguage(lang: Language): void {
    this._lang.set(lang);
    localStorage.setItem('cabinet-calc-lang', lang);
  }

  t(key: string): string {
    return TRANSLATIONS[this._lang()][key] ?? TRANSLATIONS['en'][key] ?? key;
  }

  private detectLanguage(): Language {
    const stored = localStorage.getItem('cabinet-calc-lang') as Language;
    if (stored && stored in TRANSLATIONS) return stored;
    const browser = navigator.language.slice(0, 2) as Language;
    if (browser in TRANSLATIONS) return browser;
    return 'en';
  }
}
