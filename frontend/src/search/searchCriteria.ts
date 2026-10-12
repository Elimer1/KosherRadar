// NEW (UX WP1A): canonical browser search criteria. The address is the applied search.
// Draft keystrokes stay outside this module. Coordinates are never written here.
// חדש (חבילת UX 1A): קריטריוני החיפוש המוחלים. הכתובת היא החיפוש שהוחל.
// הקלדה חיה נשארת מחוץ למודול הזה. קואורדינטות לא נכתבות לכאן.
import { RADIUS_OPTIONS_KM } from '../types/search';

// These lists match backend/src/config/constants.js. Unknown URL values are ignored.
// הרשימות תואמות ל-constants בשרת. ערך לא מוכר בכתובת מושמט.
export const FOOD_TYPES = ['MEAT', 'DAIRY', 'PAREVE'] as const;
export const CATEGORIES = [
  'RESTAURANT',
  'CAFE',
  'BAKERY',
  'HOTEL',
  'CATERING',
  'FAST_FOOD',
  'FOOD_TRUCK',
  'ICE_CREAM',
  'GROCERY',
] as const;
export const KASHRUT_LEVELS = ['RABBANUT', 'MEHADRIN'] as const;
export const HECHSHER_VALUES = [
  'LOCAL_RABBANUT',
  'BADATZ_EDAH_HACHAREDIS',
  'BADATZ_BEIT_YOSEF',
  'BADATZ_MACHPUD',
  'RABBI_LANDAU',
  'RABBI_RUBIN',
  'CHUG_CHATAM_SOFER',
  'OTHER',
] as const;

// Same cap as the public search schema (q max 100). Place labels follow the places schema (max 200).
// אותה תקרת אורך כמו סכמת החיפוש. תווית מקום עד 200, כמו חיפוש המקומות.
export const SEARCH_QUERY_MAX_LENGTH = 100;
export const NEAR_MAX_LENGTH = 200;

// Browser parameter order. Repeated names are the multi-select filters.
// The API still receives comma-separated foodType, hechsher and category, and radiusKm rather than radius.
// סדר פרמטרי הדפדפן. שמות חוזרים הם מסננים מרובי בחירה.
export const SEARCH_URL_PARAMS = [
  'q',
  'foodType',
  'level',
  'hechsher',
  'category',
  'hideExpired',
  'includeUnknown',
  'near',
  'radius',
] as const;

export interface AppliedSearchCriteria {
  q: string;
  foodType: string[];
  level: string;
  hechsher: string[];
  category: string[];
  hideExpired: boolean;
  includeUnknown: boolean;
  near: string;
  radiusKm: number | null;
}

export interface SearchFilterPatch {
  foodType?: string[];
  level?: string;
  hechsher?: string[];
  category?: string[];
  hideExpired?: boolean;
  includeUnknown?: boolean;
  near?: string;
  radiusKm?: number | null;
}

export type SearchHistoryMode = 'push' | 'replace';

export interface SearchTransition {
  criteria: AppliedSearchCriteria;
  history: SearchHistoryMode;
  changed: boolean;
}

export const emptyAppliedSearch = (): AppliedSearchCriteria => ({
  q: '',
  foodType: [],
  level: '',
  hechsher: [],
  category: [],
  hideExpired: false,
  includeUnknown: false,
  near: '',
  radiusKm: null,
});

const allowed = (values: readonly string[], value: string) => values.includes(value);

const cleanList = (values: readonly string[] | undefined, permitted: readonly string[]) => {
  const selected = new Set<string>();

  for (const value of values ?? []) {
    for (const part of value.split(',')) {
      const item = part.trim();

      if (allowed(permitted, item)) {
        selected.add(item);
      }
    }
  }

  return permitted.filter((item) => selected.has(item));
};

export const cleanQuery = (value: string) => value.trim().slice(0, SEARCH_QUERY_MAX_LENGTH);

const hasControlCharacter = (value: string) => {
  for (const character of value) {
    const code = character.charCodeAt(0);

    if (code <= 31 || code === 127) {
      return true;
    }
  }

  return false;
};

export const cleanNear = (value: string) => {
  const trimmed = value.trim().slice(0, NEAR_MAX_LENGTH);

  // A one-character label cannot be looked up, and a label must not carry a URL or a control character.
  // תווית של תו אחד לא ניתנת לחיפוש, ותווית לא נושאת כתובת או תו בקרה.
  if (trimmed.length < 2 || hasControlCharacter(trimmed) || trimmed.includes('\\') || trimmed.includes('://')) {
    return '';
  }

  return trimmed;
};

export const cleanRadius = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = typeof value === 'number' ? value : Number(value);

  if (!Number.isInteger(parsed) || !RADIUS_OPTIONS_KM.includes(parsed)) {
    return null;
  }

  return parsed;
};

export const normalizeCriteria = (
  input: Partial<AppliedSearchCriteria> | AppliedSearchCriteria
): AppliedSearchCriteria => {
  const near = cleanNear(input.near ?? '');

  return {
    q: cleanQuery(input.q ?? ''),
    foodType: cleanList(input.foodType, FOOD_TYPES),
    level: allowed(KASHRUT_LEVELS, input.level ?? '') ? (input.level as string) : '',
    hechsher: cleanList(input.hechsher, HECHSHER_VALUES),
    category: cleanList(input.category, CATEGORIES),
    hideExpired: input.hideExpired === true,
    includeUnknown: input.includeUnknown === true,
    near,
    radiusKm: near ? cleanRadius(input.radiusKm) : null,
  };
};

