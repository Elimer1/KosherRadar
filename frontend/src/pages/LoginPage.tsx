import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/authApi';
import { getErrorMessage } from '../api/errors';
import PasswordField from '../components/PasswordField';
import { inputClassName, labelClassName, primaryButtonClassName } from '../components/formStyles';
import { useAuthStore } from '../stores/authStore';
import { safeReturnPath } from '../utils/returnPath';

function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const location = useLocation();

  // ProtectedRoute remembers the page the visitor wanted. Only a path inside this site is followed.
  // ProtectedRoute זוכר את הדף שהמבקר רצה. עוקבים רק אחרי נתיב בתוך האתר.
  const redirectTo = safeReturnPath((location.state as { from?: string } | null)?.from);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginUser({ email, password });
      setAuth(result.token, result.user);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, t('auth.loginFailed')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-soft bg-white p-6 shadow-[0_8px_24px_rgba(23,75,58,0.06)] sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('auth.loginTitle')}</h1>

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
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
        />

        <button
          type="submit"
          disabled={loading}
          className={primaryButtonClassName}
        >
          {loading ? t('auth.loggingIn') : t('auth.loginTitle')}
        </button>
      </form>

      {/* NEW (Milestone 3): link to the password reset / חדש (אבן דרך 3): קישור לאיפוס סיסמה */}
      <p className="mt-4 text-sm text-muted">
        <Link to="/forgot-password" className="font-medium text-forest hover:underline">
          {t('auth.forgot')}
        </Link>
      </p>

      <p className="mt-2 text-sm text-muted">
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="font-medium text-forest hover:underline">
          {t('nav.signup')}
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;
