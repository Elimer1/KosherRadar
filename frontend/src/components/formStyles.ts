// Shared presentation for visual v2.
// Green #176348 keeps white button labels above WCAG AA (about 7.2:1).
// Class export names are a contract. Other screens import them by these names.
// Shadows stay off ordinary controls. Radius stays at 12px.

export const inputClassName =
  'mt-1 min-h-12 w-full rounded-xl border border-soft bg-white px-3 py-2 text-ink outline-none focus:border-forest focus:ring-2 focus:ring-forest/25';

export const labelClassName = 'block text-sm font-medium text-ink';

export const primaryButtonClassName =
  'inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-forest px-4 py-2.5 font-medium text-white hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-60';

export const primaryButtonCompactClassName =
  'inline-flex min-h-12 items-center justify-center rounded-xl bg-forest px-3.5 py-2 text-sm font-medium text-white hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-60';

export const secondaryButtonClassName =
  'inline-flex min-h-12 items-center justify-center rounded-xl border border-soft bg-white px-3.5 py-2 text-sm font-medium text-ink hover:bg-mist disabled:cursor-not-allowed disabled:opacity-60';

export const quietActionClassName =
  'inline-flex min-h-12 items-center justify-center rounded-xl px-2.5 py-2 text-sm font-medium text-forest underline-offset-2 hover:bg-mist hover:underline';

export const textLinkClassName = 'font-medium text-forest underline-offset-2 hover:underline';

export const panelClassName = 'rounded-xl border border-soft bg-white';

export const sectionCardClassName = 'rounded-xl border border-soft bg-white p-5 sm:p-6';

export const pageTitleClassName = 'text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]';

export const dangerButtonClassName =
  'inline-flex min-h-12 items-center justify-center rounded-xl border border-danger bg-white px-3.5 py-2 text-sm font-medium text-danger hover:bg-danger-soft disabled:cursor-not-allowed disabled:opacity-60';

export const filterChipClassName =
  'inline-flex min-h-12 items-center gap-1.5 rounded-xl border border-soft bg-mist ps-3 pe-2.5 text-sm text-ink';

export const metaChipClassName =
  'inline-flex min-h-7 max-w-full items-center rounded-md bg-mist px-2.5 py-1 text-xs font-medium text-ink';

export const quietChipClassName =
  'inline-flex min-h-7 max-w-full items-center rounded-md bg-canvas px-2.5 py-1 text-xs font-medium text-muted';

export const choiceClassName = 'kr-choice flex min-h-12 items-center gap-3 rounded-lg px-2 py-1 text-sm text-ink';

export const noticeClassName = 'rounded-xl border px-3 py-3 text-sm';

export const warningNoticeClassName = `${noticeClassName} border-amber-ink/30 bg-amber-soft text-amber-ink`;

export const errorNoticeClassName = `${noticeClassName} border-danger/30 bg-danger-soft text-danger`;
