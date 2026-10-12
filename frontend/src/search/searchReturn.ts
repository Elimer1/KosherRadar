// NEW (UX WP1A): where Back to search may go. Only the home search route, after the canonical parser
// has removed coordinates and unknown parameters.
// חדש (חבילת UX 1A): לאן "חזרה לחיפוש" רשאי ללכת. רק דף החיפוש, אחרי שהמפרש הסיר קואורדינטות ופרמטרים לא מוכרים.
import { readInternalPath, SEARCH_RETURN_MAX_LENGTH } from '../utils/returnPath';
import { canonicalSearchPath, parseSearchQuery } from './searchCriteria';

export const SEARCH_RETURN_STORAGE_KEY = 'kosherradar-search-return';

export interface SearchReturnLocation {
  source: 'named' | 'device';
  label: string;
  lat: number;
  lng: number;
  radiusKm: number | null;
}

export interface SearchReturnState {
  from?: string;
  searchLocation?: SearchReturnLocation;
}

// Null when the value is not an internal home-search URL. "/" is valid.
// null כשהערך אינו כתובת חיפוש פנימית. "/" תקין.
export const safeSearchReturnPath = (value: unknown): string | null => {
  const internal = readInternalPath(value, SEARCH_RETURN_MAX_LENGTH);

  if (internal === null) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(internal, 'http://kosherradar.local');
  } catch {
    return null;
  }

  let decodedPath: string;

  try {
    decodedPath = decodeURIComponent(url.pathname);
  } catch {
    return null;
  }

  if (decodedPath !== '/') {
    return null;
  }

  return canonicalSearchPath(parseSearchQuery(url.search));
};

export const rememberSearchReturnPath = (path: string) => {
  const safe = safeSearchReturnPath(path);

  if (safe === null) {
    return;
  }

  try {
    sessionStorage.setItem(SEARCH_RETURN_STORAGE_KEY, safe);
  } catch {
    // Private mode can refuse storage. Router state is the other copy.
  }
};

const readStoredSearchReturnPath = () => {
  try {
    return sessionStorage.getItem(SEARCH_RETURN_STORAGE_KEY);
  } catch {
    return null;
  }
};

const readStateFrom = (state: unknown) => {
  if (!state || typeof state !== 'object' || !('from' in state)) {
    return undefined;
  }

  return (state as { from?: unknown }).from;
};

// Router state wins, then the same-tab search path, then the home page.
// מצב הניווט קודם, אחר כך החיפוש האחרון בלשונית, ולבסוף דף הבית.
export const resolveSearchReturnPath = (state: unknown) => {
  const from = readStateFrom(state);

  if (typeof from === 'string') {
    const safe = safeSearchReturnPath(from);

    if (safe !== null) {
      return safe;
    }
  }

  const stored = readStoredSearchReturnPath();

  if (stored !== null) {
    const safe = safeSearchReturnPath(stored);

    if (safe !== null) {
      return safe;
    }
  }

  return '/';
};
