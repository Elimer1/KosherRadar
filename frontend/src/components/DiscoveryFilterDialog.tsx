import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { quietActionClassName } from './formStyles';

interface DiscoveryFilterDialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusableItems(dialog: HTMLElement) {
  return [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)];
}

// Mobile and tablet filters. Choices apply as they change; this dialog has no Apply step.
function DiscoveryFilterDialog({ open, onClose, children }: DiscoveryFilterDialogProps) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    dialog?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab' || !dialog) {
        return;
      }

      const items = focusableItems(dialog);

      if (items.length === 0) {
        event.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (!dialog.contains(active)) {
        event.preventDefault();
        first.focus();
        return;
      }

      if (event.shiftKey && (active === first || active === dialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[1200] flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div
        ref={dialogRef}
        id="search-filters"
        role="dialog"
        aria-modal="true"
        aria-labelledby="discovery-filter-title"
        tabIndex={-1}
        className="relative flex max-h-[min(100dvh,42rem)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-[0_12px_32px_rgba(24,42,36,0.12)] outline-none sm:rounded-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-soft px-4 py-3 sm:px-5">
          <h2 id="discovery-filter-title" className="text-base font-semibold text-ink">
            {t('home.filters')}
          </h2>
          <button type="button" onClick={onClose} className={quietActionClassName}>
            {t('home.hideFilters')}
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">{children}</div>
      </div>
    </div>
  );
}

export default DiscoveryFilterDialog;
