// NEW (Milestone 3): dashboard tab "Pending Teudot": review, approve or reject kashrut certificates.
// A certificate cannot be approved while its restaurant is not approved. A level conflict is only a warning.
// חדש (אבן דרך 3): לשונית "תעודות ממתינות". אי אפשר לאשר תעודה לפני שהמסעדה מאושרת. קונפליקט רמה הוא אזהרה בלבד.
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { approveTeuda, getPendingTeudot, rejectTeuda } from '../../api/adminApi';
import { getErrorMessage } from '../../api/errors';
import { usePagedList } from '../../hooks/usePagedList';
import { describeEmailStatus, describePoints } from '../../utils/adminLabels';
import { getHechsherLabel, getKashrutLevelLabel } from '../../utils/labels';
import type { HechsherOption } from '../../types/submissions';
import FormAlert from '../FormAlert';
import Notices from './Notices';
import type { Notice } from './Notices';
import Pagination from './Pagination';
import RejectForm from './RejectForm';
import TeudaFacts from './TeudaFacts';

interface PendingTeudotTabProps {
  hechsherOptions: HechsherOption[];
}

function PendingTeudotTab({ hechsherOptions }: PendingTeudotTabProps) {
  const { t } = useTranslation();
  const { data, page, setPage, error, loading, reload } = usePagedList(getPendingTeudot);
  const [busyId, setBusyId] = useState('');
  const [rejectingId, setRejectingId] = useState('');
  const [notices, setNotices] = useState<Notice[]>([]);

  const handleApprove = async (teudaId: string) => {
    setBusyId(teudaId);
    setNotices([]);

    try {
      const result = await approveTeuda(teudaId);
      const messages: Notice[] = [
        { kind: 'success', message: t('desk.certificateApproved') },
        { kind: 'success', message: describePoints(result.points) },
      ];

      if (result.conflictWarning.length > 0) {
        messages.push({
          kind: 'warning',
          message: t('desk.sameLevelNote'),
        });
      }

      setNotices(messages);
      reload();
    } catch (err) {
      setNotices([{ kind: 'error', message: getErrorMessage(err, t('desk.approveCertificateFailed')) }]);
    } finally {
      setBusyId('');
    }
  };

  const handleReject = async (teudaId: string, reason: string) => {
    setBusyId(teudaId);
    setNotices([]);

    try {
      const result = await rejectTeuda(teudaId, reason);
      setNotices([{ kind: 'success', message: t('desk.certificateRejected') }, describeEmailStatus(result.emailStatus)]);
      setRejectingId('');
      reload();
    } catch (err) {
      setNotices([{ kind: 'error', message: getErrorMessage(err, t('desk.rejectCertificateFailed')) }]);
    } finally {
      setBusyId('');
    }
  };

  return (
    <section className="space-y-4" aria-label={t('desk.pendingCertificates')}>
      <Notices notices={notices} onDismiss={() => setNotices([])} />
      <FormAlert message={error} />

      {loading && !data && <p className="text-muted">{t('common.loading')}</p>}
      {data && data.items.length === 0 && <p className="text-muted">{t('desk.noneCertificates')}</p>}

      <ul className="space-y-4">
        {data?.items.map((teuda) => (
          <li key={teuda.id} className="space-y-3 rounded border border-soft p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="text-lg font-semibold tracking-tight text-ink">
                {teuda.restaurant?.name || t('desk.unknownRestaurant')}
                {teuda.submittedWithNewRestaurant && (
                  <span className="ms-2 rounded bg-mist px-2 py-0.5 text-xs font-medium text-forest">
                    {t('desk.sentWithNew')}
                  </span>
                )}
              </h3>
              {teuda.restaurant && (
                <Link to={`/admin/restaurants/${teuda.restaurant.id}`} className="text-sm font-medium text-grove underline">
                  {t('desk.viewRestaurant')}
                </Link>
              )}
            </div>

            <TeudaFacts teuda={teuda} hechsherOptions={hechsherOptions} />

            {(!teuda.kashrutLevel || !teuda.expirationDate) && (
              <FormAlert kind="warning" message={t('desk.classifyBeforeApprove')} />
            )}

            {!teuda.restaurantApproved && (
              <FormAlert
                kind="warning"
                message={t('desk.approveRestaurantFirst')}
              />
            )}

            {teuda.conflicts.length > 0 && (
              <FormAlert
                kind="warning"
                message={t('desk.conflictDetail', {
                  level: teuda.kashrutLevel ? getKashrutLevelLabel(teuda.kashrutLevel) : t('desk.notSet'),
                  details: teuda.conflicts
                    .map(
                      (conflict) =>
                        `${getHechsherLabel(conflict.hechsher, conflict.hechsherOther, hechsherOptions)}, ${t('desk.until', { date: conflict.expirationDate })}`
                    )
                    .join('; '),
                })}
              />
            )}

            {rejectingId === teuda.id ? (
              <RejectForm
                idPrefix={`reject-teuda-${teuda.id}`}
                busy={busyId === teuda.id}
                onConfirm={(reason) => handleReject(teuda.id, reason)}
                onCancel={() => setRejectingId('')}
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busyId === teuda.id || !teuda.restaurantApproved || !teuda.kashrutLevel || !teuda.expirationDate}
                  onClick={() => handleApprove(teuda.id)}
                  className="inline-flex min-h-11 items-center rounded-lg bg-forest px-3.5 text-sm font-medium text-white hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busyId === teuda.id
                    ? t('common.working')
                    : teuda.conflicts.length > 0
                      ? t('common.approveAnyway')
                      : t('common.approve')}
                </button>
                <button
                  type="button"
                  disabled={busyId === teuda.id}
                  onClick={() => setRejectingId(teuda.id)}
                  className="inline-flex min-h-11 items-center rounded-lg border border-red-800 bg-white px-3.5 text-sm font-medium text-red-800 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t('common.reject')}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {data && <Pagination page={page} totalPages={data.totalPages} total={data.total} disabled={loading} onPageChange={setPage} />}
    </section>
  );
}

export default PendingTeudotTab;
