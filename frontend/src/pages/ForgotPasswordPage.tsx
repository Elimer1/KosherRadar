// NEW (Milestone 3): "forgot password" page. It shows the same message whether or not the email has an account,
// and it never claims that an email was sent.
// חדש (אבן דרך 3): דף "שכחתי סיסמה". מציג אותה הודעה בין אם יש חשבון ובין אם לא, ולא טוען שנשלח מייל.
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../api/authApi';
import { getRecoveryErrorMessage } from '../api/errors';
import FormAlert from '../components/FormAlert';
import { inputClassName, labelClassName, primaryButtonClassName } from '../components/formStyles';

function ForgotPasswordPage() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await requestPasswordReset(email, i18n.resolvedLanguage === 'he' ? 'he' : 'en');
      setRequested(true);
    } catch (err) {
      setError(getRecoveryErrorMessage(err, t('auth.forgotFailed')));
    } finally {
      setLoading(false);
    }
  };

  if (requested) {
    return (
      <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-soft bg-white p-6 shadow-[0_8px_24px_rgba(23,75,58,0.06)] sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('auth.checkEmail')}</h1>
        <FormAlert kind="success" message={t('auth.forgotConfirmation')} />
        <p className="text-sm text-muted">{t('auth.linkOnce')}</p>
        <button type="button" onClick={() => { setRequested(false); setError(''); }} className="block font-medium text-grove hover:underline">
          {t('auth.requestNewLink')}
        </button>
        <Link to="/login" className="inline-block font-medium text-grove hover:underline">
          {t('auth.backToLogin')}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-soft bg-white p-6 shadow-[0_8px_24px_rgba(23,75,58,0.06)] sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('auth.forgotTitle')}</h1>
      <p className="mt-2 text-sm text-muted">{t('auth.forgotBody')}</p>

      <form onSubmit={handleSubmit} aria-busy={loading} className="mt-6 space-y-4">
        <FormAlert message={error} />

        <div>
          <label htmlFor="forgot-email" className={labelClassName}>
            {t('common.email')}
          </label>
          <input
            id="forgot-email"
            type="email"
            required
            autoComplete="email"
            dir="ltr"
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClassName}
          />
        </div>

        <button type="submit" disabled={loading} className={primaryButtonClassName}>
          {loading ? t('auth.sending') : t('auth.sendLink')}
        </button>
      </form>

      <p className="mt-4 text-sm text-muted">
        <Link to="/login" className="font-medium text-grove hover:underline">
          {t('auth.backToLogin')}
        </Link>
      </p>
    </div>
  );
}

export default ForgotPasswordPage;
