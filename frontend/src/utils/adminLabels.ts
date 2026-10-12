// NEW (Milestone 3): readable English text for the admin dashboard, so raw values like "SAME_PHONE" or
// "NOT_CONFIGURED" never reach the screen. The full English/Hebrew translation arrives in Milestone 5.
// חדש (אבן דרך 3): טקסט קריא באנגלית ללוח הניהול, כדי שערכים גולמיים לא יוצגו. התרגום המלא מגיע באבן דרך 5.
import type { EmailStatus, KashrutPreviewItem, PointsResult, TeudaVisibility } from '../types/admin';
import type { HechsherOption } from '../types/submissions';
import i18n from '../i18n';
import { getHechsherLabel, getKashrutLevelLabel } from './labels';

// NEW (Milestone 5): admin phrases come from the translation files. An unknown code stays as stored.
// חדש (אבן דרך 5): משפטי הניהול מגיעים מקובצי התרגום. קוד לא מוכר נשאר כפי שנשמר.
const translatedOrRaw = (key: string, raw: string) => {
  const text = i18n.t(key);
  return text === key ? raw : text;
};

export const getDuplicateReasonLabel = (reason: string) => translatedOrRaw(`admin.duplicate.${reason}`, reason);

export const getVisibilityLabel = (visibility: TeudaVisibility) => i18n.t(`admin.visibility.${visibility}`);

export const getStatusLabel = (status: string) => translatedOrRaw(`admin.status.${status}`, status);

// What to tell the admin about the email after a rejection. The rejection itself is always saved.
// מה לומר למנהל על המייל אחרי דחייה. הדחייה עצמה תמיד נשמרת.
export const describeEmailStatus = (status: EmailStatus) => {
  if (status === 'SENT') {
    return { kind: 'success' as const, message: i18n.t('admin.emailSent') };
  }

  if (status === 'NOT_CONFIGURED') {
    return { kind: 'warning' as const, message: i18n.t('admin.emailMissing') };
  }

  return { kind: 'warning' as const, message: i18n.t('admin.emailFailed') };
};

export const describePoints = (points: PointsResult) => {
  if (points.awarded) {
    const key = points.points === 1 ? 'admin.pointsGiven' : 'admin.pointsGivenMany';
    return i18n.t(key, { count: points.points });
  }

  const reasons: Record<string, string> = {
    ALREADY_AWARDED: 'admin.pointsAlready',
    SUBMITTER_IS_NOT_A_USER: 'admin.pointsAdmin',
    SUBMITTER_NOT_FOUND: 'admin.pointsMissingUser',
    NO_CORRECTION_APPLIED: 'admin.pointsNoCorrection',
    NOT_APPROVED: 'admin.pointsNotApproved',
  };

  const key = reasons[points.reason];
  return key ? i18n.t(key) : i18n.t('admin.pointsNone');
};

export const describeDaysLeft = (daysLeft: number) => {
  if (daysLeft === 0) {
    return i18n.t('admin.expiresToday');
  }

  return daysLeft === 1 ? i18n.t('admin.expiresTomorrow') : i18n.t('admin.expiresIn', { count: daysLeft });
};

// One line describing a piece of kashrut evidence the way the public will see it. The words VERIFIED,
// UNVERIFIED and EXPIRED are always spelled out, so the difference never depends on color alone.
// שורה אחת שמתארת ראיית כשרות כפי שהציבור יראה אותה. המילים מאומת / לא מאומת / פג תוקף תמיד כתובות במפורש.
export const describePreviewItem = (item: KashrutPreviewItem, hechsherOptions: HechsherOption[]) => {
  const hechsher = item.hechsher
    ? getHechsherLabel(item.hechsher, item.hechsherOther, hechsherOptions)
    : i18n.t('kashrut.noHechsherLower');
  const level = item.kashrutLevel ? `, ${getKashrutLevelLabel(item.kashrutLevel)}` : '';
  const name = `${hechsher}${level}`;

  if (item.kind === 'VERIFIED') {
    return i18n.t('admin.previewVerified', { name, date: item.expirationDate });
  }

  if (item.kind === 'EXPIRED') {
    return i18n.t('admin.previewExpired', { name, date: item.expirationDate });
  }

  return i18n.t('admin.previewClaim', { name });
};
