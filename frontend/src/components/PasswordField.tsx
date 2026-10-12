import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { inputClassName, labelClassName } from './formStyles';

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  minLength?: number;
  maxLength?: number;
  hint?: string;
}

function PasswordField({ id, label, value, onChange, autoComplete, minLength, maxLength, hint }: PasswordFieldProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          required
          minLength={minLength}
          maxLength={maxLength}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClassName} pe-11`}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? t('common.hidePassword') : t('common.showPassword')}
          aria-pressed={visible}
          className="absolute inset-y-0 end-0 mt-1 flex w-11 items-center justify-center text-muted hover:text-ink"
        >
          {visible ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M3 3l18 18" strokeLinecap="round" />
              <path d="M10.6 10.6A2 2 0 0 0 12 14a2 2 0 0 0 1.4-.6" strokeLinecap="round" />
              <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 9.3 3.1 11 7.5a11.6 11.6 0 0 1-4.1 5.2" strokeLinecap="round" />
              <path d="M6.1 6.1C4.2 7.4 2.7 9.3 1 12.5 2.7 16.9 7 20 12 20c1.1 0 2.2-.2 3.2-.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M2 12.5C3.7 8.1 8 5 12 5s8.3 3.1 10 7.5C20.3 16.9 16 20 12 20S3.7 16.9 2 12.5Z" />
              <circle cx="12" cy="12.5" r="2.5" />
            </svg>
          )}
        </button>
      </div>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export default PasswordField;
