import { api } from './axiosInstance';

export interface AddressSuggestion {
  label: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  placeId: string;
}

export const searchAddresses = async (text: string) => {
  const response = await api.get<{ available: boolean; suggestions: AddressSuggestion[] }>('/places/autocomplete', {
    params: { text },
  });
  return response.data;
};
