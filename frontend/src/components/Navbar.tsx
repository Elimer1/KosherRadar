import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import i18n, { activeLanguage } from '../i18n';
import { rememberLanguage } from '../utils/language';
import type { AppLanguage } from '../utils/language';

function Navbar() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const language = activeLanguage();

  const handleLanguage = (next: AppLanguage) => {
    rememberLanguage(next);
    void i18n.changeLanguage(next);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="border-b border-green-100 bg-white">
      <nav
        className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3"
        aria-label={t('nav.main')}
      >
        <Link to="/" className="text-xl font-bold text-green-700">
          KosherRadar
        </Link>

        <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 text-sm sm:w-auto sm:justify-end">
          <Link to="/submit-restaurant" className="inline-flex min-h-11 items-center text-gray-700 hover:text-green-700">
            {t('nav.addRestaurant')}
          </Link>
          {user ? (
            <>
              {/* NEW (Milestone 3): only admins see this link / חדש (אבן דרך 3): רק מנהלים רואים קישור זה */}
              {user.role === 'ADMIN' && (
                <Link to="/admin" className="inline-flex min-h-11 items-center font-medium text-green-700 hover:underline">
                  {t('nav.admin')}
                </Link>
              )}
              <Link to="/account" className="inline-flex min-h-11 items-center text-gray-700 hover:text-green-700">
                {user.email}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded border border-green-600 px-3 py-1.5 font-medium text-green-700 hover:bg-green-50"
              >
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="inline-flex min-h-11 items-center text-gray-700 hover:text-green-700">
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="min-h-11 rounded bg-green-600 px-3 py-1.5 font-medium text-white hover:bg-green-700"
              >
                {t('nav.signup')}
              </Link>
            </>
          )}
        </div>
        {/* NEW (update): one globe in the corner switches the language. The labeled pair was too prominent. */}
        {/* חדש (עדכון): גלובוס אחד בפינה מחליף את השפה. זוג הכפתורים עם השמות היה בולט מדי. */}
        <button
          type="button"
          onClick={() => handleLanguage(language === 'he' ? 'en' : 'he')}
          aria-label={t('nav.switchLanguage')}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-green-700 hover:bg-green-50"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18" />
            <path d="M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" />
          </svg>
        </button>
      </nav>
    </header>
  );
}

export default Navbar;
