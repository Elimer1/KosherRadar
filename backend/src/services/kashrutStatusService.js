// NEW (Milestone 3): shared kashrut status rules (spec section 5): verified / unverified / expired / unknown.
// חדש (אבן דרך 3): חוקי סטטוס הכשרות המשותפים (סעיף 5): מאומת / לא מאומת / פג תוקף / לא ידוע.
//
// Search, the map, list previews and the detail page must all use these functions, so the same
// restaurant never gets two different statuses in two places.
// חיפוש, מפה, כרטיסי רשימה ועמוד פרטים חייבים להשתמש בפונקציות האלה, כדי שלמסעדה לא יהיו שני סטטוסים.

import { HECHSHER_OTHER } from '../config/constants.js';
import { dateToDateOnly, todayInIsrael } from '../utils/israelDate.js';
import { toSafeHttpUrl } from '../utils/safeUrl.js';
import { getTeudaVisibility, isTeudaPublic } from './teudaRulesService.js';

// Lower number = more important in the preview (spec 5.6):
// verified MEHADRIN, verified RABBANUT, unverified MEHADRIN, unverified RABBANUT, recent expired.
// A claim that names only a hechsher (no level) sits after the two unverified levels.
// מספר נמוך = חשוב יותר בתצוגה המקדימה. טענה בלי רמה מופיעה אחרי שתי הרמות הלא-מאומתות.
const RANK = {
  VERIFIED_MEHADRIN: 1,
  VERIFIED_RABBANUT: 2,
  UNVERIFIED_MEHADRIN: 3,
  UNVERIFIED_RABBANUT: 4,
  UNVERIFIED_NO_LEVEL: 5,
  RECENT_EXPIRED: 6,
};

const sameText = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();

// NEW (Milestone 3): the restaurant's own (unverified) kashrut claim, or null when it made none.
// חדש (אבן דרך 3): הטענה של המסעדה עצמה (לא מאומתת), או null אם אין טענה.
export const getClaim = (restaurant) => {
  const hechsher = restaurant.claimedHechsher || null;
  const kashrutLevel = restaurant.claimedKashrutLevel || null;

  if (!hechsher && !kashrutLevel) {
    return null;
  }

  return {
    hechsher,
    hechsherOther: hechsher === HECHSHER_OTHER ? restaurant.claimedHechsherOther || null : null,
    kashrutLevel,
  };
};

// NEW (Milestone 3): true when a verified/recent certificate already says everything the claim says.
// חדש (אבן דרך 3): אמת כאשר תעודה מאומתת/אחרונה כבר אומרת את כל מה שהטענה אומרת (טענה מיותרת).
export const claimMatchesTeuda = (claim, teuda) => {
  if (claim.kashrutLevel && claim.kashrutLevel !== teuda.kashrutLevel) {
    return false;
  }

  if (claim.hechsher) {
    if (claim.hechsher !== teuda.hechsher) {
      return false;
    }

    if (claim.hechsher === HECHSHER_OTHER && !sameText(claim.hechsherOther, teuda.hechsherOther)) {
      return false;
    }
  }

  return true;
};

const teudaToEvidence = (teuda, visibility) => {
  const isValid = visibility === 'VALID';
  const rankKey = isValid ? `VERIFIED_${teuda.kashrutLevel}` : 'RECENT_EXPIRED';

  return {
    kind: isValid ? 'VERIFIED' : 'EXPIRED',
    rank: RANK[rankKey],
    teudaId: String(teuda._id),
    hechsher: teuda.hechsher,
    hechsherOther: teuda.hechsherOther || null,
    kashrutLevel: teuda.kashrutLevel,
    expirationDate: dateToDateOnly(teuda.expirationDate),
  };
};

const claimToEvidence = (claim) => {
  const rankKey = claim.kashrutLevel ? `UNVERIFIED_${claim.kashrutLevel}` : 'UNVERIFIED_NO_LEVEL';

  return {
    kind: 'UNVERIFIED',
    rank: RANK[rankKey],
    teudaId: null,
    hechsher: claim.hechsher,
    hechsherOther: claim.hechsherOther,
    kashrutLevel: claim.kashrutLevel,
    expirationDate: null,
  };
};

