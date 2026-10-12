// NEW (Milestone 3): asks the admin for the rejection reason. A reason is required: it is saved and emailed.
// חדש (אבן דרך 3): מבקש מהמנהל את סיבת הדחייה. הסיבה חובה: היא נשמרת ונשלחת במייל.
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { inputClassName, labelClassName } from '../formStyles';

interface RejectFormProps {
  idPrefix: string;
  busy: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

function RejectForm({ idPrefix, busy, onConfirm, onCancel }: RejectFormProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onConfirm(reason.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 rounded border border-red-200 bg-red-50 p-3">
      <label htmlFor={`${idPrefix}-reason`} className={labelClassName}>
        {t('desk.rejectReason')}
      </label>
      <textarea
        id={`${idPrefix}-reason`}
        required
        minLength={3}
        maxLength={1000}
        rows={3}
        disabled={busy}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        className={inputClassName}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={busy || reason.trim().length < 3}
          className="inline-flex min-h-11 items-center rounded-lg bg-red-800 px-3.5 text-sm font-medium text-white hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? t('desk.rejecting') : t('desk.confirmReject')}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onCancel}
          className="rounded border border-soft px-3 py-1.5 text-sm font-medium text-ink hover:bg-gray-50"
        >
          {t('common.cancel')}
        </button>
      </div>
    </form>
  );
}

export default RejectForm;
