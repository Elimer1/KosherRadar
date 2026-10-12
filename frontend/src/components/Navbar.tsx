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
          <div role="group" aria-label={t('nav.language')} className="flex overflow-hidden rounded border border-green-600">
            <button
              type="button"
              aria-pressed={language === 'en'}
              onClick={() => handleLanguage('en')}
              className={`min-h-11 px-2 py-1 ${language === 'en' ? 'bg-green-600 text-white' : 'text-green-700'}`}
            >
              {t('nav.english')}
            </button>
            <button
              type="button"
              aria-pressed={language === 'he'}
              onClick={() => handleLanguage('he')}
              className={`min-h-11 px-2 py-1 ${language === 'he' ? 'bg-green-600 text-white' : 'text-green-700'}`}
            >
              {t('nav.hebrew')}
            </button>
          </div>
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
              <Link to="/account/submissions" className="inline-flex min-h-11 items-center text-gray-700 hover:text-green-700">
                {t('nav.mySubmissions')}
              </Link>
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
      </nav>
    </header>
  );
}

export default Navbar;
