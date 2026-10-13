import { geocodeAddressService } from './placesService.js';

// Explicit admin coordinates are authoritative. A carried-over pin or provider ID
// cannot identify a new address unless replaced by a new selection.
export const resolveAdminRestaurantLocation = async (data, existing) => {
  const addressChanged = data.address !== existing.address || (data.city || '') !== (existing.city || '');
  const hasCoordinates = Number.isFinite(data.latitude) && Number.isFinite(data.longitude);
  const sameCoordinates = data.latitude === existing.latitude && data.longitude === existing.longitude;
  const samePlaceId = data.geoapifyPlaceId === existing.geoapifyPlaceId;
  const carriedPin = addressChanged && sameCoordinates && samePlaceId;
  if (hasCoordinates && !carriedPin) {
    return {
      data: { ...data, geoapifyPlaceId: (addressChanged || !sameCoordinates) && samePlaceId ? undefined : data.geoapifyPlaceId },
      locationStatus: 'provided',
    };
  }
  const located = await geocodeAddressService({ address: data.address, city: data.city });
  return {
    data: {
      ...data,
      latitude: located.status === 'matched' ? located.latitude : undefined,
      longitude: located.status === 'matched' ? located.longitude : undefined,
      geoapifyPlaceId: located.status === 'matched' ? located.geoapifyPlaceId : undefined,
    },
    locationStatus: located.status,
  };
};
