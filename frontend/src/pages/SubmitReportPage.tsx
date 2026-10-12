import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSubmissionContext } from '../api/restaurantApi';
import { submitReport } from '../api/reportApi';
import { getErrorMessage } from '../api/errors';
import FormAlert from '../components/FormAlert';
import { inputClassName, labelClassName, primaryButtonClassName } from '../components/formStyles';
import { useFormOptions } from '../hooks/useFormOptions';
import { emptyReportForm } from '../types/submissions';
import type { ReportFormValues, SubmissionContext } from '../types/submissions';
import { getHechsherLabel, getKashrutLevelLabel } from '../utils/labels';

function SubmitReportPage() {
  const { restaurantId = '' } = useParams();
  const { options, error: optionsError } = useFormOptions();

  const [context, setContext] = useState<SubmissionContext | null>(null);
  const [loadError, setLoadError] = useState('');
  const [values, setValues] = useState<ReportFormValues>(emptyReportForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadContext = async () => {
      try {
        setContext(await getSubmissionContext(restaurantId));
      } catch (err) {
        setLoadError(getErrorMessage(err, 'Could not load this restaurant.'));
      }
    };

    loadContext();
  }, [restaurantId]);

  const handleFieldChange = (field: keyof ReportFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await submitReport(restaurantId, values);
      setSubmitted(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not send the report. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  if (loadError || optionsError) {
    return <FormAlert message={loadError || optionsError} />;
  }

  if (!context || !options) {
    return <p className="text-gray-600">Loading...</p>;
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Report sent</h1>
        <FormAlert
          kind="success"
          message="Thank you. An admin will review your report. Nothing on the restaurant page changes until an admin decides to apply a correction."
        />
        <Link to="/account/submissions" className="inline-block font-medium text-green-700 hover:underline">
          See your submissions
        </Link>
      </div>
    );
  }

  const isKashrutUpdate = values.type === 'KASHRUT_UPDATE';
  const proposesOther = values.proposedHechsher === options.hechsherOtherValue;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900">Report a problem or correction</h1>
      <p className="mt-1 text-gray-600">
        {context.restaurant.name} &middot; {context.restaurant.address}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <FormAlert message={error} />

        <div>
          <label htmlFor="report-type" className={labelClassName}>
            What is this about?
          </label>
          <select
            id="report-type"
            disabled={loading}
            value={values.type}
            onChange={(event) => handleFieldChange('type', event.target.value)}
            className={inputClassName}
          >
            <option value="GENERAL">General problem (wrong details, closed, etc.)</option>
            <option value="KASHRUT_UPDATE">The kashrut information is wrong</option>
          </select>
        </div>

        <div>
          <label htmlFor="report-teuda" className={labelClassName}>
            Which certificate? (optional)
          </label>
          <select
            id="report-teuda"
            disabled={loading}
            value={values.teudaId}
            onChange={(event) => handleFieldChange('teudaId', event.target.value)}
            className={inputClassName}
          >
            <option value="">Not about a specific certificate</option>
            {context.teudot.map((teuda) => (
              <option key={teuda.id} value={teuda.id}>
                {getHechsherLabel(teuda.hechsher, teuda.hechsherOther, options.hechsherOptions)} -{' '}
                {getKashrutLevelLabel(teuda.kashrutLevel)} -{' '}
                {teuda.visibility === 'VALID' ? 'valid until' : 'EXPIRED on'} {teuda.expirationDate}
              </option>
            ))}
          </select>
        </div>

        {isKashrutUpdate && (
          <div className="space-y-4 rounded border border-green-100 p-4">
            <p className="text-sm text-gray-600">What do you think is correct?</p>

            <div>
              <label htmlFor="report-hechsher" className={labelClassName}>
                Hechsher
              </label>
              <select
                id="report-hechsher"
                disabled={loading}
                value={values.proposedHechsher}
                onChange={(event) => handleFieldChange('proposedHechsher', event.target.value)}
                className={inputClassName}
              >
                <option value="">No change</option>
                {options.hechsherOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.labelEn}
                  </option>
                ))}
                <option value={options.hechsherOtherValue}>Other (type below)</option>
              </select>
            </div>

            {proposesOther && (
              <div>
                <label htmlFor="report-hechsher-other" className={labelClassName}>
                  Name of the hechsher
                </label>
                <input
                  id="report-hechsher-other"
                  type="text"
                  required
                  maxLength={100}
                  disabled={loading}
                  value={values.proposedHechsherOther}
                  onChange={(event) => handleFieldChange('proposedHechsherOther', event.target.value)}
                  className={inputClassName}
                />
              </div>
            )}

            <div>
              <label htmlFor="report-level" className={labelClassName}>
                Kashrut level
              </label>
              <select
                id="report-level"
                disabled={loading}
                value={values.proposedKashrutLevel}
                onChange={(event) => handleFieldChange('proposedKashrutLevel', event.target.value)}
                className={inputClassName}
              >
                <option value="">No change</option>
                {options.kashrutLevels.map((level) => (
                  <option key={level} value={level}>
                    {getKashrutLevelLabel(level)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="report-description" className={labelClassName}>
            Describe the problem
          </label>
          <textarea
            id="report-description"
            required
            rows={5}
            maxLength={2000}
            disabled={loading}
            value={values.description}
            onChange={(event) => handleFieldChange('description', event.target.value)}
            className={inputClassName}
          />
        </div>

        <button type="submit" disabled={loading} className={primaryButtonClassName}>
          {loading ? 'Sending...' : 'Send report'}
        </button>
      </form>
    </div>
  );
}

export default SubmitReportPage;
