// NEW (Milestone 3): the admin page of one restaurant: details and edit form, approve/reject, delete,
// every certificate (including old expired ones), and a preview of what the public sees.
// חדש (אבן דרך 3): דף המנהל של מסעדה אחת: פרטים ועריכה, אישור/דחייה, מחיקה, כל התעודות, ותצוגה של מה שהציבור רואה.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  approveRestaurant,
  deleteRestaurant,
  getRestaurantDetails,
  rejectRestaurant,
  updateRestaurant,
} from '../api/adminApi';
import { getErrorMessage } from '../api/errors';
import AdminTeudaCard from '../components/admin/AdminTeudaCard';
import Notices from '../components/admin/Notices';
import type { Notice } from '../components/admin/Notices';
import RejectForm from '../components/admin/RejectForm';
import RestaurantExtrasFields from '../components/admin/RestaurantExtrasFields';
import FormAlert from '../components/FormAlert';
import RestaurantFields from '../components/RestaurantFields';
import { primaryButtonClassName } from '../components/formStyles';
import { useFormOptions } from '../hooks/useFormOptions';
import type { AdminRestaurantDetails, RestaurantExtrasValues } from '../types/admin';
import type { RestaurantFormValues } from '../types/submissions';
import { restaurantToExtrasValues, restaurantToFormValues } from '../utils/adminForms';
import { describeEmailStatus, describePreviewItem, getDuplicateReasonLabel, getStatusLabel } from '../utils/adminLabels';
import { adminTabFromState, adminTabPath } from '../utils/adminTab';

function AdminRestaurantPage() {
  // NEW (UIAUD-001): route identity owns the form and certificate subtree.
  // חדש (UIAUD-001): מזהה המסלול קובע את הבעלות על הטופס והתעודות.
  const { restaurantId = '' } = useParams();
  return <RestaurantEditor key={restaurantId} restaurantId={restaurantId} />;
}

