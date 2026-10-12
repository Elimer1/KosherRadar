import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import i18n, { activeLanguage } from '../i18n';
import { rememberLanguage } from '../utils/language';
import type { AppLanguage } from '../utils/language';
import { secondaryButtonClassName } from './formStyles';

const navLinkClassName =
  'inline-flex min-h-11 items-center rounded-lg px-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-800';

function LanguageButton({ className, label, onClick }: { className: string; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`h-11 w-11 items-center justify-center rounded-full text-green-800 hover:bg-green-50 ${className}`}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" />
      </svg>
    </button>
  );
}

function Navbar() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const language = activeLanguage();
  const languageLabel = t('nav.switchLanguage');

  const handleLanguage = (next: AppLanguage) => {
    rememberLanguage(next);
    void i18n.changeLanguage(next);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const switchLanguage = () => handleLanguage(language === 'he' ? 'en' : 'he');

  return (
    <header className="sticky top-0 z-[1100] border-b border-green-100 bg-white/95 shadow-sm backdrop-blur-sm">
      <nav
        className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:py-3"
        aria-label={t('nav.main')}
      >
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="text-xl font-bold tracking-tight text-green-800">
            KosherRadar
          </Link>
          <LanguageButton className="inline-flex sm:hidden" label={languageLabel} onClick={switchLanguage} />
        </div>

        <div className="flex flex-wrap items-center gap-x-1 gap-y-1 sm:ms-auto sm:justify-end">
          <Link to="/submit-restaurant" className={navLinkClassName}>
            {t('nav.addRestaurant')}
          </Link>
          {user ? (
            <>
              {/* NEW (Milestone 3): only admins see this link / חדש (אבן דרך 3): רק מנהלים רואים קישור זה */}
              {user.role === 'ADMIN' && (
                <Link to="/admin" className={`${navLinkClassName} font-medium text-green-800`}>
                  {t('nav.admin')}
                </Link>
              )}
              <Link to="/account" title={user.email} className={`${navLinkClassName} max-w-48 truncate`}>
                {user.email}
              </Link>
              <button type="button" onClick={handleLogout} className={secondaryButtonClassName}>
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={navLinkClassName}>
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="inline-flex min-h-11 items-center rounded-lg bg-green-700 px-3.5 text-sm font-medium text-white shadow-sm hover:bg-green-800"
              >
                {t('nav.signup')}
              </Link>
            </>
          )}
          <LanguageButton className="hidden sm:inline-flex" label={languageLabel} onClick={switchLanguage} />
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
