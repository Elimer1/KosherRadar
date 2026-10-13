// NEW (Map tiles fix): browser-only tile configuration; never reuse the server geocoding key.
// חדש (תיקון אריחי מפה): הגדרת אריחים לדפדפן בלבד, ללא שימוש במפתח הגאוקודינג של השרת.
export const GEOAPIFY_ATTRIBUTION =
  'Powered by <a href="https://www.geoapify.com/">Geoapify</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>';

// NEW (Map tiles fix): use the OSM Carto style to retain the existing basemap appearance.
// חדש (תיקון אריחי מפה): סגנון OSM Carto שומר על מראה מפת הבסיס הקיים.
export function geoapifyTileOptions(apiKey: string | undefined) {
  const key = apiKey?.trim();
  if (!key) return null;

  return {
    url: `https://maps.geoapify.com/v1/tile/osm-carto/{z}/{x}/{y}.png?apiKey=${encodeURIComponent(key)}`,
    attribution: GEOAPIFY_ATTRIBUTION,
    // Keep the previous Leaflet zoom limit; request standard 256px XYZ tiles.
    maxZoom: 18,
  };
}
