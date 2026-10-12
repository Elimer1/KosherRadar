// NEW (Milestone 4): distance helpers for the search sorted by distance.
// חדש (אבן דרך 4): פונקציות מרחק למיון תוצאות החיפוש לפי מרחק.
const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees) => (degrees * Math.PI) / 180;

// Straight-line ("as the crow flies") distance in kilometers between two points (haversine formula).
// מרחק אווירי בקילומטרים בין שתי נקודות (נוסחת האברסין).
export const distanceInKm = (fromLat, fromLng, toLat, toLng) => {
  const latDifference = toRadians(toLat - fromLat);
  const lngDifference = toRadians(toLng - fromLng);

  const a =
    Math.sin(latDifference / 2) ** 2 +
    Math.cos(toRadians(fromLat)) * Math.cos(toRadians(toLat)) * Math.sin(lngDifference / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
};

// `$centerSphere` wants the radius in radians of the Earth, not in kilometers.
export const kmToRadians = (km) => km / EARTH_RADIUS_KM;

// NEW (Milestone 5): visible map rectangle as a GeoJSON box. Order is [longitude, latitude].
// חדש (אבן דרך 5): מלבן המפה הנראה כתיבת GeoJSON. הסדר הוא [קו אורך, קו רוחב].
export const boundsToGeoBox = (bounds) => [
  [bounds.west, bounds.south],
  [bounds.east, bounds.north],
];
