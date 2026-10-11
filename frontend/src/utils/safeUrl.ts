// NEW (Milestone 4): a link from the server is shown as a clickable link only when it is http or https.
// The server already checks this; this is a second check in the browser (defense in depth).
// חדש (אבן דרך 4): קישור מהשרת מוצג כלחיץ רק אם הוא http או https. השרת כבר בודק, וזו בדיקה שנייה בדפדפן.
export const isSafeHttpUrl = (value: string | null | undefined): value is string => {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};