function RestaurantEditor({ restaurantId }: { restaurantId: string }) {
  const location = useLocation();
  const dashboardPath = adminTabPath(adminTabFromState(location.state));
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { options, error: optionsError } = useFormOptions();

  const [details, setDetails] = useState<AdminRestaurantDetails | null>(null);
  const [loadError, setLoadError] = useState('');
  const [values, setValues] = useState<RestaurantFormValues | null>(null);
  const [extras, setExtras] = useState<RestaurantExtrasValues | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [decisionNotices, setDecisionNotices] = useState<Notice[]>([]);
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const hasDetails = useRef(false);
  // NEW (UIAUD-001): detached handlers and late completions cannot affect another route.
  // חדש (UIAUD-001): פעולות מנותקות ותשובות מאוחרות אינן משפיעות על מסלול אחר.
  const active = useRef(false);
  const mutationPending = useRef(false);
  useLayoutEffect(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []);
  const canMutate = () => active.current && details?.restaurant.id === restaurantId;
  const beginMutation = () => {
    if (!canMutate() || mutationPending.current) return false;
    mutationPending.current = true;
    return true;
  };

  // Changing this number makes the effect below load the restaurant again (used after every change).
  const [reloadKey, setReloadKey] = useState(0);
  const load = () => setReloadKey((current) => current + 1);

  // Loads the restaurant and fills the edit form from it. Runs on arrival and after every change.
  useEffect(() => {
    // NEW (UIAUD-001): invalidate responses even when transport ignores cancellation.
    // חדש (UIAUD-001): בדיקת תוקף מגנה גם כאשר הבקשה מתעלמת מביטול.
    const controller = new AbortController();
    let current = true;
    const loadRestaurant = async () => {
      try {
        const loaded = await getRestaurantDetails(restaurantId, controller.signal);
        if (!current || !active.current) return;
        if (loaded.restaurant.id !== restaurantId) throw new Error(t('forms.loadRestaurant'));
        setDetails(loaded);
        hasDetails.current = true;
        setValues(restaurantToFormValues(loaded.restaurant));
        setExtras(restaurantToExtrasValues(loaded.restaurant));
        setLoadError('');
      } catch (err) {
        if (!current || !active.current) return;
        const message = getErrorMessage(err, t('forms.loadRestaurant'));
        if (hasDetails.current) {
          setDecisionNotices([{ kind: 'error', message }]);
        } else {
          setLoadError(message);
        }
      }
    };

    loadRestaurant();
    return () => { current = false; controller.abort(); };
  }, [restaurantId, reloadKey, t]);

  const handleToggleCategory = (category: string) => {
    setValues((current) => {
      if (!current) {
        return current;
      }

      const categories = current.categories.includes(category)
        ? current.categories.filter((item) => item !== category)
        : [...current.categories, category];
      return { ...current, categories };
    });
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();

    if (!values || !extras || !beginMutation()) {
      return;
    }

    setBusy(true);
    setNotices([]);

    try {
      const saved = await updateRestaurant(details!.restaurant.id, values, extras);
      if (!active.current) return;
      setNotices([
        { kind: 'success', message: t('desk.saved') },
        ...(saved.latitude === null || saved.longitude === null ? [{ kind: 'warning' as const, message: t(saved.locationStatus === 'unavailable' ? 'forms.lookupUnavailableSaved' : 'forms.notPlaced') }] : []),
      ]);
      load();
    } catch (err) {
      if (!active.current) return;
      setNotices([{ kind: 'error', message: getErrorMessage(err, t('desk.saveFailed')) }]);
    } finally {
      mutationPending.current = false;
      if (active.current) setBusy(false);
    }
  };

  const handleApprove = async () => {
    if (!beginMutation()) return;
    setBusy(true);
    setDecisionNotices([]);

    try {
      const result = await approveRestaurant(details!.restaurant.id);
      if (!active.current) return;
      setDetails((current) =>
        current ? { ...current, restaurant: { ...current.restaurant, status: result.restaurant.status } } : current
      );
      setDecisionNotices([{ kind: 'success', message: t('desk.approvedLeft') }]);
      setRejecting(false);
      load();
    } catch (err) {
      if (!active.current) return;
      setDecisionNotices([{ kind: 'error', message: getErrorMessage(err, t('desk.approveFailed')) }]);
    } finally {
      mutationPending.current = false;
      if (active.current) setBusy(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!beginMutation()) return;
    setBusy(true);
    setDecisionNotices([]);

    try {
      const result = await rejectRestaurant(details!.restaurant.id, reason);
      if (!active.current) return;
      setDetails((current) =>
        current
          ? {
              ...current,
              restaurant: {
                ...current.restaurant,
                status: result.restaurant.status,
                rejectionReason: result.restaurant.rejectionReason,
              },
            }
          : current
      );
      setDecisionNotices([
        { kind: 'success', message: t('desk.rejectedLeft') },
        describeEmailStatus(result.emailStatus),
      ]);
      setRejecting(false);
      load();
    } catch (err) {
      if (!active.current) return;
      setDecisionNotices([{ kind: 'error', message: getErrorMessage(err, t('desk.rejectFailed')) }]);
    } finally {
      mutationPending.current = false;
      if (active.current) setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!canMutate() || mutationPending.current) return;
    const count = details?.teudot.length || 0;
    // Deleting is permanent and also removes the certificates and reports of this restaurant.
    const confirmed = window.confirm(
      t('desk.deleteConfirm', { count })
    );

    if (!confirmed || !beginMutation()) {
      return;
    }

    setBusy(true);
    setDecisionNotices([]);

    try {
      await deleteRestaurant(details!.restaurant.id);
      if (!active.current) return;
      navigate(dashboardPath);
    } catch (err) {
      if (!active.current) return;
      setDecisionNotices([{ kind: 'error', message: getErrorMessage(err, t('desk.deleteFailed')) }]);
    } finally {
      mutationPending.current = false;
      if (active.current) setBusy(false);
    }
  };

  const handleTeudaChanged = (teudaNotices: Notice[]) => {
    if (!canMutate()) return;
    setNotices(teudaNotices);
    load();
  };

  if (loadError || optionsError) {
    return <FormAlert message={loadError || optionsError} />;
  }

  if (!details || details.restaurant.id !== restaurantId || !values || !extras || !options) {
    return <p className="text-muted">{t('common.loading')}</p>;
  }

  const { restaurant, teudot, publicKashrutPreview } = details;
  const restaurantApproved = restaurant.status === 'APPROVED';

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Link to={dashboardPath} className="text-sm font-medium text-grove underline">
          {t('desk.backDashboard')}
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{restaurant.name}</h1>
          <span className="rounded bg-gray-100 px-2 py-0.5 text-sm font-medium text-ink">
            {getStatusLabel(restaurant.status)}
          </span>
        </div>
        <p className="text-muted">
          {restaurant.address}
          {restaurant.city ? `, ${restaurant.city}` : ''}
        </p>
        {restaurant.submittedBy && (
          <p className="text-sm text-muted">{t('desk.sentByColon', { email: restaurant.submittedBy.email })}</p>
        )}
        {restaurant.status === 'REJECTED' && restaurant.rejectionReason && (
          <p className="mt-1 text-sm text-ink">{t('desk.rejectionReason', { reason: restaurant.rejectionReason })}</p>
        )}
      </div>

      <Notices notices={notices} onDismiss={() => setNotices([])} />

      {restaurant.possibleDuplicates.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight text-ink">{t('desk.possibleDuplicates')}</h2>
          <ul className="space-y-1 text-sm">
            {restaurant.possibleDuplicates.map((duplicate, index) => (
              <li key={index} className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                {duplicate.restaurant ? (
                  <Link to={`/admin/restaurants/${duplicate.restaurant.id}`} className="font-medium underline">
                    {duplicate.restaurant.name}
                  </Link>
                ) : (
                  t('desk.gone')
                )}
                {duplicate.restaurant?.address ? `, ${duplicate.restaurant.address}` : ''}
                {': '}
                {duplicate.reasons.map(getDuplicateReasonLabel).join(', ')}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-ink">{t('desk.decision')}</h2>
        <Notices notices={decisionNotices} onDismiss={() => setDecisionNotices([])} />
        {restaurant.status === 'PENDING' &&
          (rejecting ? (
            <RejectForm
              idPrefix="reject-restaurant"
              busy={busy}
              onConfirm={handleReject}
              onCancel={() => setRejecting(false)}
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={handleApprove}
                className="inline-flex min-h-11 items-center rounded-lg bg-forest px-3.5 text-sm font-medium text-white hover:bg-forest-deep disabled:opacity-60"
              >
                {t('desk.approveRestaurant')}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setRejecting(true)}
                className="rounded border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
              >
                {t('common.reject')}
              </button>
            </div>
          ))}
        {restaurant.status !== 'PENDING' && (
          <p className="text-sm text-muted">{t('desk.alreadyDecided', { status: getStatusLabel(restaurant.status) })}</p>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={handleDelete}
          className="rounded border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
        >
          {t('desk.deleteRestaurant')}
        </button>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight text-ink">{t('desk.publicSees')}</h2>
        {!restaurantApproved && <p className="text-sm text-muted">{t('desk.hiddenUntilApproved')}</p>}
        {restaurantApproved && publicKashrutPreview && (
          <>
            <p className="text-sm font-medium text-ink">
              {t('desk.publicStatus', {
                status:
                  publicKashrutPreview.status === 'UNKNOWN'
                    ? t('desk.unknownStatus')
                    : t(`kashrut.${publicKashrutPreview.status}`, { defaultValue: publicKashrutPreview.status }),
              })}
            </p>
            {publicKashrutPreview.items.length > 0 && (
              <ul className="list-disc space-y-1 ps-5 text-sm text-ink">
                {publicKashrutPreview.items.map((item, index) => (
                  <li key={index}>{describePreviewItem(item, options.hechsherOptions)}</li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold tracking-tight text-ink">{t('desk.certificateCount', { count: teudot.length })}</h2>
          {restaurantApproved && (
            <Link
              to={`/admin/restaurants/${restaurant.id}/add-teuda`}
              state={location.state}
              className="text-sm font-medium text-grove underline"
            >
              {t('forms.addCertificate')}
            </Link>
          )}
        </div>
        {teudot.length === 0 && <p className="text-sm text-muted">{t('desk.noCertificatesYet')}</p>}
        <ul className="space-y-4">
          {teudot.map((teuda) => (
            <AdminTeudaCard
              key={`${teuda.id}-${teuda.status}-${teuda.expirationDate}`}
              teuda={teuda}
              options={options}
              restaurantApproved={restaurantApproved}
              canMutate={canMutate}
              onChanged={handleTeudaChanged}
            />
          ))}
        </ul>
      </section>

      <form onSubmit={handleSave} className="space-y-8">
        <h2 className="text-xl font-semibold tracking-tight text-ink">{t('desk.editRestaurant')}</h2>
        <RestaurantFields
          values={values}
          options={options}
          disabled={busy}
          requireFoodBasics={false}
          onChange={(field, value) => setValues((current) => (current ? { ...current, [field]: value } : current))}
          onToggleCategory={handleToggleCategory}
        />
        <RestaurantExtrasFields
          values={extras}
          disabled={busy}
          onChange={(field, value) => setExtras((current) => (current ? { ...current, [field]: value } : current))}
        />
        <button type="submit" disabled={busy} className={primaryButtonClassName}>
          {busy ? t('auth.saving') : t('desk.saveChanges')}
        </button>
      </form>
    </div>
  );
}

export default AdminRestaurantPage;
