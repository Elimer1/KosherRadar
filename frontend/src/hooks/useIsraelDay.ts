// NEW (Agent 3): refresh date-sensitive server data when Israel's calendar day changes.
// חדש (סוכן 3): רענון מידע תלוי תאריך עם שינוי היום בישראל.
import { useEffect, useState } from 'react';

const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jerusalem', year: 'numeric', month: '2-digit', day: '2-digit',
});
const todayInIsrael = () => formatter.format(new Date());

export const useIsraelDay = () => {
  const [day, setDay] = useState(todayInIsrael);
  useEffect(() => {
    const update = () => { setDay(todayInIsrael()); };
    const onVisible = () => { if (document.visibilityState === 'visible') update(); };
    // Background timers can be suspended; check again as soon as the page returns.
    const timer = window.setInterval(update, 60_000);
    window.addEventListener('focus', update);
    document.addEventListener('visibilitychange', onVisible);
    update();
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', update);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
  return day;
};
