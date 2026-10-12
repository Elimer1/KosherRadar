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

const toSuggestion = (result) => {
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

  return {
    label: String(result.formatted || address).slice(0, 300),
    address,
    city,
    latitude,
    longitude,
    placeId: String(result.place_id || '').slice(0, 200),
  };
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

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Geoapify answered ${response.status}`);
  }

  const data = await response.json();
  return (data.results || []).map(toSuggestion).filter(Boolean);
};

export const autocompleteAddressesService = async (text, lang = 'en') => {
  if (!env.geoapifyApiKey) {
    return { available: false, suggestions: [] };
  }

  try {
    const suggestions = await requestGeoapify('autocomplete', text, lang);
    return { available: true, suggestions };
  } catch (error) {
    console.error('Address search failed:', error.message);
    return { available: false, suggestions: [] };
  }
};

// NEW (Milestone 5): one place for the public search location. A miss is null. Coordinates are never invented.
// חדש (אבן דרך 5): מקום אחד למיקום החיפוש הציבורי. החטאה היא null. לא ממציאים קואורדינטות.
export const geocodePlaceService = async (text, lang = 'en') => {
  if (!env.geoapifyApiKey) {
    return { available: false, place: null };
  }

  try {
    const [place] = await requestGeoapify('search', text, lang);
    return { available: true, place: place || null };
  } catch (error) {
    console.error('Place geocoding failed:', error.message);
    return { available: false, place: null };
  }
};

// Fills coordinates for a typed address. Returns null when search is off or nothing in Israel matched.
// Never invents a point: a miss stays without coordinates.
export const geocodeAddressService = async ({ address, city }) => {
  if (!env.geoapifyApiKey) {
    return null;
  }

  const text = [address, city, 'Israel'].filter(Boolean).join(', ');

  try {
    const [match] = await requestGeoapify('search', text);

    if (!match) {
      return null;
    }

    return {
      latitude: match.latitude,
      longitude: match.longitude,
      geoapifyPlaceId: match.placeId || undefined,
    };
  } catch (error) {
    console.error('Address geocoding failed:', error.message);
    return null;
  }
};