// Same rank: the certificate that is valid longest (verified) or expired most recently comes first.
// באותו דירוג: התעודה שתקפה הכי הרבה זמן (או שפגה הכי לאחרונה) קודמת.
const compareEvidence = (a, b) => {
  if (a.rank !== b.rank) {
    return a.rank - b.rank;
  }

  if (a.expirationDate && b.expirationDate) {
    return b.expirationDate.localeCompare(a.expirationDate);
  }

  return 0;
};

// NEW (Milestone 3): everything the public may know about a restaurant's kashrut, in priority order.
// Input is the restaurant and ALL its teudot (any status, any age). Teudot that are not approved, or
// that expired more than six calendar months ago (admin only), are ignored here.
// חדש (אבן דרך 3): כל מה שהציבור רשאי לדעת על הכשרות, לפי סדר חשיבות. תעודות לא מאושרות או ישנות מדי מתעלמים מהן.
export const buildKashrutSummary = (restaurant, teudot, today = todayInIsrael()) => {
  const publicTeudot = teudot
    .filter((teuda) => isTeudaPublic(teuda, today))
    .map((teuda) => ({ teuda, visibility: getTeudaVisibility(teuda.expirationDate, today) }));

  const items = publicTeudot.map(({ teuda, visibility }) => teudaToEvidence(teuda, visibility));

  // A claim that a valid or recent certificate already repeats is hidden (spec 5.4). A claim about a
  // different level or hechsher stays visible, labeled UNVERIFIED, even next to verified evidence.
  // טענה שתעודה תקפה או אחרונה כבר חוזרת עליה מוסתרת. טענה על רמה/השגחה אחרת נשארת, עם תווית "לא מאומת".
  const claim = getClaim(restaurant);
  const claimIsRedundant = claim && publicTeudot.some(({ teuda }) => claimMatchesTeuda(claim, teuda));

  if (claim && !claimIsRedundant) {
    items.push(claimToEvidence(claim));
  }

  items.sort(compareEvidence);

  const primary = items[0] || null;
  const statusByKind = { VERIFIED: 'VERIFIED', UNVERIFIED: 'UNVERIFIED', EXPIRED: 'EXPIRED' };

  return {
    status: primary ? statusByKind[primary.kind] : 'UNKNOWN',
    primary,
    moreCount: Math.max(0, items.length - 1),
    items,
    // Lets the preview warn when a recent expired certificate is hidden behind a better-ranked item.
    // מאפשר להזהיר כשתעודה שפגה לאחרונה מוסתרת מאחורי פריט מדורג גבוה יותר.
    hasRecentExpired: items.some((item) => item.kind === 'EXPIRED'),
  };
};

// NEW (Milestone 3): the only shape of a teuda that public endpoints may send.
// Never add adminNote, submittedBy, rejectionReason, status history or cloudinaryPublicId here.
// חדש (אבן דרך 3): הצורה היחידה של תעודה שמותר לשלוח בממשק ציבורי. לעולם לא להוסיף הערות מנהל או מזהי משתמש.
export const toPublicTeuda = (teuda, today = todayInIsrael()) => {
  return {
    id: String(teuda._id),
    hechsher: teuda.hechsher,
    hechsherOther: teuda.hechsherOther || null,
    kashrutLevel: teuda.kashrutLevel,
    expirationDate: dateToDateOnly(teuda.expirationDate),
    visibility: getTeudaVisibility(teuda.expirationDate, today),
    // NEW (Milestone 4): the link is re-checked before it is sent (only http/https), see utils/safeUrl.js
    // חדש (אבן דרך 4): הקישור נבדק שוב לפני השליחה (רק http/https)
    photoUrl: toSafeHttpUrl(teuda.photoUrl),
    mashgiachName: teuda.mashgiachName,
    mashgiachPhone: teuda.mashgiachPhone,
  };
};

// NEW (Milestone 3): public certificates of a restaurant, valid first. Old (admin-only) ones are removed.
// חדש (אבן דרך 3): התעודות הציבוריות של מסעדה, תקפות קודם. תעודות ישנות (למנהלים בלבד) מוסרות.
export const getPublicTeudot = (teudot, today = todayInIsrael()) => {
  return teudot
    .filter((teuda) => isTeudaPublic(teuda, today))
    .map((teuda) => toPublicTeuda(teuda, today))
    .sort((a, b) => {
      if (a.visibility !== b.visibility) {
        return a.visibility === 'VALID' ? -1 : 1;
      }
      return b.expirationDate.localeCompare(a.expirationDate);
    });
};

