import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/authApi';
import { getErrorMessage } from '../api/errors';
import PasswordField from '../components/PasswordField';
import { useAuthStore } from '../stores/authStore';

function RegisterPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

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
      navigate('/account', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, t('auth.registerFailed')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-gray-900">{t('auth.registerTitle')}</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <p role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            {t('common.email')}
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
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
          className="w-full rounded bg-green-600 px-4 py-2.5 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? t('auth.creating') : t('nav.signup')}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-600">
        {t('auth.haveAccount')}{' '}
        <Link to="/login" className="font-medium text-green-700 hover:underline">
          {t('nav.login')}
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;
