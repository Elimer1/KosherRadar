// NEW (Milestone 3): sends email through the Resend REST API (rejection reasons, password reset).
// חדש (אבן דרך 3): שליחת מייל דרך Resend (סיבות דחייה ואיפוס סיסמה).
//
// Sending never throws. A moderation decision is already saved when the email is sent, and a mail
// problem must not undo it (spec 6 and 12). Callers get a status and decide what to show the admin.
// השליחה לעולם לא זורקת שגיאה: ההחלטה כבר נשמרה, ותקלת מייל לא מבטלת אותה. הקוראים מקבלים סטטוס.

import { env } from '../config/env.js';

const RESEND_URL = 'https://api.resend.com/emails';
const SEND_TIMEOUT_MS = 10000;

export const EMAIL_SENT = 'SENT';
export const EMAIL_FAILED = 'FAILED';
export const EMAIL_NOT_CONFIGURED = 'NOT_CONFIGURED';

export const isEmailConfigured = () => Boolean(env.resendApiKey && env.emailFrom);

// Plain text only (no HTML), so a restaurant name or reason typed by a user cannot inject markup.
// טקסט פשוט בלבד, בלי HTML, כדי ששם מסעדה או סיבה שהוקלדו לא יזריקו קוד.
export const sendEmailService = async ({ to, subject, text }) => {
  if (!isEmailConfigured()) {
    console.error('Email not sent: RESEND_API_KEY or EMAIL_FROM is not set');
    return EMAIL_NOT_CONFIGURED;
  }

  try {
    const response = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: env.emailFrom, to: [to], subject, text }),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });

    if (!response.ok) {
      const details = await response.text().catch(() => '');
      console.error('Resend rejected the email:', response.status, details.slice(0, 300));
      return EMAIL_FAILED;
    }

    return EMAIL_SENT;
  } catch (error) {
    console.error('Could not reach Resend:', error.message);
    return EMAIL_FAILED;
  }
};

const KIND_LABELS = {
  restaurant: 'restaurant submission',
  certificate: 'kashrut certificate submission',
  report: 'report',
};

// NEW (Milestone 3): the text sent to a contributor when their submission is rejected.
// It contains only the public reason. Admin notes are private and are never passed in.
// חדש (אבן דרך 3): נוסח המייל למשתמש שההגשה שלו נדחתה. מכיל רק את הסיבה, לעולם לא הערות מנהל.
export const buildRejectionEmail = ({ kind, subjectName, reason }) => {
  const label = KIND_LABELS[kind] || 'submission';

  return {
    subject: `Your KosherRadar ${label} was not approved`,
    text: [
      'Hello,',
      '',
      `Thank you for contributing to KosherRadar. Unfortunately your ${label} for "${subjectName}" was not approved.`,
      '',
      `Reason: ${reason}`,
      '',
      'You are welcome to submit corrected information.',
      '',
      'KosherRadar is a community information directory. It does not certify any business as kosher.',
    ].join('\n'),
  };
};

// NEW (Milestone 3): sends the rejection email and returns SENT, FAILED or NOT_CONFIGURED.
// חדש (אבן דרך 3): שולח את מייל הדחייה ומחזיר SENT, FAILED או NOT_CONFIGURED.
export const sendRejectionEmailService = async ({ to, kind, subjectName, reason }) => {
  if (!to) {
    console.error('Rejection email not sent: the submitter has no email address');
    return EMAIL_FAILED;
  }

  const { subject, text } = buildRejectionEmail({ kind, subjectName, reason });
  return sendEmailService({ to, subject, text });
};
