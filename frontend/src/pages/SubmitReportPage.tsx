import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { getSubmissionContext } from '../api/restaurantApi';
import { submitReport } from '../api/reportApi';
import { getErrorMessage } from '../api/errors';
import FormAlert from '../components/FormAlert';
import { inputClassName, labelClassName, primaryButtonClassName } from '../components/formStyles';
import { useFormOptions } from '../hooks/useFormOptions';
import { usePageMeta } from '../hooks/usePageMeta';
import { usePhotoField } from '../hooks/usePhotoField';
import type { SubmissionContext } from '../types/submissions';

// NEW (update): a report is a note and an optional certificate photo.
// חדש (עדכון): דיווח הוא הערה ותמונת תעודה אופציונלית.
function SubmitReportPage() {
  const { t } = useTranslation();
  const { restaurantId = '' } = useParams();
  usePageMeta(t('forms.reportTitle'), t('forms.thanksReport'));
  const { options, error: optionsError } = useFormOptions();

  const [context, setContext] = useState<SubmissionContext | null>(null);
  const [loadError, setLoadError] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [invalidNote, setInvalidNote] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { photo, photoError, photoValidating, getPhotoSubmissionError, handlePhotoChange } = usePhotoField(options?.maxImageBytes || 5 * 1024 * 1024);

  useEffect(() => {
    const loadContext = async () => {
      try {
        setContext(await getSubmissionContext(restaurantId));
      } catch (err) {
        setLoadError(getErrorMessage(err, t('forms.loadRestaurant')));
      }
    };

    loadContext();
  }, [restaurantId, t]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    // NEW (Agent 3): guard keyboard submission as well as the button.
    // חדש (סוכן 3): חסימת שליחה גם באמצעות מקלדת.
    const photoProblem = getPhotoSubmissionError();
    if (photoProblem) {
      setError(photoProblem);
      return;
    }

    if (description.trim() === '') {
      setInvalidNote(true);
      setError(t('forms.missingReport'));
      return;
    }

    if (photoError) {
      setError(photoError);
      return;
    }

    setInvalidNote(false);
    setLoading(true);

    try {
      await submitReport(restaurantId, description.trim(), photo);
      setSubmitted(true);
    } catch (err) {
      setError(getErrorMessage(err, t('forms.sendReportFailed')));
    } finally {
      setLoading(false);
    }
  };

  if (loadError || optionsError) {
    return <FormAlert message={loadError || optionsError} />;
  }

  if (!context || !options) {
    return <p className="text-muted">{t('common.loading')}</p>;
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('forms.reportSent')}</h1>
        <FormAlert kind="success" message={t('forms.thanksReport')} />
        <Link to="/account" className="inline-block font-medium text-grove hover:underline">
          {t('forms.seeSubmissions')}
        </Link>
      </div>
    );
  }

  const maxMegabytes = Math.round(options.maxImageBytes / (1024 * 1024));

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('forms.reportTitle')}</h1>
      <p className="mt-1 text-muted">
        {context.restaurant.name} &middot; {context.restaurant.address}
      </p>

      <form noValidate onSubmit={handleSubmit} className="mt-6 space-y-4">
        <FormAlert message={error} />

        <div>
          <label htmlFor="report-description" className={labelClassName}>
            {t('forms.describe')}
          </label>
          <textarea
            id="report-description"
            rows={5}
            maxLength={2000}
            disabled={loading}
            aria-invalid={invalidNote}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={`${inputClassName} ${invalidNote ? 'border-red-500' : ''}`}
          />
          <p className="mt-2 text-sm leading-relaxed text-muted">{t('forms.reportExamples')}</p>
        </div>

        <div>
          <label htmlFor="report-photo" className={labelClassName}>
            {t('forms.photo')}
          </label>
          <input
            id="report-photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={loading}
            aria-invalid={Boolean(photoError)}
            aria-describedby={photoError ? "report-photo-error" : undefined}
            onChange={handlePhotoChange}
            className="mt-1 block w-full cursor-pointer rounded-xl border border-dashed border-grove bg-mist px-3 py-4 text-sm text-ink file:me-3 file:min-h-11 file:cursor-pointer file:rounded-lg file:border-0 file:bg-forest file:px-3 file:py-2 file:font-medium file:text-white hover:file:bg-forest-deep"
          />
          <p className="mt-1 text-sm text-muted">{t('forms.photoHint', { max: maxMegabytes })}</p>
          {photo && !photoError && <p className="mt-1 text-sm text-ink">{t('forms.selected', { name: photo.name })}</p>}
          {photoError && <p id="report-photo-error" role="alert" className="mt-1 text-sm text-red-700">{photoError}</p>}
        </div>

        {photoValidating && <p role="status" className="text-sm text-muted">{t('forms.photoValidating')}</p>}
        <button type="submit" disabled={loading || photoValidating || Boolean(photoError)} className={primaryButtonClassName}>
          {loading ? t('auth.sending') : t('forms.sendReport')}
        </button>
      </form>
    </div>
  );
}

export default SubmitReportPage;
