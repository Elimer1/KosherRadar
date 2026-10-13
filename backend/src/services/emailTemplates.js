import { env } from '../config/env.js';

export const emailLanguage = (language) => language === 'he' ? 'he' : 'en';
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));

// Absolute same-origin links only. HTTP is allowed solely for local development.
export const trustedEmailLink = (link, path) => {
  const base = new URL(env.clientUrl);
  const url = new URL(link);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname);
  if (base.username || base.password || base.search || base.hash
    || !((base.protocol === 'https:') || (base.protocol === 'http:' && local))
    || url.origin !== base.origin || url.username || url.password || url.pathname !== path) {
    throw new Error('Invalid trusted email link');
  }
  return url.href;
};

const copy = {
  en: {
    footer: 'KosherRadar is an information directory, not a kashrut certification authority.',
    reset: 'Reset your KosherRadar password', resetTitle: 'Choose a new password',
    resetBody: 'We received a request to reset your KosherRadar password.',
    validity: (minutes) => `This link works once and expires in ${minutes} minutes.`,
    ignore: 'If you did not request this, you can ignore this email. Your password stays the same.',
    changed: 'Your KosherRadar password was changed',
    changedBody: 'Your password has been changed and previous sessions have been invalidated.',
    warning: 'If you did not make this change, request a password reset immediately.',
    recovery: 'Request a password reset',
    kinds: { restaurant: 'restaurant submission', certificate: 'kashrut certificate submission', report: 'report' },
    rejected: (kind) => `Your KosherRadar ${kind} was not approved`,
    rejectedBody: (kind, name) => `Thank you for contributing. Your ${kind} for "${name}" was not approved.`,
    reason: 'Reason', correction: 'You are welcome to submit corrected information.',
    approved: (kind) => `Your KosherRadar ${kind} was approved`,
    approvedBody: (kind, name) => `Your ${kind} for "${name}" was approved by an administrator.`,
    approvalNote: 'This is a submission review update. It does not certify the business as kosher.',
    fallbackKind: 'submission',
  },
  he: {
    footer: 'KosherRadar הוא מדריך מידע, ולא גוף שמעניק אישורי כשרות.',
    reset: 'איפוס הסיסמה שלכם ב־KosherRadar', resetTitle: 'בחירת סיסמה חדשה',
    resetBody: 'קיבלנו בקשה לאיפוס הסיסמה שלכם ב־KosherRadar.',
    validity: (minutes) => `הקישור פועל פעם אחת ופג אחרי ${minutes} דקות.`,
    ignore: 'אם לא ביקשתם לאפס את הסיסמה, אפשר להתעלם מהודעה זו. הסיסמה שלכם לא תשתנה.',
    changed: 'הסיסמה שלכם ב־KosherRadar שונתה',
    changedBody: 'הסיסמה שלכם שונתה וההתחברויות הקודמות בוטלו.',
    warning: 'אם לא ביצעתם את השינוי, בקשו מיד איפוס סיסמה.',
    recovery: 'בקשת איפוס סיסמה',
    kinds: { restaurant: 'הגשת המסעדה', certificate: 'הגשת תעודת הכשרות', report: 'הגשת הדיווח' },
    rejected: (kind) => `${kind} שלכם ב־KosherRadar לא אושרה`,
    rejectedBody: (kind, name) => `תודה על התרומה שלכם. ${kind} עבור ״${name}״ לא אושרה.`,
    reason: 'סיבה', correction: 'אפשר להגיש מידע מתוקן.',
    approved: (kind) => `${kind} שלכם ב־KosherRadar אושרה`,
    approvedBody: (kind, name) => `${kind} עבור ״${name}״ אושרה על ידי מנהל.`,
    approvalNote: 'זהו עדכון על בדיקת ההגשה. הוא אינו מעניק אישור כשרות לעסק.',
    fallbackKind: 'ההגשה',
  },
};

