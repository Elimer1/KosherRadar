// NEW (Milestone 6): where to go after login. Only a path on this site is accepted.
// A value such as "//other.example" or "https://other.example" would leave the site, so it becomes the home page.
// חדש (אבן דרך 6): לאן חוזרים אחרי התחברות. מתקבל רק נתיב בתוך האתר.
// ערך כמו "//other.example" או כתובת מלאה היה מוציא מהאתר, ולכן הוא הופך לדף הבית.
//
// NEW (UX WP1A): the same check rejects encoded open redirects. Search return uses it with a higher length cap.
// חדש (חבילת UX 1A): אותה בדיקה דוחה הפניות פתוחות מקודדות. חזרה לחיפוש משתמשת בה עם תקרת אורך גבוהה יותר.

const INTERNAL_ORIGIN = 'http://kosherradar.local';

export const INTERNAL_PATH_MAX_LENGTH = 300;
export const SEARCH_RETURN_MAX_LENGTH = 2048;

const decodedForms = (value: string) => {
  const forms = [value];
  let current = value;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (!/%[0-9A-Fa-f]{2}/.test(current)) {
      break;
    }

    try {
      const next = decodeURIComponent(current);

      if (next === current) {
        break;
      }

      forms.push(next);
      current = next;
    } catch {
      return null;
    }
  }

  return forms;
};

const hasControlCharacter = (value: string) => {
  for (const character of value) {
    const code = character.charCodeAt(0);

    if (code <= 31 || code === 127) {
      return true;
    }
  }

  return false;
};

const isUnsafePath = (value: string) => {
  const forms = decodedForms(value);

  if (!forms) {
    return true;
  }

  return forms.some(
    (form) => form.startsWith('//') || form.includes('\\') || form.includes('://') || hasControlCharacter(form)
  );
};

// Null means the value is not a path inside this site. Callers that need a fallback use `/`.
// null פירושו שהערך אינו נתיב בתוך האתר. מי שצריך ברירת מחדל משתמש ב-`/`.
export const readInternalPath = (value: unknown, maxLength = INTERNAL_PATH_MAX_LENGTH): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const candidate = value.trim();

  if (candidate.length === 0 || candidate.length > maxLength) {
    return null;
  }

  if (!candidate.startsWith('/') || candidate.startsWith('//') || candidate.includes('\\') || candidate.includes('://')) {
    return null;
  }

  if (isUnsafePath(candidate)) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(candidate, INTERNAL_ORIGIN);
  } catch {
    return null;
  }

  if (url.origin !== INTERNAL_ORIGIN || url.username || url.password) {
    return null;
  }

  if (!url.pathname.startsWith('/') || url.pathname.startsWith('//') || url.pathname.includes('\\')) {
    return null;
  }

  const path = `${url.pathname}${url.search}`;

  if (path.length > maxLength || isUnsafePath(path) || isUnsafePath(url.pathname)) {
    return null;
  }

  return path;
};

export const safeReturnPath = (value: unknown): string => readInternalPath(value) ?? '/';
