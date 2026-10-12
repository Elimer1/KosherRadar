// NEW (Milestone 3): the page opened from the emailed link. The user chooses a new password; the one-time
// token comes from the address. The user is not logged in automatically: they log in with the new password.
// חדש (אבן דרך 3): הדף שנפתח מהקישור במייל. המשתמש בוחר סיסמה חדשה; הטוקן החד-פעמי מגיע מהכתובת.
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { resetPassword } from '../api/authApi';
import { getErrorMessage } from '../api/errors';
import FormAlert from '../components/FormAlert';
import PasswordField from '../components/PasswordField';
import { primaryButtonClassName } from '../components/formStyles';
import { readResetToken } from '../utils/resetToken';

function ResetPasswordPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const token = readResetToken(location.search);

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

    setLoading(true);

    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(getErrorMessage(err, t('auth.resetFailed')));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">{t('auth.resetInvalidTitle')}</h1>
        <FormAlert message={t('auth.resetInvalidBody')} />
        <Link to="/forgot-password" className="inline-block font-medium text-green-700 hover:underline">
          {t('auth.requestNewLink')}
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">{t('auth.passwordChanged')}</h1>
        <FormAlert kind="success" message={t('auth.passwordChangedBody')} />
        <Link to="/login" className="inline-block font-medium text-green-700 hover:underline">
          {t('auth.goToLogin')}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-gray-900">{t('auth.newPassword')}</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <FormAlert message={error} />

        <PasswordField
          id="reset-password"
          label={t('auth.newPassword')}
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          hint={t('auth.passwordHint')}
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
        <p className="mt-4 text-sm text-gray-600">
          {t('auth.linkUsed')}{' '}
          <Link to="/forgot-password" className="font-medium text-green-700 hover:underline">
            {t('auth.requestAnother')}
          </Link>
        </p>
      )}
    </div>
  );
}

export default ResetPasswordPage;
