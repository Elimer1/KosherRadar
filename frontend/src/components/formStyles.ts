// Shared presentation. Forest (#1A5C43) keeps white button labels above WCAG AA.
// Class export names are a contract. Other screens import them by these names.

export const inputClassName =
  'mt-1 min-h-11 w-full rounded-xl border border-soft bg-white px-3 py-2 text-ink shadow-sm outline-none focus:border-forest focus:ring-2 focus:ring-forest/20';

export const labelClassName = 'block text-sm font-medium text-ink';

export const primaryButtonClassName =
  'inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-forest px-4 py-2.5 font-medium text-white shadow-sm hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-60';

export const primaryButtonCompactClassName =
  'inline-flex min-h-11 items-center justify-center rounded-xl bg-forest px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-60';

export const secondaryButtonClassName =
  'inline-flex min-h-11 items-center justify-center rounded-xl border border-soft bg-white px-3.5 py-2 text-sm font-medium text-ink shadow-sm hover:bg-mist disabled:cursor-not-allowed disabled:opacity-60';

export const quietActionClassName =
  'inline-flex min-h-11 items-center justify-center rounded-xl px-2.5 py-2 text-sm font-medium text-forest underline-offset-2 hover:bg-mist hover:underline';

export const textLinkClassName = 'font-medium text-forest underline-offset-2 hover:underline';

export const panelClassName =
  'rounded-2xl border border-soft bg-white shadow-[0_12px_32px_rgba(28,36,32,0.06)]';

export const sectionCardClassName =
  'rounded-2xl border border-soft bg-white p-5 shadow-[0_1px_2px_rgba(28,36,32,0.04)] sm:p-6';

export const pageTitleClassName = 'text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]';

export const dangerButtonClassName =
  'inline-flex min-h-11 items-center justify-center rounded-xl border border-red-800 bg-white px-3.5 py-2 text-sm font-medium text-red-800 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60';

// Appearance only. Search state and chip removal stay with the search criteria.
export const filterChipClassName =
  'inline-flex min-h-11 items-center gap-1.5 rounded-full border border-soft bg-mist ps-3 pe-2.5 text-sm text-ink';

export const metaChipClassName =
  'inline-flex min-h-7 max-w-full items-center rounded-full bg-mist px-2.5 py-1 text-xs font-medium text-ink';

export const quietChipClassName =
  'inline-flex min-h-7 max-w-full items-center rounded-full bg-canvas px-2.5 py-1 text-xs font-medium text-muted';

export const choiceClassName =
  'kr-choice flex min-h-11 items-center gap-3 rounded-xl px-2 py-1 text-sm text-ink';

export const noticeClassName = 'rounded-2xl border px-3 py-3 text-sm';

export const warningNoticeClassName = `${noticeClassName} border-amber-300 bg-amber-50 text-amber-ink`;

export const errorNoticeClassName = `${noticeClassName} border-red-200 bg-red-50 text-red-900`;
