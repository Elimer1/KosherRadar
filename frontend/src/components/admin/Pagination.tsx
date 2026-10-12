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
    return <p className="text-sm text-gray-500">{t('desk.totalOnly', { total })}</p>;
  }

  return (
    <nav className="flex items-center justify-between gap-3 text-sm" aria-label={t('desk.pages')}>
      <button
        type="button"
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded border border-green-600 px-3 py-1.5 font-medium text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t('desk.previous')}
      </button>
      <span className="text-gray-600">
        {t('desk.pageOf', { page, totalPages, total })}
      </span>
      <button
        type="button"
        disabled={disabled || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded border border-green-600 px-3 py-1.5 font-medium text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t('desk.next')}
      </button>
    </nav>
  );
}

export default Pagination;
