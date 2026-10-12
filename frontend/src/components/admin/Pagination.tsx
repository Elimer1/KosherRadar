// NEW (Milestone 3): previous / next buttons for the admin lists.
// חדש (אבן דרך 3): כפתורי הקודם / הבא לרשימות הניהול.
import { useTranslation } from 'react-i18next';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  disabled: boolean;
  onPageChange: (page: number) => void;
}

function Pagination({ page, totalPages, total, disabled, onPageChange }: PaginationProps) {
  const { t } = useTranslation();

  if (totalPages <= 1) {
    return <p className="text-sm text-muted">{t('desk.totalOnly', { total })}</p>;
  }

  return (
    <nav className="flex items-center justify-between gap-3 text-sm" aria-label={t('desk.pages')}>
      <button
        type="button"
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="inline-flex min-h-11 items-center rounded-lg border border-forest px-3 font-medium text-grove hover:bg-mist disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t('desk.previous')}
      </button>
      <span className="text-muted">
        {t('desk.pageOf', { page, totalPages, total })}
      </span>
      <button
        type="button"
        disabled={disabled || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="inline-flex min-h-11 items-center rounded-lg border border-forest px-3 font-medium text-grove hover:bg-mist disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t('desk.next')}
      </button>
    </nav>
  );
}

export default Pagination;
