import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { FormOptions, TeudaFormValues } from '../types/submissions';
import { getHechsherOptionLabel, getKashrutLevelLabel } from '../utils/labels';
import { inputClassName, labelClassName } from './formStyles';

interface TeudaFieldsProps {
  idPrefix: string;
  values: TeudaFormValues;
  options: FormOptions;
  photo: File | null;
  photoError: string;
  disabled: boolean;
  onChange: (field: keyof TeudaFormValues, value: string) => void;
  onPhotoChange: (event: ChangeEvent<HTMLInputElement>) => void;
  // The new-restaurant form shows these fields all the time. They are required only when a certificate is included.
  fieldsRequired?: boolean;
  hidePhoto?: boolean;
  // NEW (update): a new restaurant asks for the hechsher only. The level stays for a full certificate.
  // חדש (עדכון): מסעדה חדשה מבקשת רק הכשר. הרמה נשארת כשמוסיפים תעודה מלאה.
  showLevel?: boolean;
  invalidHechsher?: boolean;
}

// The certificate fields are shared by "add a certificate" and "submit a new restaurant with a certificate".
function TeudaFields({
  idPrefix,
  values,
  options,
  photo,
  photoError,
  disabled,
  onChange,
  onPhotoChange,
  fieldsRequired = true,
  hidePhoto = false,
  showLevel = true,
  invalidHechsher = false,
}: TeudaFieldsProps) {
  const { t } = useTranslation();
  const isOther = values.hechsher === options.hechsherOtherValue;
  const maxMegabytes = Math.round(options.maxImageBytes / (1024 * 1024));

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={`${idPrefix}-hechsher`} className={labelClassName}>
          {t('forms.hechsher')}
        </label>
        <select
          id={`${idPrefix}-hechsher`}
          required={fieldsRequired}
          disabled={disabled}
          aria-invalid={invalidHechsher}
          value={values.hechsher}
          onChange={(event) => onChange('hechsher', event.target.value)}
          className={`${inputClassName} ${invalidHechsher ? 'border-red-500' : ''}`}
        >
          <option value="">{t('common.choose')}</option>
          {options.hechsherOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {getHechsherOptionLabel(option)}
            </option>
          ))}
          <option value={options.hechsherOtherValue}>{t('common.otherType')}</option>
        </select>
      </div>

      {isOther && (
        <div>
          <label htmlFor={`${idPrefix}-hechsher-other`} className={labelClassName}>
            {t('forms.hechsherName')}
          </label>
          <input
            id={`${idPrefix}-hechsher-other`}
            type="text"
            required={fieldsRequired}
            maxLength={100}
            disabled={disabled}
            value={values.hechsherOther}
            onChange={(event) => onChange('hechsherOther', event.target.value)}
            className={inputClassName}
          />
        </div>
      )}

      {showLevel && <div>
        <label htmlFor={`${idPrefix}-level`} className={labelClassName}>
          {t('forms.level')}
        </label>
        <select
          id={`${idPrefix}-level`}
          required={fieldsRequired}
          disabled={disabled}
          value={values.kashrutLevel}
          onChange={(event) => onChange('kashrutLevel', event.target.value)}
          className={inputClassName}
        >
          <option value="">{t('common.choose')}</option>
          {options.kashrutLevels.map((level) => (
            <option key={level} value={level}>
              {getKashrutLevelLabel(level)}
            </option>
          ))}
        </select>
      </div>}

      <div>
        <label htmlFor={`${idPrefix}-expiration`} className={labelClassName}>
          {t('forms.expiration')}
        </label>
        <input
          id={`${idPrefix}-expiration`}
          type="date"
          required={fieldsRequired}
          disabled={disabled}
          value={values.expirationDate}
          onChange={(event) => onChange('expirationDate', event.target.value)}
          className={inputClassName}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${idPrefix}-mashgiach-name`} className={labelClassName}>
            {t('forms.mashgiachName')}
          </label>
          <input
            id={`${idPrefix}-mashgiach-name`}
            type="text"
            required={fieldsRequired}
            maxLength={100}
            disabled={disabled}
            value={values.mashgiachName}
            onChange={(event) => onChange('mashgiachName', event.target.value)}
            className={inputClassName}
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-mashgiach-phone`} className={labelClassName}>
            {t('forms.mashgiachPhone')}
          </label>
          <input
            id={`${idPrefix}-mashgiach-phone`}
            type="tel"
            required={fieldsRequired}
            maxLength={30}
            disabled={disabled}
            value={values.mashgiachPhone}
            onChange={(event) => onChange('mashgiachPhone', event.target.value)}
            className={inputClassName}
          />
        </div>
      </div>

      {!hidePhoto && (
      <div>
        <label htmlFor={`${idPrefix}-photo`} className={labelClassName}>
          {t('forms.photo')}
        </label>
        <input
          id={`${idPrefix}-photo`}
          type="file"
          required={fieldsRequired}
          accept="image/jpeg,image/png,image/webp"
          disabled={disabled}
          onChange={onPhotoChange}
          className="mt-1 block w-full text-sm text-gray-700 file:me-3 file:rounded file:border-0 file:bg-green-50 file:px-3 file:py-2 file:font-medium file:text-green-800 hover:file:bg-green-100"
        />
        <p className="mt-1 text-xs text-gray-500">{t('forms.photoHint', { max: maxMegabytes })}</p>
        {photo && !photoError && <p className="mt-1 text-xs text-gray-600">{t('forms.selected', { name: photo.name })}</p>}
        {photoError && (
          <p role="alert" className="mt-1 text-sm text-red-700">
            {photoError}
          </p>
        )}
      </div>
      )}
    </div>
  );
}

export default TeudaFields;
