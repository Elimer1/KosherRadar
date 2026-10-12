// Shared presentation. Forest (#174B3A) keeps white button labels above WCAG AA.

export const inputClassName =
  'mt-1 w-full rounded-lg border border-soft bg-white px-3 py-2 text-ink shadow-sm focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/25';

export const labelClassName = 'block text-sm font-medium text-ink';

export const primaryButtonClassName =
  'inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-forest px-4 py-2.5 font-medium text-white shadow-sm hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-60';

export const primaryButtonCompactClassName =
  'inline-flex min-h-11 items-center justify-center rounded-lg bg-forest px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-60';

export const secondaryButtonClassName =
  'inline-flex min-h-11 items-center justify-center rounded-lg border border-forest bg-white px-3.5 py-2 text-sm font-medium text-forest shadow-sm hover:bg-mist disabled:cursor-not-allowed disabled:opacity-60';

export const quietActionClassName =
  'inline-flex min-h-11 items-center justify-center rounded-lg px-2.5 py-2 text-sm font-medium text-forest underline-offset-2 hover:bg-mist hover:underline';

export const textLinkClassName = 'font-medium text-forest underline-offset-2 hover:underline';

export const panelClassName =
  'rounded-2xl border border-soft bg-white shadow-[0_8px_24px_rgba(23,75,58,0.06)]';

export const sectionCardClassName =
  'rounded-2xl border border-soft bg-white p-5 shadow-[0_1px_2px_rgba(23,75,58,0.05)] sm:p-6';

export const pageTitleClassName = 'text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]';

export const dangerButtonClassName =
  'inline-flex min-h-11 items-center justify-center rounded-lg border border-red-800 bg-white px-3.5 py-2 text-sm font-medium text-red-800 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60';

// Appearance only. Search state and chip removal stay with feature/ux-functionality.
export const filterChipClassName =
  'inline-flex min-h-11 items-center gap-1.5 rounded-full border border-soft bg-mist ps-3 pe-2.5 text-sm text-ink';
