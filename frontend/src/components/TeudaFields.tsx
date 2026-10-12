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
  // Required only on forms that demand a complete certificate, such as an admin creating one.
  fieldsRequired?: boolean;
  hidePhoto?: boolean;
  showHechsher?: boolean;
  showDetails?: boolean;
  // NEW (Audit M1): users do not choose a kashrut level. Admin edit and admin create still show it.
  // חדש (ביקורת M1): משתמש לא בוחר רמת כשרות. עריכה ויצירה של מנהל עדיין מציגות אותה.
  showLevel?: boolean;
  hechsherRequired?: boolean;
  mashgiachRequired?: boolean;
  markOptional?: boolean;
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
  showHechsher = true,
  showDetails = true,
  showLevel = true,
  hechsherRequired = fieldsRequired,
  mashgiachRequired = fieldsRequired,
  markOptional = false,
  invalidHechsher = false,
}: TeudaFieldsProps) {
  const { t } = useTranslation();
  const isOther = values.hechsher === options.hechsherOtherValue;
  const maxMegabytes = Math.round(options.maxImageBytes / (1024 * 1024));
  const optionalLabel = (text: string, optional: boolean) => (optional ? `${text} (${t('forms.optionalMark')})` : text);

  return (
    <div className="space-y-4">
      {showHechsher && (
      <div>
        <label htmlFor={`${idPrefix}-hechsher`} className={labelClassName}>
          {t('forms.hechsher')}
        </label>
        <select
          id={`${idPrefix}-hechsher`}
          required={hechsherRequired}
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
      )}

      {showHechsher && isOther && (
        <div>
          <label htmlFor={`${idPrefix}-hechsher-other`} className={labelClassName}>
            {t('forms.hechsherName')}
          </label>
          <input
            id={`${idPrefix}-hechsher-other`}
            type="text"
            required={hechsherRequired}
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

      {showDetails && <div>
        <label htmlFor={`${idPrefix}-expiration`} className={labelClassName}>
          {optionalLabel(t('forms.expiration'), markOptional && !fieldsRequired)}
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
      </div>}

      {showDetails && <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${idPrefix}-mashgiach-name`} className={labelClassName}>
            {optionalLabel(t('forms.mashgiachName'), !mashgiachRequired)}
          </label>
          <input
            id={`${idPrefix}-mashgiach-name`}
            type="text"
            required={mashgiachRequired}
            maxLength={100}
            disabled={disabled}
            value={values.mashgiachName}
            onChange={(event) => onChange('mashgiachName', event.target.value)}
            className={inputClassName}
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-mashgiach-phone`} className={labelClassName}>
            {optionalLabel(t('forms.mashgiachPhone'), !mashgiachRequired)}
          </label>
          <input
            id={`${idPrefix}-mashgiach-phone`}
            type="tel"
            required={mashgiachRequired}
            maxLength={30}
            disabled={disabled}
            value={values.mashgiachPhone}
            onChange={(event) => onChange('mashgiachPhone', event.target.value)}
            className={inputClassName}
          />
        </div>
      </div>}

      {!hidePhoto && (
      <div>
        <label htmlFor={`${idPrefix}-photo`} className={labelClassName}>
          {optionalLabel(t('forms.photo'), markOptional && !fieldsRequired)}
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
