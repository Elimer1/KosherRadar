// NEW (Milestone 3): the page opened from the emailed link. The user chooses a new password; the one-time
// token comes from the address. The user is not logged in automatically: they log in with the new password.
// חדש (אבן דרך 3): הדף שנפתח מהקישור במייל. המשתמש בוחר סיסמה חדשה; הטוקן החד-פעמי מגיע מהכתובת.
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { resetPassword } from '../api/authApi';
import { getRecoveryErrorMessage, isInvalidResetLinkError } from '../api/errors';
import FormAlert from '../components/FormAlert';
import PasswordField from '../components/PasswordField';
import { primaryButtonClassName } from '../components/formStyles';
import { readResetToken } from '../utils/resetToken';
import { useAuthStore } from '../stores/authStore';

const panelClassName = 'rounded-2xl border border-soft bg-white shadow-[0_8px_24px_rgba(23,75,58,0.06)]';

function ResetPasswordPage() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [token] = useState(() => readResetToken(location.search, location.hash));
  const [invalidLink, setInvalidLink] = useState(false);

  useEffect(() => {
    // Keep the token only in component memory. Refreshing the cleaned URL requires reopening the email.
    if (location.search || location.hash) navigate('/reset-password', { replace: true });
  }, [location.search, location.hash, navigate]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.mismatch'));
      return;
    }

    if (password.length < 8 || new TextEncoder().encode(password).length > 72) {
      setError(t('auth.passwordLimits'));
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, password, i18n.resolvedLanguage === 'he' ? 'he' : 'en');
      useAuthStore.getState().logout();
      setPassword('');
      setConfirmPassword('');
      setDone(true);
    } catch (err) {
      setInvalidLink(isInvalidResetLinkError(err));
      setError(getRecoveryErrorMessage(err, t('auth.resetFailed')));
    } finally {
      setLoading(false);
    }
  };

  if (!token || invalidLink) {
    return (
      <div className={`mx-auto max-w-md space-y-4 p-6 sm:p-8 ${panelClassName}`}>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('auth.resetInvalidTitle')}</h1>
        <FormAlert message={invalidLink ? t('auth.resetExpiredBody') : t('auth.resetInvalidBody')} />
        <Link to="/forgot-password" className="inline-block font-medium text-grove hover:underline">
          {t('auth.requestNewLink')}
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className={`mx-auto max-w-md space-y-4 p-6 sm:p-8 ${panelClassName}`}>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('auth.passwordChanged')}</h1>
        <FormAlert kind="success" message={t('auth.passwordChangedBody')} />
        <Link to="/login" className="inline-block font-medium text-grove hover:underline">
          {t('auth.goToLogin')}
        </Link>
      </div>
    );
  }

  return (
    <div className={`mx-auto max-w-md p-6 sm:p-8 ${panelClassName}`}>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('auth.newPassword')}</h1>

      <form onSubmit={handleSubmit} aria-busy={loading} className="mt-6 space-y-4">
        <FormAlert message={error} />

        <PasswordField
          id="reset-password"
          label={t('auth.newPassword')}
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          hint={t('auth.passwordLimits')}
          value={password}
          onChange={setPassword}
        />

        <PasswordField
          id="reset-confirm-password"
          label={t('auth.confirmNew')}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />

        <button type="submit" disabled={loading} className={primaryButtonClassName}>
          {loading ? t('auth.saving') : t('auth.changePassword')}
        </button>
      </form>

      {error && (
        <p className="mt-4 text-sm text-muted">
          {t('auth.linkUsed')}{' '}
          <Link to="/forgot-password" className="font-medium text-grove hover:underline">
            {t('auth.requestAnother')}
          </Link>
        </p>
      )}
    </div>
  );
}

export default ResetPasswordPage;
