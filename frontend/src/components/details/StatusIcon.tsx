// NEW (Visual v2): restaurant details presentation; existing contracts and status labels stay authoritative.
// חדש (עיצוב 2): תצוגת פרטי מסעדה תוך שמירה על חוזים ותוויות קיימים.
import type { KashrutStatus } from '../../types/search';

interface StatusIconProps {
  status: KashrutStatus;
}

function StatusIcon({ status }: StatusIconProps) {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    'aria-hidden': true as const,
    focusable: false as const,
  };

  if (status === 'VERIFIED') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
        <path d="M8 12.5 10.5 15 16 9.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (status === 'UNVERIFIED') {
    return (
      <svg {...common}>
        <path d="M12 4.5 20.5 19H3.5L12 4.5Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M12 10v4.25" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <circle cx="12" cy="16.6" r="0.8" fill="currentColor" />
      </svg>
    );
  }

  if (status === 'EXPIRED') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
        <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path d="M9.2 9.2a2.8 2.8 0 1 1 3.6 2.7c-.7.3-1.1.8-1.1 1.5V14.2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="11.7" cy="16.8" r="0.8" fill="currentColor" />
    </svg>
  );
}

export function DirectionsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M12 3.5 19 10l-5 .8L12 19l-2-8.2L5 10l7-6.5Z" fill="currentColor" />
    </svg>
  );
}

export default StatusIcon;
