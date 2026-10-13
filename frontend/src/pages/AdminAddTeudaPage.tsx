// NEW (Milestone 3): an admin adds an approved certificate to an approved restaurant.
// The expiration date may be in the past, so an admin can record an old certificate.
// חדש (אבן דרך 3): מנהל מוסיף תעודה מאושרת למסעדה מאושרת. תאריך התפוגה יכול להיות בעבר.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useParams } from 'react-router-dom';
import { createTeudaAsAdmin, getRestaurantDetails } from '../api/adminApi';
import { getErrorMessage } from '../api/errors';
import FormAlert from '../components/FormAlert';
import PhotoFieldRecovery from '../components/PhotoFieldRecovery';
import TeudaFields from '../components/TeudaFields';
import { inputClassName, labelClassName, primaryButtonClassName } from '../components/formStyles';
import { useFormOptions } from '../hooks/useFormOptions';
import { usePhotoField } from '../hooks/usePhotoField';
import type { AdminRestaurant } from '../types/admin';
import { emptyTeudaForm } from '../types/submissions';
import type { TeudaFormValues } from '../types/submissions';

function AdminAddTeudaPage() {
  // NEW (UIAUD-001): route changes discard certificate fields, photo and pending UI state.
  // חדש (UIAUD-001): שינוי מסלול מאפס את פרטי התעודה, התמונה ומצב הטופס.
  const { restaurantId = '' } = useParams();
  return <CertificateCreator key={restaurantId} restaurantId={restaurantId} />;
}

function CertificateCreator({ restaurantId }: { restaurantId: string }) {
  const { t } = useTranslation();
  const location = useLocation();
  const { options, error: optionsError } = useFormOptions();

  const [restaurant, setRestaurant] = useState<AdminRestaurant | null>(null);
  const [loadError, setLoadError] = useState('');
  const [values, setValues] = useState<TeudaFormValues>(emptyTeudaForm);
  const [adminNote, setAdminNote] = useState('');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  // NEW (UIAUD-001): stale submissions and completions cannot affect the next restaurant.
  // חדש (UIAUD-001): שליחות ותשובות ישנות אינן משפיעות על המסעדה הבאה.
  const active = useRef(false);
  const pending = useRef(false);
  useLayoutEffect(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []);

  const { photo, photoError, photoValidating, getPhotoSubmissionError, handlePhotoChange, clearPhoto } = usePhotoField(options?.maxImageBytes || 5 * 1024 * 1024);

  useEffect(() => {
    const controller = new AbortController();
    let current = true;
    const loadRestaurant = async () => {
      try {
        const details = await getRestaurantDetails(restaurantId, controller.signal);
        if (!current || !active.current) return;
        if (details.restaurant.id !== restaurantId) throw new Error(t('forms.loadRestaurant'));
        setRestaurant(details.restaurant);
      } catch (err) {
        if (!current || !active.current) return;
        setLoadError(getErrorMessage(err, t('forms.loadRestaurant')));
      }
    };

    loadRestaurant();
    return () => { current = false; controller.abort(); };
  }, [restaurantId, t]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!active.current || restaurant?.id !== restaurantId || pending.current) return;
    setError('');

    // NEW (Agent 3): guard keyboard submission as well as the button.
    // חדש (סוכן 3): חסימת שליחה גם באמצעות מקלדת.
    const photoProblem = getPhotoSubmissionError();
    if (photoProblem) {
      setError(photoProblem);
      return;
    }

    if (!photo) {
      setError(t('forms.needPhoto'));
      return;
    }

    pending.current = true;
    setLoading(true);
    setProgress(0);

    try {
      await createTeudaAsAdmin(restaurant.id, values, adminNote, photo, (percent) => {
        if (active.current) setProgress(percent);
      });
      if (!active.current) return;
      setDone(true);
    } catch (err) {
      if (!active.current) return;
      setError(getErrorMessage(err, t('desk.addCertificateFailed')));
    } finally {
      pending.current = false;
      if (active.current) setLoading(false);
    }
  };

  if (loadError || optionsError) {
    return <FormAlert message={loadError || optionsError} />;
  }

  if (!restaurant || restaurant.id !== restaurantId || !options) {
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

        <PhotoFieldRecovery photo={photo} photoError={photoError} photoValidating={photoValidating} disabled={loading} onClear={clearPhoto} />
        <button type="submit" disabled={loading || photoValidating || Boolean(photoError)} className={primaryButtonClassName}>
          {loading ? t('auth.saving') : t('desk.addApproved')}
        </button>
      </form>
    </div>
  );
}

export default AdminAddTeudaPage;
