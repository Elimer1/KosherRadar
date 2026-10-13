import { useEffect, useState } from 'react';

const matchesWidth = (query: string) => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return true;
  }

  return window.matchMedia(query).matches;
};

// Discovery layout switches at a real viewport width. Tests without matchMedia keep the wide layout.
export function useMinWidth(width: number) {
  const query = `(min-width: ${width}px)`;
  const [matches, setMatches] = useState(() => matchesWidth(query));

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return;
    }

    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
