// NEW (Backend QA): short identity for a pending report. The description itself is not indexed.
// חדש (בדיקת שרת): זהות קצרה לדיווח ממתין. הטקסט עצמו לא נכנס לאינדקס.
import { createHash } from 'node:crypto';

// The duplicate check is restaurant, submitter, certificate, and description.
// Description is trimmed because the schema and the submit schema already trim it, and a query uses that trimmed value.
// Report type, photo, and proposed correction are not part of this identity.
// התיאור נחתך כי הסכמה כבר חותכת רווחים, וחיפוש משתמש בערך החתוך.
// סוג הדיווח, התמונה והתיקון המוצע אינם חלק מהזהות.
export const pendingReportFingerprint = ({ description, teuda }) => {
  const text = typeof description === 'string' ? description.trim() : '';
  const teudaId = teuda ? String(teuda) : '';

  return createHash('sha256')
    .update(JSON.stringify({ description: text, teuda: teudaId }), 'utf8')
    .digest('hex');
};
