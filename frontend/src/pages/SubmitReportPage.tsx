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
import { emptyReportForm } from '../types/submissions';
import type { ReportFormValues, SubmissionContext } from '../types/submissions';
import { getHechsherLabel, getHechsherOptionLabel, getKashrutLevelLabel } from '../utils/labels';

function SubmitReportPage() {
  const { t } = useTranslation();
  const { restaurantId = '' } = useParams();
  usePageMeta(t('forms.reportTitle'), t('forms.thanksReport'));
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
        setLoadError(getErrorMessage(err, t('forms.loadRestaurant')));
      }
    };

    loadContext();
  }, [restaurantId, t]);

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
      setError(getErrorMessage(err, t('forms.sendReportFailed')));
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
        <h1 className="text-2xl font-bold text-gray-900">{t('forms.reportSent')}</h1>
        <FormAlert kind="success" message={t('forms.thanksReport')} />
        <Link to="/account/submissions" className="inline-block font-medium text-green-700 hover:underline">
          {t('forms.seeSubmissions')}
        </Link>
      </div>
    );
  }

  const isKashrutUpdate = values.type === 'KASHRUT_UPDATE';
  const proposesOther = values.proposedHechsher === options.hechsherOtherValue;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900">{t('forms.reportTitle')}</h1>
      <p className="mt-1 text-gray-600">
        {context.restaurant.name} &middot; {context.restaurant.address}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <FormAlert message={error} />

        <div>
          <label htmlFor="report-type" className={labelClassName}>
            {t('forms.about')}
          </label>
          <select
            id="report-type"
            disabled={loading}
            value={values.type}
            onChange={(event) => handleFieldChange('type', event.target.value)}
            className={inputClassName}
          >
            <option value="GENERAL">{t('forms.generalProblem')}</option>
            <option value="KASHRUT_UPDATE">{t('forms.kashrutWrong')}</option>
          </select>
        </div>

        <div>
          <label htmlFor="report-teuda" className={labelClassName}>
            {t('forms.whichCertificate')}
          </label>
          <select
            id="report-teuda"
            disabled={loading}
            value={values.teudaId}
            onChange={(event) => handleFieldChange('teudaId', event.target.value)}
            className={inputClassName}
          >
            <option value="">{t('forms.notSpecific')}</option>
            {context.teudot.map((teuda) => (
              <option key={teuda.id} value={teuda.id}>
                {getHechsherLabel(teuda.hechsher, teuda.hechsherOther, options.hechsherOptions)} -{' '}
                {getKashrutLevelLabel(teuda.kashrutLevel)} -{' '}
                {teuda.visibility === 'VALID' ? t('forms.validUntil') : t('forms.expiredOn')} {teuda.expirationDate}
              </option>
            ))}
          </select>
        </div>

        {isKashrutUpdate && (
          <div className="space-y-4 rounded border border-green-100 p-4">
            <p className="text-sm text-gray-600">{t('forms.thinkCorrect')}</p>

            <div>
              <label htmlFor="report-hechsher" className={labelClassName}>
                {t('forms.hechsher')}
              </label>
              <select
                id="report-hechsher"
                disabled={loading}
                value={values.proposedHechsher}
                onChange={(event) => handleFieldChange('proposedHechsher', event.target.value)}
                className={inputClassName}
              >
                <option value="">{t('common.noChange')}</option>
                {options.hechsherOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {getHechsherOptionLabel(option)}
                  </option>
                ))}
                <option value={options.hechsherOtherValue}>{t('common.otherType')}</option>
              </select>
            </div>

            {proposesOther && (
              <div>
                <label htmlFor="report-hechsher-other" className={labelClassName}>
                  {t('forms.hechsherName')}
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
                {t('forms.level')}
              </label>
              <select
                id="report-level"
                disabled={loading}
                value={values.proposedKashrutLevel}
                onChange={(event) => handleFieldChange('proposedKashrutLevel', event.target.value)}
                className={inputClassName}
              >
                <option value="">{t('common.noChange')}</option>
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
            {t('forms.describe')}
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
          {loading ? t('auth.sending') : t('forms.sendReport')}
        </button>
      </form>
    </div>
  );
}

export default SubmitReportPage;
