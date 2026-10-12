import { api } from './axiosInstance';

export interface AddressSuggestion {
  label: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  placeId: string;
}

export const searchAddresses = async (text: string, lang: PlaceLanguage) => {
  const response = await api.get<{ available: boolean; suggestions: AddressSuggestion[] }>('/places/autocomplete', {
    params: { text, lang },
  });
  return response.data;
};

export type PlaceLanguage = 'en' | 'he';

// NEW (Milestone 5): public place lookup for the home-page location field. No login.
// חדש (אבן דרך 5): חיפוש מקום ציבורי לשדה המיקום בדף הבית. בלי התחברות.
export const suggestPlaces = async (text: string, lang: PlaceLanguage, signal: AbortSignal) => {
  const response = await api.get<{ available: boolean; suggestions: AddressSuggestion[] }>('/places/suggest', {
    params: { text, lang },
    signal,
  });
  return response.data;
};

export const geocodePlace = async (text: string, lang: PlaceLanguage) => {
  const response = await api.get<{
    available: boolean;
    place: AddressSuggestion | null;
    reason?: 'matched' | 'ambiguous' | 'not_found' | 'unavailable';
  }>('/places/geocode', {
    params: { text, lang },
  });
  return response.data;
};
