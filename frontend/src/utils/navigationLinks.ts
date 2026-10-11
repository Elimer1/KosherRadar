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

// Waze opens the route to exact coordinates. A restaurant without coordinates has no Waze link.
export const buildWazeUrl = (latitude: number | null, longitude: number | null) => {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return null;
  }

  return `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
};
