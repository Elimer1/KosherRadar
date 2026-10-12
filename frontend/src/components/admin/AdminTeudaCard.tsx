// NEW (Milestone 3): one certificate on the admin restaurant page. The admin can edit its details (including a
// private note), delete it, and approve or reject it if it is still pending.
// חדש (אבן דרך 3): תעודה אחת בדף המסעדה של המנהל. אפשר לערוך פרטים (כולל הערה פרטית), למחוק, ולאשר או לדחות.
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { approveTeuda, deleteTeuda, rejectTeuda, updateTeuda } from '../../api/adminApi';
import { getErrorMessage } from '../../api/errors';
import type { AdminTeuda, ConflictBrief } from '../../types/admin';
import type { FormOptions, TeudaFormValues } from '../../types/submissions';
import { describeEmailStatus, describePoints, getStatusLabel } from '../../utils/adminLabels';
import { teudaToFormValues } from '../../utils/adminForms';
import { getHechsherLabel } from '../../utils/labels';
import FormAlert from '../FormAlert';
import TeudaFields from '../TeudaFields';
import { inputClassName, labelClassName } from '../formStyles';
import type { Notice } from './Notices';
import RejectForm from './RejectForm';
import TeudaFacts from './TeudaFacts';

interface AdminTeudaCardProps {
  teuda: AdminTeuda & { conflicts: ConflictBrief[] };
  options: FormOptions;
  restaurantApproved: boolean;
  // Tells the page what happened and asks it to load the restaurant again.
  onChanged: (notices: Notice[]) => void;
}

function AdminTeudaCard({ teuda, options, restaurantApproved, onChanged }: AdminTeudaCardProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'view' | 'edit' | 'reject'>('view');
  const [values, setValues] = useState<TeudaFormValues>(() => teudaToFormValues(teuda));
  const [adminNote, setAdminNote] = useState(teuda.adminNote || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const title = `${getHechsherLabel(teuda.hechsher, teuda.hechsherOther, options.hechsherOptions)} (${teuda.expirationDate})`;

  const run = async (action: () => Promise<Notice[]>, fallback: string) => {
    setBusy(true);
    setError('');

    try {
      const notices = await action();
      setMode('view');
      onChanged(notices);
    } catch (err) {
      setError(getErrorMessage(err, fallback));
    } finally {
      setBusy(false);
    }
  };

  const handleSave = (event: FormEvent) => {
    event.preventDefault();
    run(async () => {
      await updateTeuda(teuda.id, values, adminNote);
      return [{ kind: 'success', message: t('desk.certificateSaved') }];
    }, t('desk.saveCertificateFailed'));
  };

  const handleApprove = () => {
    run(async () => {
      const result = await approveTeuda(teuda.id);
      const notices: Notice[] = [
        { kind: 'success', message: t('desk.certificateApprovedShort') },
        { kind: 'success', message: describePoints(result.points) },
      ];

      if (result.conflictWarning.length > 0) {
        notices.push({
          kind: 'warning',
          message: t('desk.sameLevelNote'),
        });
      }

      return notices;
    }, t('desk.approveCertificateFailed'));
  };

  const handleReject = (reason: string) => {
    run(async () => {
      const result = await rejectTeuda(teuda.id, reason);
      return [{ kind: 'success', message: t('desk.certificateRejected') }, describeEmailStatus(result.emailStatus)];
    }, t('desk.rejectCertificateFailed'));
  };

  const handleDelete = () => {
    // Deleting is permanent, so the admin has to confirm it.
    if (!window.confirm(t('desk.deleteCertificateConfirm'))) {
      return;
    }

    run(async () => {
      await deleteTeuda(teuda.id);
      return [{ kind: 'success', message: t('desk.certificateDeleted') }];
    }, t('desk.deleteCertificateFailed'));
  };

  return (
    <li className="space-y-3 rounded border border-green-100 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
          {getStatusLabel(teuda.status)}
        </span>
      </div>

      <FormAlert message={error} />

      {mode === 'edit' ? (
        <form onSubmit={handleSave} className="space-y-4">
          <TeudaFields
            idPrefix={`edit-teuda-${teuda.id}`}
            values={values}
            options={options}
            photo={null}
            photoError=""
            disabled={busy}
            hidePhoto
            onChange={(field, value) => setValues((current) => ({ ...current, [field]: value }))}
            onPhotoChange={() => undefined}
          />
          <div>
            <label htmlFor={`edit-teuda-note-${teuda.id}`} className={labelClassName}>
              {t('desk.privateAdmins')}
            </label>
            <textarea
              id={`edit-teuda-note-${teuda.id}`}
              rows={2}
              maxLength={1000}
              disabled={busy}
              value={adminNote}
              onChange={(event) => setAdminNote(event.target.value)}
              className={inputClassName}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
            >
              {busy ? t('auth.saving') : t('common.save')}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setMode('view')}
              className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      ) : (
        <>
          <TeudaFacts teuda={teuda} hechsherOptions={options.hechsherOptions} />

          {teuda.status === 'REJECTED' && teuda.rejectionReason && (
            <p className="text-sm text-gray-700">{t('desk.rejectionReason', { reason: teuda.rejectionReason })}</p>
          )}

          {teuda.status === 'PENDING' && !restaurantApproved && (
            <FormAlert
              kind="warning"
              message={t('desk.cannotApproveYet')}
            />
          )}

          {teuda.status === 'PENDING' && teuda.conflicts.length > 0 && (
            <FormAlert
              kind="warning"
              message={t('desk.conflictShort')}
            />
          )}

          {mode === 'reject' ? (
            <RejectForm
              idPrefix={`reject-card-${teuda.id}`}
              busy={busy}
              onConfirm={handleReject}
              onCancel={() => setMode('view')}
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {teuda.status === 'PENDING' && (
                <>
                  <button
                    type="button"
                    disabled={busy || !restaurantApproved}
                    onClick={handleApprove}
                    title={restaurantApproved ? undefined : t('desk.approveFirstTitle')}
                    className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {t('common.approve')}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setMode('reject')}
                    className="rounded border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    {t('common.reject')}
                  </button>
                </>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => setMode('edit')}
                className="rounded border border-green-300 px-3 py-1.5 text-sm font-medium text-green-800 hover:bg-green-50"
              >
                {t('common.edit')}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleDelete}
                className="rounded border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
              >
                {t('common.delete')}
              </button>
            </div>
          )}
        </>
      )}
    </li>
  );
}

export default AdminTeudaCard;
