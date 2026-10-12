// NEW (Milestone 5): map view helpers that do not need Leaflet, so they can be tested on their own.
// חדש (אבן דרך 5): עזרי תצוגת מפה בלי Leaflet, כדי שאפשר לבדוק אותם לבד.
import type { MapBounds } from '../types/search';

export type DiscoveryView = 'list' | 'map';

const VIEW_KEY = 'kosherradar-view';

// First visit is the list. Only the exact word "map" selects the map, so a bad saved value cannot surprise anyone.
// ביקור ראשון הוא הרשימה. רק המילה "map" בוחרת מפה, כדי שערך שמור פגום לא יפתיע.
export const readSavedView = (): DiscoveryView => {
  try {
    return localStorage.getItem(VIEW_KEY) === 'map' ? 'map' : 'list';
  } catch {
    return 'list';
  }
};

export const saveView = (view: DiscoveryView) => {
  localStorage.setItem(VIEW_KEY, view);
};

// Rough box around Israel, used when the visitor has not chosen a search location.
// תיבה גסה סביב ישראל, כשלא נבחר מיקום חיפוש.
export const ISRAEL_MAP_BOUNDS = {
  south: 29.45,
  west: 34.22,
  north: 33.35,
  east: 35.9,
};

// Closer zoom for a smaller radius. Without a radius, a city-sized view.
// התקרבות גדולה יותר לרדיוס קטן. בלי רדיוס, תצוגה בגודל עיר.
export const zoomForRadius = (radiusKm: number | null) => {
  if (radiusKm === 1) {
    return 15;
  }

  if (radiusKm === 5) {
    return 13;
  }

  if (radiusKm === 10) {
    return 12;
  }

  if (radiusKm === 25) {
    return 11;
  }

  if (radiusKm === 50) {
    return 10;
  }

  return 13;
};

// Leaflet can report a box that crosses the date line (east smaller than west). That box is not queried.
// Leaflet יכול לדווח על תיבה שחוצה את קו התאריך. תיבה כזו לא נשלחת לשרת.
export const boundsCrossDateLine = (bounds: MapBounds) => bounds.east <= bounds.west || bounds.north <= bounds.south;
