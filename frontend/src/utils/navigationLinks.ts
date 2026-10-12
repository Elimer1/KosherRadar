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

// NEW (Milestone 5): share the restaurant page. The browser's share sheet is used when it exists;
// otherwise the address is copied. Cancelling the sheet is not a failure, and nothing is invented.
// חדש (אבן דרך 5): שיתוף דף המסעדה. חלון השיתוף של הדפדפן אם יש, אחרת העתקת הכתובת. ביטול אינו כשל.
export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed';

interface ShareTools {
  share?: (data: { title: string; url: string }) => Promise<void>;
  writeText?: (text: string) => Promise<void>;
}

export const sharePage = async (title: string, url: string, tools?: ShareTools): Promise<ShareResult> => {
  const share =
    tools?.share ??
    (typeof navigator !== 'undefined' && typeof navigator.share === 'function'
      ? navigator.share.bind(navigator)
      : undefined);
  const writeText =
    tools?.writeText ??
    (typeof navigator !== 'undefined' && navigator.clipboard
      ? navigator.clipboard.writeText.bind(navigator.clipboard)
      : undefined);

  if (share) {
    try {
      await share({ title, url });
      return 'shared';
    } catch (error) {
      // DOMException is not an Error in every browser, so the name is checked on its own.
      // DOMException אינו Error בכל דפדפן, לכן בודקים את השם בנפרד.
      const name = typeof error === 'object' && error !== null && 'name' in error ? String(error.name) : '';

      if (name === 'AbortError') {
        return 'cancelled';
      }
    }
  }

  if (!writeText) {
    return 'failed';
  }

  try {
    await writeText(url);
    return 'copied';
  } catch {
    return 'failed';
  }
};

export const restaurantPageUrl = (restaurantId: string, origin: string) => `${origin}/restaurants/${restaurantId}`;

// Waze opens the route to exact coordinates. A restaurant without coordinates has no Waze link.
export const buildWazeUrl = (latitude: number | null, longitude: number | null) => {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return null;
  }

  return `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
};
