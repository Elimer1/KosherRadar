// NEW (Milestone 5): the language preference stays on this browser and starts as English unless Hebrew was saved.
// חדש (אבן דרך 5): העדפת השפה נשמרת בדפדפן, ומתחילה באנגלית אלא אם נשמרה עברית.
import { beforeEach, describe, expect, it } from 'vitest';
import { readSavedLanguage, rememberLanguage } from './language';

describe('readSavedLanguage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('uses a saved choice', () => {
    rememberLanguage('he');
    expect(readSavedLanguage()).toBe('he');
    expect(document.documentElement.dir).toBe('rtl');

    rememberLanguage('en');
    expect(readSavedLanguage()).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
  });

  it('ignores a saved value that is not a language', () => {
    localStorage.setItem('kosherradar-language', 'fr');
    expect(readSavedLanguage()).toBe('en');
  });
});
