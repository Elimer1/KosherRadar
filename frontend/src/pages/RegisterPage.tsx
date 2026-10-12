import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/authApi';
import { getErrorMessage } from '../api/errors';
import PasswordField from '../components/PasswordField';
import { inputClassName, labelClassName, primaryButtonClassName } from '../components/formStyles';
import { useAuthStore } from '../stores/authStore';
import { loginReasonKey } from '../utils/loginReason';
import { safeReturnPath } from '../utils/returnPath';

function RegisterPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const location = useLocation();
  const requestedFrom = (location.state as { from?: unknown } | null)?.from;
  const redirectTo = typeof requestedFrom === 'string' ? safeReturnPath(requestedFrom) : null;
  const reasonKey = redirectTo ? loginReasonKey(redirectTo) : null;
  const afterSignUp = reasonKey && redirectTo ? redirectTo : '/account';

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.mismatch'));
      return;
    }

    setLoading(true);

    try {
      // Only email and password are sent. The server decides the role (always USER).
      const result = await registerUser({ email, password });
      setAuth(result.token, result.user);
      navigate(afterSignUp, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, t('auth.registerFailed')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900">{t('auth.registerTitle')}</h1>
      {reasonKey && <p className="mt-2 text-sm text-gray-700">{t(reasonKey)}</p>}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="email" className={labelClassName}>
            {t('common.email')}
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClassName}
          />
        </div>

        <PasswordField
          id="password"
          label={t('common.password')}
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          hint={t('auth.passwordHint')}
          value={password}
          onChange={setPassword}
        />

        <PasswordField
          id="confirmPassword"
          label={t('auth.confirm')}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />

        <button
          type="submit"
          disabled={loading}
          className={primaryButtonClassName}
        >
          {loading ? t('auth.creating') : t('nav.signup')}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-600">
        {t('auth.haveAccount')}{' '}
        <Link
          to="/login"
          state={reasonKey && redirectTo ? { from: redirectTo } : undefined}
          className="font-medium text-green-800 hover:underline"
        >
          {t('nav.login')}
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;
