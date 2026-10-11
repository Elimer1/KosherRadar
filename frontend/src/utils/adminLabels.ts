// NEW (Milestone 3): readable English text for the admin dashboard, so raw values like "SAME_PHONE" or
// "NOT_CONFIGURED" never reach the screen. The full English/Hebrew translation arrives in Milestone 5.
// חדש (אבן דרך 3): טקסט קריא באנגלית ללוח הניהול, כדי שערכים גולמיים לא יוצגו. התרגום המלא מגיע באבן דרך 5.
import type { EmailStatus, KashrutPreviewItem, PointsResult, TeudaVisibility } from '../types/admin';
import type { HechsherOption } from '../types/submissions';
import { getHechsherLabel, getKashrutLevelLabel } from './labels';

const DUPLICATE_REASON_LABELS: Record<string, string> = {
  SAME_PLACE_ID: 'Same Geoapify place',
  SAME_NAME_AND_ADDRESS: 'Same name and address',
  SAME_PHONE: 'Same phone number',
  SIMILAR_NAME_NEARBY: 'Similar name within 300 m',
  SAME_ADDRESS: 'Same address',
};

export const getDuplicateReasonLabel = (reason: string) => DUPLICATE_REASON_LABELS[reason] || reason;

const VISIBILITY_LABELS: Record<TeudaVisibility, string> = {
  VALID: 'Valid',
  RECENT_EXPIRED: 'Expired (public for six months)',
  ADMIN_ONLY: 'Expired over six months ago (admin only)',
};

export const getVisibilityLabel = (visibility: TeudaVisibility) => VISIBILITY_LABELS[visibility];

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  RESOLVED: 'Resolved',
};

export const getStatusLabel = (status: string) => STATUS_LABELS[status] || status;

// What to tell the admin about the email after a rejection. The rejection itself is always saved.
// מה לומר למנהל על המייל אחרי דחייה. הדחייה עצמה תמיד נשמרת.
export const describeEmailStatus = (status: EmailStatus) => {
  if (status === 'SENT') {
    return { kind: 'success' as const, message: 'The user was emailed the reason.' };
  }

  if (status === 'NOT_CONFIGURED') {
    return {
      kind: 'warning' as const,
      message:
        'The rejection is saved, but no email was sent because email (Resend) is not set up on the server. The user was not told the reason.',
    };
  }

  return {
    kind: 'warning' as const,
    message:
      'The rejection is saved, but the email could not be sent. The user was not told the reason. Check the server log.',
  };
};

export const describePoints = (points: PointsResult) => {
  if (points.awarded) {
    return `The contributor received +${points.points} point${points.points === 1 ? '' : 's'}.`;
  }

  const reasons: Record<string, string> = {
    ALREADY_AWARDED: 'Points for this item were already given earlier, so nothing was added.',
    SUBMITTER_IS_NOT_A_USER: 'No points: it was submitted by an admin.',
    SUBMITTER_NOT_FOUND: 'No points: the contributor account no longer exists.',
    NO_CORRECTION_APPLIED: 'No points: no correction was applied.',
    NOT_APPROVED: 'No points yet.',
  };

  return reasons[points.reason] || 'No points were given.';
};

export const describeDaysLeft = (daysLeft: number) => {
  if (daysLeft === 0) {
    return 'Expires today';
  }

  return daysLeft === 1 ? 'Expires tomorrow' : `Expires in ${daysLeft} days`;
};

// One line describing a piece of kashrut evidence the way the public will see it. The words VERIFIED,
// UNVERIFIED and EXPIRED are always spelled out, so the difference never depends on color alone.
// שורה אחת שמתארת ראיית כשרות כפי שהציבור יראה אותה. המילים מאומת / לא מאומת / פג תוקף תמיד כתובות במפורש.
export const describePreviewItem = (item: KashrutPreviewItem, hechsherOptions: HechsherOption[]) => {
  const hechsher = item.hechsher
    ? getHechsherLabel(item.hechsher, item.hechsherOther, hechsherOptions)
    : 'no hechsher named';
  const level = item.kashrutLevel ? `, ${getKashrutLevelLabel(item.kashrutLevel)}` : '';

  if (item.kind === 'VERIFIED') {
    return `Verified certificate: ${hechsher}${level}, valid until ${item.expirationDate}`;
  }

  if (item.kind === 'EXPIRED') {
    return `EXPIRED certificate: ${hechsher}${level}, expired on ${item.expirationDate}`;
  }

  return `Unverified claim (no certificate): ${hechsher}${level}`;
};
