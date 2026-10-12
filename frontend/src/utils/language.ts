// NEW (Milestone 5): the saved language, and the document direction that goes with it.
// חדש (אבן דרך 5): השפה השמורה, וכיוון המסמך שמתאים לה.
export type AppLanguage = 'en' | 'he';

const STORAGE_KEY = 'kosherradar-language';

export const readSavedLanguage = (): AppLanguage => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === 'he' || saved === 'en') {
      return saved;
    }
  } catch {
    // A browser that blocks storage still gets a language from the navigator below.
  }

  const browser = typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : '';
  return browser.startsWith('he') ? 'he' : 'en';
};

export const applyDocumentLanguage = (language: AppLanguage) => {
  document.documentElement.lang = language;
  document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
};

export const rememberLanguage = (language: AppLanguage) => {
  localStorage.setItem(STORAGE_KEY, language);
  applyDocumentLanguage(language);
};
