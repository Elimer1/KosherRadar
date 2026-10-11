// NEW (Milestone 4): safe "Call" and "Waze" links for the result cards (and later the map popups).
// חדש (אבן דרך 4): קישורי "התקשר" ו-Waze בטוחים לכרטיסי התוצאות.

// Keeps only the characters a phone number can have, so nothing else can end up inside the tel: link.
// משאיר רק תווים שיכולים להופיע במספר טלפון, כדי שדבר אחר לא ייכנס לקישור tel:.
export const buildTelUrl = (phone: string | null) => {
  if (!phone) {
    return null;
  }

  const cleaned = phone.replace(/[^0-9+]/g, '');
  return cleaned === '' ? null : `tel:${cleaned}`;
};

// NEW (Milestone 4): Google Maps link for the detail page. Exact coordinates are preferred; without them the
// address text is searched. The text is encoded, so it cannot add parameters to the link.
// חדש (אבן דרך 4): קישור Google Maps. עדיפות לקואורדינטות מדויקות; בלי אותן מחפשים לפי הכתובת (מקודדת).
export const buildGoogleMapsUrl = (latitude: number | null, longitude: number | null, address: string) => {
  const query =
    typeof latitude === 'number' && typeof longitude === 'number' ? `${latitude},${longitude}` : address.trim();

  return query === '' ? null : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

// Waze opens the route to exact coordinates. A restaurant without coordinates has no Waze link.
export const buildWazeUrl = (latitude: number | null, longitude: number | null) => {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return null;
  }

  return `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
};
