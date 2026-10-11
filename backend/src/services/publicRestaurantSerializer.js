// NEW (Milestone 4): the only shapes of a restaurant that PUBLIC endpoints may send (search, suggestions, details).
// Never add adminNote, submittedBy, rejectionReason, possibleDuplicates, normalized copies or the search
// fields here. Certificates are serialized by kashrutStatusService (`toPublicTeuda`).
// חדש (אבן דרך 4): הצורות היחידות של מסעדה שמותר לשלוח בממשק ציבורי. לעולם לא להוסיף הערות מנהל, מזהי משתמש,
// כפילויות אפשריות או שדות חיפוש. תעודות עוברות דרך kashrutStatusService.

import { toSafeHttpUrl } from '../utils/safeUrl.js';

const toNullable = (value) => value || null;

// The short form of the kashrut summary used on cards and in suggestions: only the primary item and "+N more".
// הצורה הקצרה של סיכום הכשרות לכרטיסים והצעות: רק הפריט הראשי ו-"+N נוספים".
const toKashrutPreview = (summary) => {
  const { primary } = summary;

  return {
    status: summary.status,
    primary: primary
      ? {
          kind: primary.kind,
          hechsher: primary.hechsher,
          hechsherOther: primary.hechsherOther,
          kashrutLevel: primary.kashrutLevel,
          expirationDate: primary.expirationDate,
        }
      : null,
    moreCount: summary.moreCount,
    // True when an expired certificate is hidden behind a better-ranked item, so the card can mention it.
    // אמת כשתעודה שפג תוקפה מוסתרת מאחורי פריט מדורג גבוה יותר, כדי שהכרטיס יזכיר אותה.
    hasRecentExpired: summary.hasRecentExpired,
  };
};

export const toPublicRestaurantCard = (restaurant, summary, distanceKm) => {
  return {
    id: String(restaurant._id),
    name: restaurant.name,
    nameHe: toNullable(restaurant.nameHe),
    nameEn: toNullable(restaurant.nameEn),
    address: restaurant.address,
    addressHe: toNullable(restaurant.addressHe),
    addressEn: toNullable(restaurant.addressEn),
    city: toNullable(restaurant.city),
    latitude: restaurant.latitude ?? null,
    longitude: restaurant.longitude ?? null,
    phone: toNullable(restaurant.phone),
    foodType: restaurant.foodType,
    categories: restaurant.categories || [],
    kashrut: toKashrutPreview(summary),
    distanceKm: distanceKm === null ? null : Math.round(distanceKm * 10) / 10,
  };
};

// NEW (Milestone 4): the full public page of one restaurant (spec section 10). `summary` is the complete
// kashrut summary (every item, in priority order) and `publicTeudot` are the certificates the public may see.
// Links are re-checked here, and the Cloudinary public id of a photo is never sent.
// חדש (אבן דרך 4): הדף הציבורי המלא של מסעדה. הקישורים נבדקים שוב כאן, ומזהה Cloudinary של תמונה לעולם לא נשלח.
export const toPublicRestaurantDetails = (restaurant, summary, publicTeudot) => {
  return {
    id: String(restaurant._id),
    name: restaurant.name,
    nameHe: toNullable(restaurant.nameHe),
    nameEn: toNullable(restaurant.nameEn),
    address: restaurant.address,
    addressHe: toNullable(restaurant.addressHe),
    addressEn: toNullable(restaurant.addressEn),
    city: toNullable(restaurant.city),
    latitude: restaurant.latitude ?? null,
    longitude: restaurant.longitude ?? null,
    phone: toNullable(restaurant.phone),
    website: toSafeHttpUrl(restaurant.website),
    foodType: restaurant.foodType,
    categories: restaurant.categories || [],
    foodKeywords: restaurant.foodKeywords || [],
    kosharotUrl: toSafeHttpUrl(restaurant.kosharotUrl),
    kashrut: {
      status: summary.status,
      primary: toKashrutPreview(summary).primary,
      moreCount: summary.moreCount,
      hasRecentExpired: summary.hasRecentExpired,
      // Every piece of evidence: verified and expired certificates, and unverified claims (teudaId is null).
      items: summary.items,
    },
    teudot: publicTeudot,
  };
};

// Autocomplete rows: name, place and the primary kashrut label (spec section 8).
// שורות השלמה אוטומטית: שם, מקום ותווית הכשרות הראשית.
export const toRestaurantSuggestion = (card) => {
  return {
    id: card.id,
    name: card.name,
    nameHe: card.nameHe,
    nameEn: card.nameEn,
    city: card.city,
    address: card.address,
    kashrut: card.kashrut,
  };
};
