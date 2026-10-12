// NEW (Milestone 3): the admin page of one restaurant: details and edit form, approve/reject, delete,
// every certificate (including old expired ones), and a preview of what the public sees.
// חדש (אבן דרך 3): דף המנהל של מסעדה אחת: פרטים ועריכה, אישור/דחייה, מחיקה, כל התעודות, ותצוגה של מה שהציבור רואה.
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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

function AdminRestaurantPage() {
  const { restaurantId = '' } = useParams();
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

  // Changing this number makes the effect below load the restaurant again (used after every change).
  const [reloadKey, setReloadKey] = useState(0);
  const load = () => setReloadKey((current) => current + 1);

  // Loads the restaurant and fills the edit form from it. Runs on arrival and after every change.
  useEffect(() => {
    const loadRestaurant = async () => {
      try {
        const loaded = await getRestaurantDetails(restaurantId);
        setDetails(loaded);
        hasDetails.current = true;
        setValues(restaurantToFormValues(loaded.restaurant));
        setExtras(restaurantToExtrasValues(loaded.restaurant));
        setLoadError('');
      } catch (err) {
        const message = getErrorMessage(err, 'Could not load this restaurant.');
        if (hasDetails.current) {
          setDecisionNotices([{ kind: 'error', message }]);
        } else {
          setLoadError(message);
        }
      }
    };

    loadRestaurant();
  }, [restaurantId, reloadKey]);

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

    if (!values || !extras) {
      return;
    }

    if (values.categories.length === 0) {
      setNotices([{ kind: 'error', message: 'Please choose at least one category.' }]);
      return;
    }

    setBusy(true);
    setNotices([]);

    try {
      await updateRestaurant(restaurantId, values, extras);
      setNotices([{ kind: 'success', message: 'Restaurant saved.' }]);
      load();
    } catch (err) {
      setNotices([{ kind: 'error', message: getErrorMessage(err, 'Could not save the restaurant.') }]);
    } finally {
      setBusy(false);
    }
  };

  const handleApprove = async () => {
    setBusy(true);
    setDecisionNotices([]);

    try {
      const result = await approveRestaurant(restaurantId);
      setDetails((current) =>
        current ? { ...current, restaurant: { ...current.restaurant, status: result.restaurant.status } } : current
      );
      setDecisionNotices([{ kind: 'success', message: 'Restaurant approved. It is now public and has left the pending list.' }]);
      setRejecting(false);
      load();
    } catch (err) {
      setDecisionNotices([{ kind: 'error', message: getErrorMessage(err, 'Could not approve the restaurant.') }]);
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async (reason: string) => {
    setBusy(true);
    setDecisionNotices([]);

    try {
      const result = await rejectRestaurant(restaurantId, reason);
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
        { kind: 'success', message: 'Restaurant rejected. It has left the pending list.' },
        describeEmailStatus(result.emailStatus),
      ]);
      setRejecting(false);
      load();
    } catch (err) {
      setDecisionNotices([{ kind: 'error', message: getErrorMessage(err, 'Could not reject the restaurant.') }]);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    const count = details?.teudot.length || 0;
    // Deleting is permanent and also removes the certificates and reports of this restaurant.
    const confirmed = window.confirm(
      `Delete this restaurant for good? Its ${count} certificate(s) and its reports are deleted too. This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setBusy(true);
    setDecisionNotices([]);

    try {
      await deleteRestaurant(restaurantId);
      navigate('/admin');
    } catch (err) {
      setDecisionNotices([{ kind: 'error', message: getErrorMessage(err, 'Could not delete the restaurant.') }]);
      setBusy(false);
    }
  };

  const handleTeudaChanged = (teudaNotices: Notice[]) => {
    setNotices(teudaNotices);
    load();
  };

  if (loadError || optionsError) {
    return <FormAlert message={loadError || optionsError} />;
  }

  if (!details || !values || !extras || !options) {
    return <p className="text-gray-600">Loading...</p>;
  }

  const { restaurant, teudot, publicKashrutPreview } = details;
  const restaurantApproved = restaurant.status === 'APPROVED';

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Link to="/admin" className="text-sm font-medium text-green-700 underline">
          Back to the admin dashboard
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
          <span className="rounded bg-gray-100 px-2 py-0.5 text-sm font-medium text-gray-700">
            {getStatusLabel(restaurant.status)}
          </span>
        </div>
        <p className="text-gray-600">
          {restaurant.address}
          {restaurant.city ? `, ${restaurant.city}` : ''}
        </p>
        {restaurant.submittedBy && (
          <p className="text-sm text-gray-500">Sent by: {restaurant.submittedBy.email}</p>
        )}
        {restaurant.status === 'REJECTED' && restaurant.rejectionReason && (
          <p className="mt-1 text-sm text-gray-700">Rejection reason: {restaurant.rejectionReason}</p>
        )}
      </div>

      <Notices notices={notices} onDismiss={() => setNotices([])} />

      {restaurant.possibleDuplicates.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">Possible duplicates</h2>
          <ul className="space-y-1 text-sm">
            {restaurant.possibleDuplicates.map((duplicate, index) => (
              <li key={index} className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                {duplicate.restaurant ? (
                  <Link to={`/admin/restaurants/${duplicate.restaurant.id}`} className="font-medium underline">
                    {duplicate.restaurant.name}
                  </Link>
                ) : (
                  'A restaurant that no longer exists'
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
        <h2 className="text-lg font-semibold text-gray-900">Decision</h2>
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
                className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
              >
                Approve restaurant
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setRejecting(true)}
                className="rounded border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
              >
                Reject...
              </button>
            </div>
          ))}
        {restaurant.status !== 'PENDING' && (
          <p className="text-sm text-gray-600">This restaurant was already {getStatusLabel(restaurant.status).toLowerCase()}.</p>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={handleDelete}
          className="rounded border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
        >
          Delete restaurant
        </button>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-900">What the public sees</h2>
        {!restaurantApproved && (
          <p className="text-sm text-gray-600">Nothing is shown to the public until the restaurant is approved.</p>
        )}
        {restaurantApproved && publicKashrutPreview && (
          <>
            <p className="text-sm font-medium text-gray-900">
              Status:{' '}
              {publicKashrutPreview.status === 'UNKNOWN'
                ? 'Unknown (no kashrut information)'
                : publicKashrutPreview.status}
            </p>
            {publicKashrutPreview.items.length > 0 && (
              <ul className="list-disc space-y-1 ps-5 text-sm text-gray-700">
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
          <h2 className="text-lg font-semibold text-gray-900">Certificates ({teudot.length})</h2>
          {restaurantApproved && (
            <Link
              to={`/admin/restaurants/${restaurant.id}/add-teuda`}
              className="text-sm font-medium text-green-700 underline"
            >
              Add a certificate
            </Link>
          )}
        </div>
        {teudot.length === 0 && <p className="text-sm text-gray-600">This restaurant has no certificates.</p>}
        <ul className="space-y-4">
          {teudot.map((teuda) => (
            <AdminTeudaCard
              key={`${teuda.id}-${teuda.status}-${teuda.expirationDate}`}
              teuda={teuda}
              options={options}
              restaurantApproved={restaurantApproved}
              onChanged={handleTeudaChanged}
            />
          ))}
        </ul>
      </section>

      <form onSubmit={handleSave} className="space-y-8">
        <h2 className="text-xl font-bold text-gray-900">Edit the restaurant</h2>
        <RestaurantFields
          values={values}
          options={options}
          disabled={busy}
          onChange={(field, value) => setValues((current) => (current ? { ...current, [field]: value } : current))}
          onToggleCategory={handleToggleCategory}
        />
        <RestaurantExtrasFields
          values={extras}
          disabled={busy}
          onChange={(field, value) => setExtras((current) => (current ? { ...current, [field]: value } : current))}
        />
        <button type="submit" disabled={busy} className={primaryButtonClassName}>
          {busy ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}

export default AdminRestaurantPage;