const renderEmail = ({ language, subject, title, paragraphs, link, button }) => {
  const lang = emailLanguage(language);
  const direction = lang === 'he' ? 'rtl' : 'ltr';
  const align = lang === 'he' ? 'right' : 'left';
  const footer = copy[lang].footer;
  const htmlParagraphs = paragraphs.map((paragraph) => `<p style="margin:0 0 18px;line-height:1.6;overflow-wrap:anywhere">${escapeHtml(paragraph)}</p>`).join('');
  const action = link ? `<p style="margin:24px 0"><a href="${escapeHtml(link)}" style="display:inline-block;background:#174b3a;color:#ffffff;padding:14px 22px;border-radius:8px;text-decoration:none;font-weight:bold">${escapeHtml(button)}</a></p><p style="font-size:13px;line-height:1.5;overflow-wrap:anywhere"><a dir="ltr" href="${escapeHtml(link)}" style="color:#174b3a;word-break:break-all">${escapeHtml(link)}</a></p>` : '';
  return {
    subject,
    text: [title, '', ...paragraphs.flatMap((paragraph) => [paragraph, '']), ...(link ? [button, link, ''] : []), footer].join('\n'),
    html: `<!doctype html><html lang="${lang}" dir="${direction}"><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="utf-8"><title>${escapeHtml(subject)}</title></head><body style="margin:0;background:#f5f7f4;color:#172b24;font-family:Arial,sans-serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #dce5df;border-radius:16px"><tr><td dir="${direction}" style="padding:28px;text-align:${align}"><p dir="ltr" style="margin:0 0 28px;font-size:22px;font-weight:bold;color:#174b3a">KosherRadar</p><h1 style="font-size:24px;line-height:1.3;margin:0 0 24px">${escapeHtml(title)}</h1>${htmlParagraphs}${action}<hr style="border:0;border-top:1px solid #dce5df;margin:28px 0"><p style="margin:0;font-size:13px;line-height:1.6;color:#52645a">${escapeHtml(footer)}</p></td></tr></table></td></tr></table></body></html>`,
  };
};

export const buildPasswordResetEmail = ({ resetLink, validMinutes, language }) => {
  const c = copy[emailLanguage(language)];
  const link = trustedEmailLink(resetLink, '/reset-password');
  const url = new URL(link);
  if (url.hash || [...url.searchParams.keys()].some((key) => key !== 'token')
    || url.searchParams.getAll('token').length !== 1 || !/^[a-f0-9]{64}$/i.test(url.searchParams.get('token') || '')) {
    throw new Error('Invalid password reset email link');
  }
  return renderEmail({ language, subject: c.reset, title: c.resetTitle,
    paragraphs: [c.resetBody, c.validity(validMinutes), c.ignore], link, button: c.resetTitle });
};

export const buildPasswordChangedEmail = ({ language } = {}) => {
  const c = copy[emailLanguage(language)];
  const link = trustedEmailLink(new URL('/forgot-password', env.clientUrl).href, '/forgot-password');
  return renderEmail({ language, subject: c.changed, title: c.changed,
    paragraphs: [c.changedBody, c.warning], link, button: c.recovery });
};

export const buildRejectionEmail = ({ kind, subjectName, reason, language }) => {
  const c = copy[emailLanguage(language)];
  const label = c.kinds[kind] || c.fallbackKind;
  return renderEmail({ language, subject: c.rejected(label), title: c.rejected(label),
    paragraphs: [c.rejectedBody(label, subjectName), `${c.reason}: ${reason}`, c.correction] });
};

export const buildApprovalEmail = ({ kind, subjectName, language }) => {
  const c = copy[emailLanguage(language)];
  const label = c.kinds[kind] || c.fallbackKind;
  return renderEmail({ language, subject: c.approved(label), title: c.approved(label),
    paragraphs: [c.approvedBody(label, subjectName), c.approvalNote] });
};
