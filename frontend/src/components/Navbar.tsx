import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import i18n, { activeLanguage } from '../i18n';
import { rememberLanguage } from '../utils/language';
import type { AppLanguage } from '../utils/language';
import { secondaryButtonClassName } from './formStyles';

const navLinkClassName =
  'inline-flex min-h-11 items-center rounded-lg px-2.5 text-sm text-ink hover:bg-mist hover:text-forest';

function Mark() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8 shrink-0">
      <rect width="32" height="32" rx="8" fill="#174B3A" />
      <circle cx="16" cy="16" r="7" fill="none" stroke="#DCEAE4" strokeWidth="1.6" />
      <circle cx="16" cy="16" r="3" fill="none" stroke="#C48B47" strokeWidth="1.6" />
      <circle cx="16" cy="16" r="1.4" fill="#F7F8F4" />
    </svg>
  );
}

function Navbar() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const language = activeLanguage();
  const nextCode = language === 'he' ? 'EN' : 'עב';

  const handleLanguage = (next: AppLanguage) => {
    rememberLanguage(next);
    void i18n.changeLanguage(next);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-[1100] border-b border-soft bg-white/95 shadow-[0_1px_0_rgba(23,75,58,0.08)] backdrop-blur-sm">
      <nav
        className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
        aria-label={t('nav.main')}
      >
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-forest">
            <Mark />
            KosherRadar
          </Link>
          <button
            type="button"
            onClick={() => handleLanguage(language === 'he' ? 'en' : 'he')}
            aria-label={t('nav.switchLanguage')}
            className="inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-2 text-forest hover:bg-mist"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18" />
              <path d="M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" />
            </svg>
            <span className="text-xs font-semibold tracking-wide">{nextCode}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-x-1 gap-y-1 sm:justify-end">
          <Link to="/submit-restaurant" className={navLinkClassName}>
            {t('nav.addRestaurant')}
          </Link>
          {user ? (
            <>
              {/* NEW (Milestone 3): only admins see this link / חדש (אבן דרך 3): רק מנהלים רואים קישור זה */}
              {user.role === 'ADMIN' && (
                <Link to="/admin" className={`${navLinkClassName} font-medium text-forest`}>
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
                className="inline-flex min-h-11 items-center rounded-lg bg-forest px-3.5 text-sm font-medium text-white shadow-sm hover:bg-forest-deep"
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
