// NEW (Milestone 4): returns `value` only after it stopped changing for `delayMs` (used for autocomplete: 300 ms).
// חדש (אבן דרך 4): מחזיר את הערך רק אחרי שהפסיק להשתנות למשך delayMs (להשלמה אוטומטית: 300 מילישניות).
import { useEffect, useState } from 'react';

export const useDebouncedValue = <T>(value: T, delayMs: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);

    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
};
