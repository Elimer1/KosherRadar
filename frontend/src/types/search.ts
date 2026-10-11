// NEW (Milestone 4): types for the public search, result cards and autocomplete.
// חדש (אבן דרך 4): טיפוסים לחיפוש הציבורי, לכרטיסי התוצאות ולהשלמה האוטומטית.

export type KashrutStatus = 'VERIFIED' | 'UNVERIFIED' | 'EXPIRED' | 'UNKNOWN';
export type KashrutEvidenceKind = 'VERIFIED' | 'UNVERIFIED' | 'EXPIRED';

// The most important piece of kashrut evidence of a restaurant (certificate or unverified claim).
export interface KashrutPrimary {
  kind: KashrutEvidenceKind;
  hechsher: string | null;
  hechsherOther: string | null;
  kashrutLevel: string | null;
  expirationDate: string | null;
}

// The short kashrut summary sent with every search result.
export interface KashrutPreview {
  status: KashrutStatus;
  primary: KashrutPrimary | null;
  moreCount: number;
  hasRecentExpired: boolean;
}

export interface RestaurantCardData {
  id: string;
  name: string;
  nameHe: string | null;
  nameEn: string | null;
  address: string;
  addressHe: string | null;
  addressEn: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  foodType: string;
  categories: string[];
  kashrut: KashrutPreview;
  distanceKm: number | null;
}

export interface SearchResult {
  items: RestaurantCardData[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  // True when the server stopped looking after its safety limit, so the list may be incomplete.
  capped: boolean;
  search: {
    mode: 'ATLAS' | 'BASIC';
    // True when typo-tolerant search was switched on but failed; the basic search was used instead.
    atlasUnavailable: boolean;
  };
}

export interface RestaurantSuggestion {
  id: string;
  name: string;
  nameHe: string | null;
  nameEn: string | null;
  city: string | null;
  address: string;
  kashrut: KashrutPreview;
}

export interface SearchLocation {
  lat: number;
  lng: number;
}

// Everything the visitor can choose. Text and filters are sent to the server, which filters and sorts.
export interface SearchFilters {
  q: string;
  level: string;
  hechsher: string[];
  foodType: string[];
  category: string[];
  hideExpired: boolean;
  includeUnknown: boolean;
  location: SearchLocation | null;
  radiusKm: number | null;
}

export const emptySearchFilters: SearchFilters = {
  q: '',
  level: '',
  hechsher: [],
  foodType: [],
  category: [],
  hideExpired: false,
  includeUnknown: false,
  location: null,
  radiusKm: null,
};

// The distances the server accepts (spec section 8).
export const RADIUS_OPTIONS_KM = [1, 5, 10, 25, 50];
