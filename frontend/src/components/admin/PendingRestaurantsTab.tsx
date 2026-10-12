// NEW (Milestone 3): dashboard tab "Pending Restaurants": review, approve or reject new restaurants.
// חדש (אבן דרך 3): לשונית "מסעדות ממתינות": בדיקה, אישור או דחייה של מסעדות חדשות.
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { approveRestaurant, getPendingRestaurants, rejectRestaurant } from '../../api/adminApi';
import { getErrorMessage } from '../../api/errors';
import { usePagedList } from '../../hooks/usePagedList';
import { describeEmailStatus, getDuplicateReasonLabel } from '../../utils/adminLabels';
import { getCategoryLabel, getFoodTypeLabel, getHechsherLabel, getKashrutLevelLabel } from '../../utils/labels';
import type { HechsherOption } from '../../types/submissions';
import FormAlert from '../FormAlert';
import Notices from './Notices';
import type { Notice } from './Notices';
import Pagination from './Pagination';
import RejectForm from './RejectForm';

interface PendingRestaurantsTabProps {
  hechsherOptions: HechsherOption[];
}

function PendingRestaurantsTab({ hechsherOptions }: PendingRestaurantsTabProps) {
  const { t } = useTranslation();
  const { data, page, setPage, error, loading, reload } = usePagedList(getPendingRestaurants);
  const [busyId, setBusyId] = useState('');
  const [rejectingId, setRejectingId] = useState('');
  const [notices, setNotices] = useState<Notice[]>([]);

  const handleApprove = async (restaurantId: string) => {
    setBusyId(restaurantId);
    setNotices([]);

    try {
      await approveRestaurant(restaurantId);
      setNotices([{ kind: 'success', message: t('desk.approvedPublic') }]);
      reload();
    } catch (err) {
      setNotices([{ kind: 'error', message: getErrorMessage(err, t('desk.approveFailed')) }]);
    } finally {
      setBusyId('');
    }
  };

  const handleReject = async (restaurantId: string, reason: string) => {
    setBusyId(restaurantId);
    setNotices([]);

    try {
      const result = await rejectRestaurant(restaurantId, reason);
      setNotices([{ kind: 'success', message: t('desk.rejected') }, describeEmailStatus(result.emailStatus)]);
      setRejectingId('');
      reload();
    } catch (err) {
      setNotices([{ kind: 'error', message: getErrorMessage(err, t('desk.rejectFailed')) }]);
    } finally {
      setBusyId('');
    }
  };

  return (
    <section className="space-y-4" aria-label={t('desk.pendingRestaurants')}>
      <Notices notices={notices} onDismiss={() => setNotices([])} />
      <FormAlert message={error} />

      {loading && !data && <p className="text-gray-600">{t('common.loading')}</p>}
      {data && data.items.length === 0 && <p className="text-gray-600">{t('desk.nonePending')}</p>}

      <ul className="space-y-4">
        {data?.items.map((restaurant) => (
          <li key={restaurant.id} className="space-y-3 rounded border border-green-100 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{restaurant.name}</h3>
                <p className="text-sm text-gray-600">
                  {restaurant.address}
                  {restaurant.city ? `, ${restaurant.city}` : ''}
                </p>
              </div>
              <Link
                to={`/admin/restaurants/${restaurant.id}`}
                className="text-sm font-medium text-green-700 underline"
              >
                {t('desk.viewEdit')}
              </Link>
            </div>

            <p className="text-sm text-gray-700">
              {restaurant.foodType ? `${getFoodTypeLabel(restaurant.foodType)} · ` : ''}
              {restaurant.categories.map(getCategoryLabel).join(', ')}
              {restaurant.phone ? ` · ${restaurant.phone}` : ''}
            </p>
            <p className="text-sm text-gray-500">
              {t('desk.sentBy', { email: restaurant.submittedBy?.email || t('desk.unknownUser') })}
            </p>

            {(restaurant.claimedHechsher || restaurant.claimedKashrutLevel) && (
              <p className="text-sm text-gray-700">
                {t('desk.unverifiedClaim', {
                  name: restaurant.claimedHechsher
                    ? getHechsherLabel(restaurant.claimedHechsher, restaurant.claimedHechsherOther, hechsherOptions)
                    : t('kashrut.noHechsherLower'),
                })}
                {restaurant.claimedKashrutLevel ? `, ${getKashrutLevelLabel(restaurant.claimedKashrutLevel)}` : ''}
              </p>
            )}

            {restaurant.possibleDuplicates.length > 0 && (
              <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <p className="font-medium">{t('desk.duplicatesWarning')}</p>
                <ul className="mt-1 list-disc ps-5">
                  {restaurant.possibleDuplicates.map((duplicate, index) => (
                    <li key={index}>
                      {duplicate.restaurant?.id ? (
                        <Link to={`/admin/restaurants/${duplicate.restaurant.id}`} className="underline">
                          {duplicate.restaurant.name || t('desk.aRestaurant')}
                        </Link>
                      ) : (
                        t('desk.aRestaurant')
                      )}
                      {duplicate.restaurant?.address ? `, ${duplicate.restaurant.address}` : ''}:{' '}
                      {duplicate.reasons.map(getDuplicateReasonLabel).join(', ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {rejectingId === restaurant.id ? (
              <RejectForm
                idPrefix={`reject-restaurant-${restaurant.id}`}
                busy={busyId === restaurant.id}
                onConfirm={(reason) => handleReject(restaurant.id, reason)}
                onCancel={() => setRejectingId('')}
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busyId === restaurant.id}
                  onClick={() => handleApprove(restaurant.id)}
                  className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busyId === restaurant.id ? t('common.working') : t('common.approve')}
                </button>
                <button
                  type="button"
                  disabled={busyId === restaurant.id}
                  onClick={() => setRejectingId(restaurant.id)}
                  className="rounded border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
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

export default PendingRestaurantsTab;
