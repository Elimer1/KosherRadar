// NEW (UX WP1A): where Back to search may go. Only the home search route, after the canonical parser
// has removed coordinates and unknown parameters.
// חדש (חבילת UX 1A): לאן "חזרה לחיפוש" רשאי ללכת. רק דף החיפוש, אחרי שהמפרש הסיר קואורדינטות ופרמטרים לא מוכרים.
import { readInternalPath, SEARCH_RETURN_MAX_LENGTH } from '../utils/returnPath';
import { canonicalSearchPath, parseSearchQuery } from './searchCriteria';

export const SEARCH_RETURN_STORAGE_KEY = 'kosherradar-search-return';
export const SEARCH_SCROLL_STORAGE_KEY = 'kosherradar-search-scroll';

export interface SearchScrollMemory {
  path: string;
  scrollY: number;
  restaurantId: string;
}

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

const restaurantIdPattern = /^[a-fA-F0-9]{24}$/;

// Best-effort return position. The path is the shareable search. Coordinates are not stored.
// מיקום חזרה בקירוב. הנתיב הוא החיפוש שאפשר לשתף. קואורדינטות לא נשמרות.
export const rememberSearchScroll = (path: string, restaurantId: string, scrollY: number) => {
  const safe = safeSearchReturnPath(path);

  if (safe === null || !restaurantIdPattern.test(restaurantId)) {
    return;
  }

  const y = Number.isFinite(scrollY) && scrollY >= 0 ? Math.round(scrollY) : 0;

  try {
    sessionStorage.setItem(
      SEARCH_SCROLL_STORAGE_KEY,
      JSON.stringify({ path: safe, scrollY: y, restaurantId } satisfies SearchScrollMemory)
    );
  } catch {
    // Private mode can refuse storage. The search URL still restores the criteria.
  }
};

export const readSearchScroll = (): SearchScrollMemory | null => {
  try {
    const raw = sessionStorage.getItem(SEARCH_SCROLL_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<SearchScrollMemory>;
    const path = safeSearchReturnPath(parsed.path);

    if (path === null || typeof parsed.restaurantId !== 'string' || !restaurantIdPattern.test(parsed.restaurantId)) {
      return null;
    }

    const scrollY = typeof parsed.scrollY === 'number' && Number.isFinite(parsed.scrollY) && parsed.scrollY >= 0 ? parsed.scrollY : 0;

    return { path, scrollY, restaurantId: parsed.restaurantId };
  } catch {
    return null;
  }
};

export const forgetSearchScroll = () => {
  try {
    sessionStorage.removeItem(SEARCH_SCROLL_STORAGE_KEY);
  } catch {
    // Storage can be blocked. There is nothing else to clear.
  }
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
