// Address search through Geoapify. The API key never leaves the server.
// Without a key, callers get available: false and the form falls back to a typed address.
import { env } from '../config/env.js';
import { ISRAEL_BOUNDS } from '../config/constants.js';

const ENDPOINTS = {
  autocomplete: 'https://api.geoapify.com/v1/geocode/autocomplete',
  search: 'https://api.geoapify.com/v1/geocode/search',
};

const insideIsrael = (latitude, longitude) =>
  typeof latitude === 'number' &&
  typeof longitude === 'number' &&
  latitude >= ISRAEL_BOUNDS.minLat &&
  latitude <= ISRAEL_BOUNDS.maxLat &&
  longitude >= ISRAEL_BOUNDS.minLng &&
  longitude <= ISRAEL_BOUNDS.maxLng;

const PRECISE_MATCH_TYPES = new Set(['full_match', 'inner_part', 'match_by_building']);
const CITY_PLACE_TYPES = new Set(['city', 'town', 'village', 'municipality']);
const COARSE_PLACE_TYPES = new Set([...CITY_PLACE_TYPES, 'street', 'suburb', 'district', 'county', 'state', 'country', 'postcode']);
const MIN_CONFIDENCE = 0.8;
const CLEAR_CONFIDENCE_GAP = 0.2;
export const GEOAPIFY_TIMEOUT_MS = 5000;

const toPlace = (result) => {
  const latitude = result.lat;
  const longitude = result.lon;

  if (!insideIsrael(latitude, longitude)) {
    return null;
  }

  const address = String(result.address_line1 || result.formatted || '').trim().slice(0, 250);
  const city = String(result.city || result.town || result.village || result.municipality || '').trim().slice(0, 100);

  if (!address) {
    return null;
  }

  const confidence = typeof result.rank?.confidence === 'number' ? result.rank.confidence : null;

  return {
    label: String(result.formatted || address).slice(0, 300),
    address,
    city,
    latitude,
    longitude,
    placeId: String(result.place_id || '').slice(0, 200),
    confidence,
    matchType: typeof result.rank?.match_type === 'string' ? result.rank.match_type : '',
    resultType: typeof result.result_type === 'string' ? result.result_type : '',
  };
};

const toPublicSuggestion = (place) => ({
  label: place.label,
  address: place.address,
  city: place.city,
  latitude: place.latitude,
  longitude: place.longitude,
  placeId: place.placeId,
});

const isPrecisePlace = (place) =>
  place.confidence !== null && place.confidence >= MIN_CONFIDENCE && PRECISE_MATCH_TYPES.has(place.matchType) && !COARSE_PLACE_TYPES.has(place.resultType);

const isSearchArea = (place) => place.confidence !== null && place.confidence >= MIN_CONFIDENCE &&
  Boolean(place.city) && (CITY_PLACE_TYPES.has(place.resultType) || place.matchType === 'match_by_city');

// NEW (Audit M1): a pin is stored only for one precise Geoapify hit, or a precise hit clearly ahead of the next.
// Confidence is Geoapify's 0–1 rank.confidence. A street-only or city-only match is not a building pin.
// A result with no rank is refused. The first row is never accepted just because it is first.
// חדש (ביקורת M1): נשמרת נקודה רק להתאמה מדויקת אחת, או להתאמה מדויקת שברור שהיא טובה מהבאה.
export const selectUnambiguousPlace = (places, { allowArea = false } = {}) => {
  // Unknown/invalid confidence cannot establish that a competing address is worse.
  if (places.some(place => !Number.isFinite(place.confidence) || place.confidence < 0 || place.confidence > 1)) return null;
  const ranked = [...places]
    .sort((left, right) => right.confidence - left.confidence || left.placeId.localeCompare(right.placeId));

  const best = ranked[0];
  if (!best || !(isPrecisePlace(best) || (allowArea && isSearchArea(best)))) {
    return null;
  }

  if (ranked.length === 1) {
    return best;
  }

  // 1 - 0.8 is represented just below 0.2; tolerate only machine rounding.
  if (best.confidence - ranked[1].confidence + Number.EPSILON * 4 >= CLEAR_CONFIDENCE_GAP) {
    return best;
  }

  return null;
};

