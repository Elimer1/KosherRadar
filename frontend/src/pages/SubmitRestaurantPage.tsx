import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { submitRestaurant } from '../api/restaurantApi';
import { getErrorMessage } from '../api/errors';
import FormAlert from '../components/FormAlert';
import RestaurantFields from '../components/RestaurantFields';
import TeudaFields from '../components/TeudaFields';
import { primaryButtonClassName } from '../components/formStyles';
import { useFormOptions } from '../hooks/useFormOptions';
import { usePhotoField } from '../hooks/usePhotoField';
import { emptyRestaurantForm, emptyTeudaForm } from '../types/submissions';
import type { RestaurantFormValues, RestaurantSubmitResult, TeudaFormValues } from '../types/submissions';

function SubmitRestaurantPage() {
  const { options, error: optionsError } = useFormOptions();

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
      setError('Please choose at least one category.');
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
        setError('Fill in every certificate field and add a photo, or leave the certificate blank.');
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
      setError(getErrorMessage(err, 'Could not send the restaurant. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  if (optionsError) {
    return <FormAlert message={optionsError} />;
  }

  if (!options) {
    return <p className="text-gray-600">Loading...</p>;
  }

  if (result) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Restaurant sent</h1>
        <FormAlert
          kind="success"
          message={
            result.teuda
              ? 'Thank you. The restaurant and its certificate are waiting for admin review. Nothing is shown on the site until an admin approves it.'
              : 'Thank you. The restaurant is waiting for admin review. It will not appear on the site until an admin approves it.'
          }
        />
        {result.possibleDuplicateCount > 0 && (
          <FormAlert
            kind="warning"
            message="A similar restaurant may already be listed. This does not stop your submission; an admin will check it."
          />
        )}
        <Link to="/account/submissions" className="inline-block font-medium text-green-700 hover:underline">
          See your submissions
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Add a restaurant</h1>
      <p className="mt-2 text-sm text-gray-600">
        Share a restaurant or food business in Israel. An admin reviews every submission before it is shown. Only
        add facts you know; a certificate photo makes the listing verifiable.
      </p>

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
          <h2 className="text-lg font-semibold text-gray-900">Kashrut certificate (optional)</h2>
          <p className="text-sm text-gray-600">
            Add the certificate details and a photo on this form. Leave every certificate field empty to send the
            restaurant without one.
          </p>
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
            {progress < 100 ? `Uploading... ${progress}%` : 'Saving...'}
            <div className="mt-1 h-2 rounded bg-green-100">
              <div className="h-2 rounded bg-green-600" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <button type="submit" disabled={loading} className={primaryButtonClassName}>
          {loading ? 'Sending...' : 'Send restaurant for review'}
        </button>
      </form>
    </div>
  );
}

export default SubmitRestaurantPage;
