// NEW (Milestone 4): sends a link to the public only when it is a plain http or https address.
// חדש (אבן דרך 4): שולח קישור לציבור רק אם הוא כתובת http או https רגילה.
//
// Links are checked when they are saved (httpUrlField), and again here before they are sent, so a value
// written straight into the database (for example "javascript:alert(1)") can never reach a visitor's browser.
// קישורים נבדקים בשמירה וגם כאן לפני השליחה, כך שערך שנכתב ישירות למסד הנתונים לא יגיע לדפדפן של מבקר.
export const toSafeHttpUrl = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch (error) {
    return null;
  }
};
