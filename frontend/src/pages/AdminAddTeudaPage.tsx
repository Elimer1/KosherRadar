// NEW (Milestone 3): an admin adds an approved certificate to an approved restaurant.
// The expiration date may be in the past, so an admin can record an old certificate.
// חדש (אבן דרך 3): מנהל מוסיף תעודה מאושרת למסעדה מאושרת. תאריך התפוגה יכול להיות בעבר.
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useParams } from 'react-router-dom';
import { createTeudaAsAdmin, getRestaurantDetails } from '../api/adminApi';
import { getErrorMessage } from '../api/errors';
import FormAlert from '../components/FormAlert';
import TeudaFields from '../components/TeudaFields';
import { inputClassName, labelClassName, primaryButtonClassName } from '../components/formStyles';
import { useFormOptions } from '../hooks/useFormOptions';
import { usePhotoField } from '../hooks/usePhotoField';
import type { AdminRestaurant } from '../types/admin';
import { emptyTeudaForm } from '../types/submissions';
import type { TeudaFormValues } from '../types/submissions';

function AdminAddTeudaPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const { restaurantId = '' } = useParams();
  const { options, error: optionsError } = useFormOptions();

  const [restaurant, setRestaurant] = useState<AdminRestaurant | null>(null);
  const [loadError, setLoadError] = useState('');
  const [values, setValues] = useState<TeudaFormValues>(emptyTeudaForm);
  const [adminNote, setAdminNote] = useState('');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const { photo, photoError, handlePhotoChange } = usePhotoField(options?.maxImageBytes || 5 * 1024 * 1024);

  useEffect(() => {
    const loadRestaurant = async () => {
      try {
        const details = await getRestaurantDetails(restaurantId);
        setRestaurant(details.restaurant);
      } catch (err) {
        setLoadError(getErrorMessage(err, t('forms.loadRestaurant')));
      }
    };

    loadRestaurant();
  }, [restaurantId, t]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (!photo) {
      setError(t('forms.needPhoto'));
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      await createTeudaAsAdmin(restaurantId, values, adminNote, photo, setProgress);
      setDone(true);
    } catch (err) {
      setError(getErrorMessage(err, t('desk.addCertificateFailed')));
    } finally {
      setLoading(false);
    }
  };

  if (loadError || optionsError) {
    return <FormAlert message={loadError || optionsError} />;
  }

  if (!restaurant || !options) {
    return <p className="text-muted">{t('common.loading')}</p>;
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('desk.certificateAdded')}</h1>
        <FormAlert kind="success" message={t('desk.certificateApprovedFor', { name: restaurant.name })} />
        <Link to={`/admin/restaurants/${restaurant.id}`} state={location.state} className="font-medium text-grove underline">
          {t('desk.backRestaurant')}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <Link to={`/admin/restaurants/${restaurant.id}`} state={location.state} className="text-sm font-medium text-grove underline">
        {t('desk.backRestaurant')}
      </Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{t('desk.addCertificateAdmin')}</h1>
      <p className="mt-1 text-muted">
        {restaurant.name} &middot; {restaurant.address}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <FormAlert message={error} />

        <TeudaFields
          idPrefix="admin-teuda"
          values={values}
          options={options}
          photo={photo}
          photoError={photoError}
          disabled={loading}
          onChange={(field, value) => setValues((current) => ({ ...current, [field]: value }))}
          onPhotoChange={handlePhotoChange}
        />

        <div>
          <label htmlFor="admin-teuda-note" className={labelClassName}>
            {t('desk.privateAdmins')}
          </label>
          <textarea
            id="admin-teuda-note"
            rows={2}
            maxLength={1000}
            disabled={loading}
            value={adminNote}
            onChange={(event) => setAdminNote(event.target.value)}
            className={inputClassName}
          />
        </div>

        {loading && (
          <div role="status" className="text-sm text-muted">
            {progress < 100 ? t('forms.uploadingPhoto', { progress }) : t('auth.saving')}
            <div className="mt-1 h-2 rounded bg-soft">
              <div className="h-2 rounded bg-forest" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <button type="submit" disabled={loading || Boolean(photoError)} className={primaryButtonClassName}>
          {loading ? t('auth.saving') : t('desk.addApproved')}
        </button>
      </form>
    </div>
  );
}

export default AdminAddTeudaPage;
