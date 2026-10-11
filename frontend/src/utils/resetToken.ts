// NEW (Milestone 3): reads the password reset token from the page address (?token=...).
// A token that does not look right (not 64 hex characters) is treated as missing, so the page can say
// "this link is not valid" without calling the server.
// חדש (אבן דרך 3): קורא את טוקן איפוס הסיסמה מכתובת הדף. טוקן שלא נראה תקין נחשב חסר.
export const readResetToken = (search: string) => {
  const token = new URLSearchParams(search).get('token') || '';
  return /^[a-f0-9]{64}$/i.test(token) ? token : '';
};
