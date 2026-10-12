// NEW (Milestone 4): readable English text for the public kashrut status, so raw values like "UNVERIFIED" or
// "MEHADRIN" never reach the screen. The words VERIFIED, UNVERIFIED and EXPIRED are always spelled out, so the
// difference never depends on color alone. English and Hebrew translation arrives in Milestone 5.
// חדש (אבן דרך 4): טקסט קריא באנגלית לסטטוס הכשרות הציבורי. המילים מאומת / לא מאומת / פג תוקף תמיד כתובות
// במפורש, כך שההבדל לא תלוי רק בצבע. תרגום מלא מגיע באבן דרך 5.
import type { HechsherOption } from '../types/submissions';
import type { KashrutPreview, KashrutPrimary, KashrutStatus } from '../types/search';
import i18n, { activeLanguage } from '../i18n';
import { getHechsherLabel, getKashrutLevelLabel } from './labels';

export const getStatusHeadline = (status: KashrutStatus) => i18n.t(`kashrut.${status}`);

// "Local Rabbinate, Mehadrin". A claim may name only a hechsher or only a level, or neither.
export const describeEvidenceName = (
  evidence: Pick<KashrutPrimary, 'hechsher' | 'hechsherOther' | 'kashrutLevel'>,
  hechsherOptions: HechsherOption[]
) => {
  const parts: string[] = [];

  if (evidence.hechsher) {
    parts.push(getHechsherLabel(evidence.hechsher, evidence.hechsherOther, hechsherOptions));
  }

  if (evidence.kashrutLevel) {
    parts.push(getKashrutLevelLabel(evidence.kashrutLevel));
  }

  return parts.length > 0 ? parts.join(', ') : i18n.t('kashrut.noHechsher');
};

// One line for an autocomplete row: "Verified certificate: Local Rabbinate, Mehadrin (+1 more)".
// שורה אחת לשורת השלמה אוטומטית.
export const describeKashrutShort = (kashrut: KashrutPreview, hechsherOptions: HechsherOption[]) => {
  const headline = getStatusHeadline(kashrut.status);

  if (!kashrut.primary) {
    return headline;
  }

  const more = formatMoreCount(kashrut.moreCount);
  return `${headline}: ${describeEvidenceName(kashrut.primary, hechsherOptions)}${more ? ` (${more})` : ''}`;
};

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_HE = ['ינו׳', 'פבר׳', 'מרץ', 'אפר׳', 'מאי', 'יוני', 'יולי', 'אוג׳', 'ספט׳', 'אוק׳', 'נוב׳', 'דצמ׳'];

// "2026-10-11" -> "11 Oct 2026". Built from the text, not from a Date object, so the day can never shift
// with the browser's time zone (expiration dates are plain calendar dates in Israel).
// בנוי מהטקסט ולא מאובייקט Date, כך שהיום לא יזוז לפי אזור הזמן של הדפדפן.
export const formatDateOnly = (dateOnly: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOnly);

  if (!match) {
    return dateOnly;
  }

  const months = activeLanguage() === 'he' ? MONTHS_HE : MONTHS_EN;
  const month = months[Number(match[2]) - 1];
  return month ? `${Number(match[3])} ${month} ${match[1]}` : dateOnly;
};

export const describeValidity = (primary: KashrutPrimary) => {
  if (!primary.expirationDate) {
    return '';
  }

  const date = formatDateOnly(primary.expirationDate);
  return primary.kind === 'EXPIRED' ? i18n.t('kashrut.expiredOn', { date }) : i18n.t('kashrut.validUntil', { date });
};

export const formatMoreCount = (moreCount: number) => (moreCount > 0 ? i18n.t('kashrut.more', { count: moreCount }) : '');

export const formatDistance = (distanceKm: number | null) =>
  distanceKm === null ? '' : i18n.t('kashrut.kmAway', { km: distanceKm });
