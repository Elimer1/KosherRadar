// NEW (Milestone 3): dashboard tab "Pending Teudot": review, approve or reject kashrut certificates.
// A certificate cannot be approved while its restaurant is not approved. A level conflict is only a warning.
// חדש (אבן דרך 3): לשונית "תעודות ממתינות". אי אפשר לאשר תעודה לפני שהמסעדה מאושרת. קונפליקט רמה הוא אזהרה בלבד.
import { useState } from 'react';
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
        { kind: 'success', message: 'Certificate approved. It is now public.' },
        { kind: 'success', message: describePoints(result.points) },
      ];

      if (result.conflictWarning.length > 0) {
        messages.push({
          kind: 'warning',
          message: 'Note: another valid certificate with the same level already exists for this restaurant.',
        });
      }

      setNotices(messages);
      reload();
    } catch (err) {
      setNotices([{ kind: 'error', message: getErrorMessage(err, 'Could not approve the certificate.') }]);
    } finally {
      setBusyId('');
    }
  };

  const handleReject = async (teudaId: string, reason: string) => {
    setBusyId(teudaId);
    setNotices([]);

    try {
      const result = await rejectTeuda(teudaId, reason);
      setNotices([{ kind: 'success', message: 'Certificate rejected.' }, describeEmailStatus(result.emailStatus)]);
      setRejectingId('');
      reload();
    } catch (err) {
      setNotices([{ kind: 'error', message: getErrorMessage(err, 'Could not reject the certificate.') }]);
    } finally {
      setBusyId('');
    }
  };

  return (
    <section className="space-y-4" aria-label="Pending certificates">
      <Notices notices={notices} onDismiss={() => setNotices([])} />
      <FormAlert message={error} />

      {loading && !data && <p className="text-gray-600">Loading...</p>}
      {data && data.items.length === 0 && <p className="text-gray-600">No certificates are waiting for review.</p>}

      <ul className="space-y-4">
        {data?.items.map((teuda) => (
          <li key={teuda.id} className="space-y-3 rounded border border-green-100 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {teuda.restaurant?.name || 'Unknown restaurant'}
                {teuda.submittedWithNewRestaurant && (
                  <span className="ms-2 rounded bg-green-50 px-2 py-0.5 text-xs font-medium text-green-800">
                    Sent with a new restaurant
                  </span>
                )}
              </h3>
              {teuda.restaurant && (
                <Link to={`/admin/restaurants/${teuda.restaurant.id}`} className="text-sm font-medium text-green-700 underline">
                  View restaurant
                </Link>
              )}
            </div>

            <TeudaFacts teuda={teuda} hechsherOptions={hechsherOptions} />

            {!teuda.restaurantApproved && (
              <FormAlert
                kind="warning"
                message="This restaurant is not approved yet. Approve the restaurant first; a certificate cannot be approved before it."
              />
            )}

            {teuda.conflicts.length > 0 && (
              <FormAlert
                kind="warning"
                message={`Possible conflict: this restaurant already has a valid approved ${getKashrutLevelLabel(
                  teuda.kashrutLevel
                )} certificate (${teuda.conflicts
                  .map(
                    (conflict) =>
                      `${getHechsherLabel(conflict.hechsher, conflict.hechsherOther, hechsherOptions)}, until ${conflict.expirationDate}`
                  )
                  .join('; ')}). This is only a warning, you can still approve.`}
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
                  disabled={busyId === teuda.id || !teuda.restaurantApproved}
                  onClick={() => handleApprove(teuda.id)}
                  className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busyId === teuda.id ? 'Working...' : teuda.conflicts.length > 0 ? 'Approve anyway' : 'Approve'}
                </button>
                <button
                  type="button"
                  disabled={busyId === teuda.id}
                  onClick={() => setRejectingId(teuda.id)}
                  className="rounded border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Reject...
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
