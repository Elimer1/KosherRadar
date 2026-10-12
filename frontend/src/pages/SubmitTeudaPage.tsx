import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { getSubmissionContext, submitTeuda } from '../api/restaurantApi';
import { getErrorMessage } from '../api/errors';
import FormAlert from '../components/FormAlert';
import TeudaFields from '../components/TeudaFields';
import { primaryButtonClassName } from '../components/formStyles';
import { useFormOptions } from '../hooks/useFormOptions';
import { usePageMeta } from '../hooks/usePageMeta';
import { usePhotoField } from '../hooks/usePhotoField';
import { emptyTeudaForm } from '../types/submissions';
import type { SubmissionContext, TeudaFormValues } from '../types/submissions';

function SubmitTeudaPage() {
  const { t } = useTranslation();
  const { restaurantId = '' } = useParams();
  usePageMeta(t('forms.addCertificate'), t('forms.certificateReview'));
  const { options, error: optionsError } = useFormOptions();

  const [context, setContext] = useState<SubmissionContext | null>(null);
  const [loadError, setLoadError] = useState('');
  const [values, setValues] = useState<TeudaFormValues>(emptyTeudaForm);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { photo, photoError, handlePhotoChange } = usePhotoField(options?.maxImageBytes || 5 * 1024 * 1024);

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

  const handleFieldChange = (field: keyof TeudaFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

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
      await submitTeuda(restaurantId, values, photo, setProgress);
      setSubmitted(true);
    } catch (err) {
      setError(getErrorMessage(err, t('forms.sendCertificateFailed')));
    } finally {
      setLoading(false);
    }
  };

  if (loadError || optionsError) {
    return <FormAlert message={loadError || optionsError} />;
  }

  if (!context || !options) {
    return <p className="text-gray-600">{t('common.loading')}</p>;
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">{t('forms.certificateSent')}</h1>
        <FormAlert kind="success" message={t('forms.thanksCertificate', { name: context.restaurant.name })} />
        <Link to="/account" className="inline-block font-medium text-green-700 hover:underline">
          {t('forms.seeSubmissions')}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900">{t('forms.addCertificate')}</h1>
      <p className="mt-1 text-gray-600">
        {context.restaurant.name} &middot; {context.restaurant.address}
      </p>
      <p className="mt-3 text-sm text-gray-500">
        {t('forms.certificateReview')}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <FormAlert message={error} />

        <TeudaFields
          idPrefix="teuda"
          values={values}
          options={options}
          photo={photo}
          photoError={photoError}
          disabled={loading}
          onChange={handleFieldChange}
          onPhotoChange={handlePhotoChange}
        />

        {loading && (
          <div role="status" className="text-sm text-gray-600">
            {progress < 100 ? t('forms.uploadingPhoto', { progress }) : t('auth.saving')}
            <div className="mt-1 h-2 rounded bg-green-100">
              <div className="h-2 rounded bg-green-600" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <button type="submit" disabled={loading || Boolean(photoError)} className={primaryButtonClassName}>
          {loading ? t('auth.sending') : t('forms.sendCertificate')}
        </button>
      </form>
    </div>
  );
}

export default SubmitTeudaPage;