// NEW (Milestone 5): `lang` asks Geoapify for a Hebrew or English place name when it has one.
// A missing translation is left as Geoapify sent it. This code never invents a translated name.
// חדש (אבן דרך 5): lang מבקש שם מקום בעברית או באנגלית כשיש כזה. לא ממציאים תרגום.
const requestGeoapify = async (kind, text, lang = 'en') => {
  const url = new URL(ENDPOINTS[kind]);
  url.searchParams.set('text', text);
  url.searchParams.set('filter', 'countrycode:il');
  url.searchParams.set('limit', '5');
  url.searchParams.set('format', 'json');
  url.searchParams.set('lang', lang === 'he' ? 'he' : 'en');
  url.searchParams.set('apiKey', env.geoapifyApiKey);

  const controller = new AbortController();
  let timer;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error('Geoapify request timed out'));
    }, GEOAPIFY_TIMEOUT_MS);
  });
  try {
    // Bound both headers and body, even when a transport ignores cancellation.
    return await Promise.race([
      (async () => {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`Geoapify answered ${response.status}`);
        const data = await response.json();
        return (data.results || []).map(toPlace).filter(Boolean);
      })(),
      deadline,
    ]);
  } finally {
    clearTimeout(timer);
  }
};

const autocompleteService = async (text, lang, allowArea) => {
  if (!env.geoapifyApiKey) {
    return { available: false, suggestions: [] };
  }

  try {
    const suggestions = (await requestGeoapify('autocomplete', text, lang))
      .filter(place => allowArea || (!COARSE_PLACE_TYPES.has(place.resultType) && !['match_by_city', 'match_by_street', 'match_by_postcode'].includes(place.matchType)))
      .map(toPublicSuggestion);
    return { available: true, suggestions };
  } catch (error) {
    console.error('Address search failed:', error.message);
    return { available: false, suggestions: [] };
  }
};

export const autocompleteAddressesService = (text, lang = 'en') => autocompleteService(text, lang, false);
export const suggestPlacesService = (text, lang = 'en') => autocompleteService(text, lang, true);

// NEW (Milestone 5): one place for the public search location. A miss is null. Coordinates are never invented.
// חדש (אבן דרך 5): מקום אחד למיקום החיפוש הציבורי. החטאה היא null. לא ממציאים קואורדינטות.
export const geocodePlaceService = async (text, lang = 'en') => {
  if (!env.geoapifyApiKey) {
    return { available: false, place: null, reason: 'unavailable' };
  }

  try {
    const places = await requestGeoapify('search', text, lang);
    const match = selectUnambiguousPlace(places, { allowArea: true });

    if (!match) {
      return {
        available: true,
        place: null,
        reason: places.length === 0 ? 'not_found' : 'ambiguous',
      };
    }

    return { available: true, place: toPublicSuggestion(match), reason: 'matched' };
  } catch (error) {
    console.error('Place geocoding failed:', error.message);
    return { available: false, place: null, reason: 'unavailable' };
  }
};

// NEW (Audit M1): a typed address is pinned only by selectUnambiguousPlace. The caller saves the text either way.
// חדש (ביקורת M1): כתובת שהוקלדה מקבלת נקודה רק דרך selectUnambiguousPlace. הטקסט נשמר בכל מקרה.
export const geocodeAddressService = async ({ address, city, lang = 'en' }) => {
  if (!env.geoapifyApiKey) {
    return { status: 'unavailable' };
  }

  const text = [address, city, 'Israel'].filter(Boolean).join(', ');

  try {
    const places = await requestGeoapify('search', text, lang);
    const match = selectUnambiguousPlace(places);

    if (!match) {
      return { status: places.length === 0 ? 'not_found' : 'ambiguous' };
    }

    return {
      status: 'matched',
      latitude: match.latitude,
      longitude: match.longitude,
      geoapifyPlaceId: match.placeId || undefined,
    };
  } catch (error) {
    console.error('Address geocoding failed:', error.message);
    return { status: 'unavailable' };
  }
};
