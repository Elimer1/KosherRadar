import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { submitRestaurant } from '../api/restaurantApi';
import { getErrorMessage } from '../api/errors';
import FormAlert from '../components/FormAlert';
import RestaurantFields from '../components/RestaurantFields';
import TeudaFields from '../components/TeudaFields';
import { primaryButtonClassName } from '../components/formStyles';
import { useFormOptions } from '../hooks/useFormOptions';
import { usePageMeta } from '../hooks/usePageMeta';
import { usePhotoField } from '../hooks/usePhotoField';
import { emptyRestaurantForm, emptyTeudaForm } from '../types/submissions';
import type { RestaurantFormValues, RestaurantSubmitResult, TeudaFormValues } from '../types/submissions';

function SubmitRestaurantPage() {
  const { t } = useTranslation();
  const { options, error: optionsError } = useFormOptions();
  usePageMeta(t('forms.addRestaurant'), t('forms.addRestaurantBody'));

  const [restaurant, setRestaurant] = useState<RestaurantFormValues>(emptyRestaurantForm);
  const [teuda, setTeuda] = useState<TeudaFormValues>(emptyTeudaForm);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RestaurantSubmitResult | null>(null);

  const { photo, photoError, handlePhotoChange } = usePhotoField(options?.maxImageBytes || 5 * 1024 * 1024);

  const handleRestaurantChange = (field: keyof RestaurantFormValues, value: string) => {
    setRestaurant((current) => ({ ...current, [field]: value }));
  };

  const handleToggleCategory = (category: string) => {
    setRestaurant((current) => {
      const alreadySelected = current.categories.includes(category);
      const categories = alreadySelected
        ? current.categories.filter((item) => item !== category)
        : [...current.categories, category];
      return { ...current, categories };
    });
  };

  const handleTeudaChange = (field: keyof TeudaFormValues, value: string) => {
    setTeuda((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (restaurant.categories.length === 0) {
      setError(t('forms.chooseCategory'));
      return;
    }

    const certificateStarted = Boolean(
      photo ||
        teuda.hechsher ||
        teuda.hechsherOther.trim() ||
        teuda.kashrutLevel ||
        teuda.expirationDate ||
        teuda.mashgiachName.trim() ||
        teuda.mashgiachPhone.trim()
    );

    if (certificateStarted) {
      const otherMissing = teuda.hechsher === options?.hechsherOtherValue && !teuda.hechsherOther.trim();
      const certificateComplete = Boolean(
        teuda.hechsher &&
          !otherMissing &&
          teuda.kashrutLevel &&
          teuda.expirationDate &&
          teuda.mashgiachName.trim() &&
          teuda.mashgiachPhone.trim() &&
          photo &&
          !photoError
      );

      if (!certificateComplete) {
        setError(t('forms.certificateIncomplete'));
        return;
      }
    }

    setLoading(true);
    setProgress(0);

    try {
      const submitted = await submitRestaurant(
        {
          ...restaurant,
          foodKeywords: '',
          claimedHechsher: '',
          claimedHechsherOther: '',
          claimedKashrutLevel: '',
        },
        certificateStarted ? teuda : null,
        photo,
        setProgress
      );
      setResult(submitted);
    } catch (err) {
      setError(getErrorMessage(err, t('forms.sendRestaurantFailed')));
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

  if (result) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">{t('forms.restaurantSent')}</h1>
        <FormAlert
          kind="success"
          message={result.teuda ? t('forms.thanksWithCertificate') : t('forms.thanksRestaurant')}
        />
        {result.possibleDuplicateCount > 0 && <FormAlert kind="warning" message={t('forms.similarWarning')} />}
        <Link to="/account/submissions" className="inline-block font-medium text-green-700 hover:underline">
          {t('forms.seeSubmissions')}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">{t('forms.addRestaurant')}</h1>
      <p className="mt-2 text-sm text-gray-600">{t('forms.addRestaurantBody')}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-8">
        <FormAlert message={error} />

        <RestaurantFields
          values={restaurant}
          options={options}
          disabled={loading}
          variant="user"
          onChange={handleRestaurantChange}
          onToggleCategory={handleToggleCategory}
        />

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('forms.certificateOptional')}</h2>
          <p className="text-sm text-gray-600">{t('forms.certificateOptionalBody')}</p>
          <TeudaFields
            idPrefix="new-restaurant-teuda"
            values={teuda}
            options={options}
            photo={photo}
            photoError={photoError}
            disabled={loading}
            fieldsRequired={false}
            onChange={handleTeudaChange}
            onPhotoChange={handlePhotoChange}
          />
        </section>

        {loading && photo && (
          <div role="status" className="text-sm text-gray-600">
            {progress < 100 ? t('forms.uploading', { progress }) : t('auth.saving')}
            <div className="mt-1 h-2 rounded bg-green-100">
              <div className="h-2 rounded bg-green-600" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <button type="submit" disabled={loading} className={primaryButtonClassName}>
          {loading ? t('auth.sending') : t('forms.sendRestaurant')}
        </button>
      </form>
    </div>
  );
}

export default SubmitRestaurantPage;
