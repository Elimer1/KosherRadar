// NEW (Milestone 3): an admin adds a restaurant directly. It is approved at once, and so is the optional
// certificate. The certificate date may be in the past (an admin may record an expired certificate).
// חדש (אבן דרך 3): מנהל מוסיף מסעדה ישירות. היא מאושרת מיד, וגם התעודה האופציונלית. תאריך התעודה יכול להיות בעבר.
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { createRestaurantAsAdmin } from '../api/adminApi';
import { getErrorMessage } from '../api/errors';
import RestaurantExtrasFields from '../components/admin/RestaurantExtrasFields';
import FormAlert from '../components/FormAlert';
import RestaurantFields from '../components/RestaurantFields';
import TeudaFields from '../components/TeudaFields';
import { inputClassName, labelClassName, primaryButtonClassName } from '../components/formStyles';
import { useFormOptions } from '../hooks/useFormOptions';
import { usePhotoField } from '../hooks/usePhotoField';
import { emptyRestaurantExtras } from '../types/admin';
import type { AdminRestaurant, RestaurantExtrasValues } from '../types/admin';
import { emptyRestaurantForm, emptyTeudaForm } from '../types/submissions';
import type { RestaurantFormValues, TeudaFormValues } from '../types/submissions';

function AdminCreateRestaurantPage() {
  const { t } = useTranslation();
  const { options, error: optionsError } = useFormOptions();

  const [restaurant, setRestaurant] = useState<RestaurantFormValues>(emptyRestaurantForm);
  const [extras, setExtras] = useState<RestaurantExtrasValues>(emptyRestaurantExtras);
  const [teuda, setTeuda] = useState<TeudaFormValues>(emptyTeudaForm);
  const [teudaNote, setTeudaNote] = useState('');
  const [withCertificate, setWithCertificate] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<{ restaurant: AdminRestaurant; hasTeuda: boolean; duplicates: number } | null>(
    null
  );

  const { photo, photoError, handlePhotoChange } = usePhotoField(options?.maxImageBytes || 5 * 1024 * 1024);

  const handleToggleCategory = (category: string) => {
    setRestaurant((current) => {
      const categories = current.categories.includes(category)
        ? current.categories.filter((item) => item !== category)
        : [...current.categories, category];
      return { ...current, categories };
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (restaurant.categories.length === 0) {
      setError(t('forms.chooseCategory'));
      return;
    }

    if (withCertificate && !photo) {
      setError(t('desk.needCertificatePhoto'));
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      const result = await createRestaurantAsAdmin(
        restaurant,
        extras,
        withCertificate ? teuda : null,
        teudaNote,
        photo,
        setProgress
      );
      setCreated({
        restaurant: result.restaurant,
        hasTeuda: Boolean(result.teuda),
        duplicates: result.possibleDuplicateCount,
      });
    } catch (err) {
      setError(getErrorMessage(err, t('desk.createFailed')));
    } finally {
      setLoading(false);
    }
  };

  if (optionsError) {
    return <FormAlert message={optionsError} />;
  }

  if (!options) {
    return <p className="text-gray-600">{t('common.loading')}</p>;
  }

  if (created) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">{t('desk.created')}</h1>
        <FormAlert
          kind="success"
          message={t('desk.createdPublic', {
            name: created.restaurant.name,
            extra: created.hasTeuda ? t('desk.createdWithCertificate') : '',
          })}
        />
        {created.duplicates > 0 && <FormAlert kind="warning" message={t('desk.similarExists')} />}
        <div className="flex gap-4">
          <Link to={`/admin/restaurants/${created.restaurant.id}`} className="font-medium text-green-700 underline">
            {t('desk.openTheRestaurant')}
          </Link>
          <Link to="/admin" className="font-medium text-green-700 underline">
            {t('desk.backDash')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/admin" className="text-sm font-medium text-green-700 underline">
        {t('desk.backDashboard')}
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">{t('desk.addAdmin')}</h1>
      <p className="mt-2 text-sm text-gray-600">{t('desk.addAdminBody')}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-8">
        <FormAlert message={error} />

        <RestaurantFields
          values={restaurant}
          options={options}
          disabled={loading}
          onChange={(field, value) => setRestaurant((current) => ({ ...current, [field]: value }))}
          onToggleCategory={handleToggleCategory}
        />

        <RestaurantExtrasFields
          values={extras}
          disabled={loading}
          onChange={(field, value) => setExtras((current) => ({ ...current, [field]: value }))}
        />

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('forms.certificateOptional')}</h2>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              disabled={loading}
              checked={withCertificate}
              onChange={(event) => setWithCertificate(event.target.checked)}
              className="h-4 w-4 accent-green-600"
            />
            {t('desk.addWithPhoto')}
          </label>

          {withCertificate && (
            <>
              <TeudaFields
                idPrefix="admin-new-restaurant-teuda"
                values={teuda}
                options={options}
                photo={photo}
                photoError={photoError}
                disabled={loading}
                onChange={(field, value) => setTeuda((current) => ({ ...current, [field]: value }))}
                onPhotoChange={handlePhotoChange}
              />
              <div>
                <label htmlFor="admin-new-teuda-note" className={labelClassName}>
                  {t('desk.certificateNote')}
                </label>
                <textarea
                  id="admin-new-teuda-note"
                  rows={2}
                  maxLength={1000}
                  disabled={loading}
                  value={teudaNote}
                  onChange={(event) => setTeudaNote(event.target.value)}
                  className={inputClassName}
                />
              </div>
            </>
          )}
        </section>

        {loading && withCertificate && (
          <div role="status" className="text-sm text-gray-600">
            {progress < 100 ? t('forms.uploading', { progress }) : t('auth.saving')}
            <div className="mt-1 h-2 rounded bg-green-100">
              <div className="h-2 rounded bg-green-600" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <button type="submit" disabled={loading || Boolean(photoError)} className={primaryButtonClassName}>
          {loading ? t('desk.creating') : t('desk.createRestaurant')}
        </button>
      </form>
    </div>
  );
}

export default AdminCreateRestaurantPage;
