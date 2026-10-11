import type { ChangeEvent } from 'react';
import type { FormOptions, TeudaFormValues } from '../types/submissions';
import { getKashrutLevelLabel } from '../utils/labels';
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
  // NEW (Milestone 3): the admin edit form changes the details only; the photo cannot be replaced there.
  // חדש (אבן דרך 3): טופס העריכה של המנהל משנה רק פרטים; אי אפשר להחליף בו את התמונה.
  hidePhoto?: boolean;
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
  hidePhoto = false,
}: TeudaFieldsProps) {
  const isOther = values.hechsher === options.hechsherOtherValue;
  const maxMegabytes = Math.round(options.maxImageBytes / (1024 * 1024));

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={`${idPrefix}-hechsher`} className={labelClassName}>
          Hechsher (kashrut supervision)
        </label>
        <select
          id={`${idPrefix}-hechsher`}
          required
          disabled={disabled}
          value={values.hechsher}
          onChange={(event) => onChange('hechsher', event.target.value)}
          className={inputClassName}
        >
          <option value="">Choose...</option>
          {options.hechsherOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.labelEn}
            </option>
          ))}
          <option value={options.hechsherOtherValue}>Other (type below)</option>
        </select>
      </div>

      {isOther && (
        <div>
          <label htmlFor={`${idPrefix}-hechsher-other`} className={labelClassName}>
            Name of the hechsher
          </label>
          <input
            id={`${idPrefix}-hechsher-other`}
            type="text"
            required
            maxLength={100}
            disabled={disabled}
            value={values.hechsherOther}
            onChange={(event) => onChange('hechsherOther', event.target.value)}
            className={inputClassName}
          />
        </div>
      )}

      <div>
        <label htmlFor={`${idPrefix}-level`} className={labelClassName}>
          Kashrut level
        </label>
        <select
          id={`${idPrefix}-level`}
          required
          disabled={disabled}
          value={values.kashrutLevel}
          onChange={(event) => onChange('kashrutLevel', event.target.value)}
          className={inputClassName}
        >
          <option value="">Choose...</option>
          {options.kashrutLevels.map((level) => (
            <option key={level} value={level}>
              {getKashrutLevelLabel(level)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-expiration`} className={labelClassName}>
          Expiration date on the certificate
        </label>
        <input
          id={`${idPrefix}-expiration`}
          type="date"
          required
          disabled={disabled}
          value={values.expirationDate}
          onChange={(event) => onChange('expirationDate', event.target.value)}
          className={inputClassName}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${idPrefix}-mashgiach-name`} className={labelClassName}>
            Mashgiach name
          </label>
          <input
            id={`${idPrefix}-mashgiach-name`}
            type="text"
            required
            maxLength={100}
            disabled={disabled}
            value={values.mashgiachName}
            onChange={(event) => onChange('mashgiachName', event.target.value)}
            className={inputClassName}
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-mashgiach-phone`} className={labelClassName}>
            Mashgiach phone
          </label>
          <input
            id={`${idPrefix}-mashgiach-phone`}
            type="tel"
            required
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
          Photo of the certificate
        </label>
        <input
          id={`${idPrefix}-photo`}
          type="file"
          required
          accept="image/jpeg,image/png,image/webp"
          disabled={disabled}
          onChange={onPhotoChange}
          className="mt-1 block w-full text-sm text-gray-700 file:mr-3 file:rounded file:border-0 file:bg-green-50 file:px-3 file:py-2 file:font-medium file:text-green-800 hover:file:bg-green-100"
        />
        <p className="mt-1 text-xs text-gray-500">JPG, PNG or WebP, up to {maxMegabytes} MB.</p>
        {photo && !photoError && <p className="mt-1 text-xs text-gray-600">Selected: {photo.name}</p>}
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