const firstValue = (params: URLSearchParams, name: string) => {
  const values = params.getAll(name);
  return values.length > 0 ? values[0] : '';
};

const flagIsTrue = (params: URLSearchParams, name: string) => params.getAll(name).some((value) => value === 'true');

const firstAllowed = (params: URLSearchParams, name: string, permitted: readonly string[]) => {
  for (const value of params.getAll(name)) {
    if (allowed(permitted, value)) {
      return value;
    }
  }

  return '';
};

const firstRadius = (params: URLSearchParams) => {
  for (const value of params.getAll('radius')) {
    const radius = cleanRadius(value);

    if (radius !== null) {
      return radius;
    }
  }

  return null;
};

// Reads a browser query string. Unknown, empty, duplicate and malformed values are dropped.
// A radius without a named place is dropped so a shared link cannot keep an orphaned distance.
// קורא מחרוזת כתובת. ערכים לא מוכרים, ריקים או פגומים מושמטים. רדיוס בלי מקום לא נשמר.
export const parseSearchQuery = (search: string): AppliedSearchCriteria => {
  const raw = search.startsWith('?') ? search.slice(1) : search;
  let params: URLSearchParams;

  try {
    params = new URLSearchParams(raw);
  } catch {
    return emptyAppliedSearch();
  }

  return normalizeCriteria({
    q: firstValue(params, 'q'),
    foodType: params.getAll('foodType'),
    level: firstAllowed(params, 'level', KASHRUT_LEVELS),
    hechsher: params.getAll('hechsher'),
    category: params.getAll('category'),
    hideExpired: flagIsTrue(params, 'hideExpired'),
    includeUnknown: flagIsTrue(params, 'includeUnknown'),
    near: firstValue(params, 'near'),
    radiusKm: firstRadius(params),
  });
};

// One canonical string for equivalent criteria. Defaults and coordinates are omitted.
// מחרוזת אחת למצב שקול. ברירות מחדל וקואורדינטות לא נכללות.
export const serializeSearchQuery = (criteria: AppliedSearchCriteria | Partial<AppliedSearchCriteria>) => {
  const normalized = normalizeCriteria(criteria);
  const params = new URLSearchParams();

  if (normalized.q !== '') {
    params.append('q', normalized.q);
  }

  for (const value of normalized.foodType) {
    params.append('foodType', value);
  }

  if (normalized.level !== '') {
    params.append('level', normalized.level);
  }

  for (const value of normalized.hechsher) {
    params.append('hechsher', value);
  }

  for (const value of normalized.category) {
    params.append('category', value);
  }

  if (normalized.hideExpired) {
    params.append('hideExpired', 'true');
  }

  if (normalized.includeUnknown) {
    params.append('includeUnknown', 'true');
  }

  if (normalized.near !== '') {
    params.append('near', normalized.near);
  }

  if (normalized.radiusKm !== null) {
    params.append('radius', String(normalized.radiusKm));
  }

  return params.toString();
};

export const canonicalSearchPath = (criteria: AppliedSearchCriteria | Partial<AppliedSearchCriteria>) => {
  const query = serializeSearchQuery(criteria);
  return query === '' ? '/' : `/?${query}`;
};

const transition = (
  current: AppliedSearchCriteria,
  next: AppliedSearchCriteria,
  history: SearchHistoryMode
): SearchTransition => {
  const criteria = normalizeCriteria(next);

  return {
    criteria,
    history,
    changed: serializeSearchQuery(current) !== serializeSearchQuery(criteria),
  };
};

// Enter and later debounced text updates replace the current history entry.
// Enter ועדכוני טקסט עתידיים מחליפים את רשומת ההיסטוריה הנוכחית.
export const commitDraftText = (current: AppliedSearchCriteria, draft: string): SearchTransition => {
  return transition(current, { ...current, q: draft }, 'replace');
};

// A filter action commits the latest draft text and the filter together.
// פעולת מסנן שומרת את הטקסט האחרון ואת המסנן יחד.
export const commitCriteriaPatch = (
  current: AppliedSearchCriteria,
  draft: string,
  patch: SearchFilterPatch
): SearchTransition => {
  return transition(current, { ...current, ...patch, q: draft }, 'push');
};

export const clearAppliedQuery = (current: AppliedSearchCriteria): SearchTransition => {
  return transition(current, { ...current, q: '' }, 'push');
};

export const clearAppliedFilters = (current: AppliedSearchCriteria, draft: string): SearchTransition => {
  return transition(
    current,
    {
      ...emptyAppliedSearch(),
      q: draft,
    },
    'push'
  );
};

export const clearAppliedSearch = (current: AppliedSearchCriteria): SearchTransition => {
  return transition(current, emptyAppliedSearch(), 'push');
};

// External navigation may replace the field. Our own commit must not eat a trailing space the visitor is still typing.
// ניווט חיצוני יכול להחליף את השדה. שמירה שלנו לא מוחקת רווח שהמבקר עדיין מקליד.
export const draftAfterAppliedChange = (draft: string, previousAppliedQ: string, appliedQ: string) => {
  if (previousAppliedQ === appliedQ || draft.trim() === appliedQ) {
    return draft;
  }

  return appliedQ;
};