// NEW (Milestone 3): approved certificates that already cover the same kashrut level as `proposed`.
// This is only a warning for the admin (spec 5.8): it never blocks an approval.
// חדש (אבן דרך 3): תעודות מאושרות ותקפות באותה רמת כשרות כמו התעודה המוצעת. אזהרה בלבד, לא חוסמת אישור.
export const findConflictingTeudot = (proposed, approvedTeudot, today = todayInIsrael()) => {
  // A certificate that is already expired cannot conflict with anything.
  if (getTeudaVisibility(proposed.expirationDate, today) !== 'VALID') {
    return [];
  }

  return approvedTeudot
    .filter((other) => String(other._id) !== String(proposed._id))
    .filter((other) => other.status === 'APPROVED' && getTeudaVisibility(other.expirationDate, today) === 'VALID')
    .filter((other) => other.kashrutLevel === proposed.kashrutLevel)
    .map((other) => ({
      id: String(other._id),
      hechsher: other.hechsher,
      hechsherOther: other.hechsherOther || null,
      kashrutLevel: other.kashrutLevel,
      expirationDate: dateToDateOnly(other.expirationDate),
    }));
};

// NEW (Milestone 4): the summary as the visitor sees it when "Hide Expired" is on: expired evidence is removed.
// A restaurant that also has a valid certificate or an unverified claim keeps those (spec 5.7).
// חדש (אבן דרך 4): הסיכום כפי שהמבקר רואה כש"הסתר פג תוקף" פעיל: ראיות שפג תוקפן מוסרות.
export const withoutExpiredEvidence = (summary) => {
  const items = summary.items.filter((item) => item.kind !== 'EXPIRED');
  const primary = items[0] || null;

  return {
    status: primary ? (primary.kind === 'VERIFIED' ? 'VERIFIED' : 'UNVERIFIED') : 'UNKNOWN',
    primary,
    moreCount: Math.max(0, items.length - 1),
    items,
    hasRecentExpired: false,
  };
};

// NEW (Milestone 4): applies the visitor's kashrut filters to one restaurant's summary (spec 5.5 and 5.7).
// Returns the summary to show, or null when the restaurant must not appear in the results.
//   hideExpired     drop expired evidence; a restaurant that has nothing but expired evidence disappears
//   includeUnknown  UNKNOWN restaurants appear only when this is true
//   level / hechsherValues  the SAME piece of evidence (verified, recent expired, or a labeled unverified
//                   claim) must match; a restaurant with no evidence can never match a kashrut filter
// חדש (אבן דרך 4): מחיל את מסנני הכשרות של המבקר על הסיכום של מסעדה אחת. מחזיר את הסיכום להצגה, או null
// כשהמסעדה לא צריכה להופיע. אותה ראיה חייבת להתאים גם לרמה וגם להשגחה; מסעדה בלי ראיות לא תתאים למסנן כשרות.
export const applyKashrutFilters = (summary, { hideExpired, includeUnknown, level, hechsherValues }) => {
  let view = summary;

  if (hideExpired) {
    view = withoutExpiredEvidence(summary);

    // Only expired evidence existed: hiding it must hide the restaurant, not turn it into "unknown".
    // הייתה רק ראיה שפגה: הסתרתה מסתירה את המסעדה, ולא הופכת אותה ל"לא ידוע".
    if (summary.items.length > 0 && view.items.length === 0) {
      return null;
    }
  }

  const hasKashrutFilter = Boolean(level) || hechsherValues.length > 0;

  if (view.status === 'UNKNOWN') {
    return includeUnknown && !hasKashrutFilter ? view : null;
  }

  if (hasKashrutFilter) {
    const matches = view.items.some(
      (item) =>
        (!level || item.kashrutLevel === level) &&
        (hechsherValues.length === 0 || hechsherValues.includes(item.hechsher))
    );

    if (!matches) {
      return null;
    }
  }

  return view;
};
