import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import i18n, { activeLanguage } from '../i18n';
import { rememberLanguage } from '../utils/language';
import type { AppLanguage } from '../utils/language';

const navLinkClassName =
  'inline-flex min-h-11 items-center rounded-full px-3 text-sm text-mist hover:bg-white/10 hover:text-white';

function Mark() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8 shrink-0">
      <rect width="32" height="32" rx="10" fill="#F4F0E8" />
      <circle cx="16" cy="16" r="6.5" fill="none" stroke="#0F3D2D" strokeWidth="1.7" />
      <circle cx="16" cy="16" r="2.1" fill="#0F3D2D" />
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
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLanguage = (next: AppLanguage) => {
    rememberLanguage(next);
    void i18n.changeLanguage(next);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="kr-header sticky top-0 z-[1100] bg-forest-deep text-white">
      <nav
        className="mx-auto flex max-w-6xl flex-col px-4 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-6 lg:px-8"
        aria-label={t('nav.main')}
      >
        <div className="flex min-h-16 items-center justify-between gap-3">
          <Link to="/" onClick={closeMenu} className="inline-flex min-h-11 items-center gap-2.5 text-lg font-semibold tracking-tight text-white">
            <Mark />
            KosherRadar
          </Link>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleLanguage(language === 'he' ? 'en' : 'he')}
              aria-label={t('nav.switchLanguage')}
              className="inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-2 text-mist hover:bg-white/10 hover:text-white"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18" />
                <path d="M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" />
              </svg>
              <span className="text-xs font-semibold tracking-wide">{nextCode}</span>
            </button>
            <button
              type="button"
              className="inline-flex h-11 min-w-11 items-center justify-center rounded-full text-white hover:bg-white/10 md:hidden"
              aria-expanded={menuOpen}
              aria-controls="primary-nav"
              onClick={() => setMenuOpen((current) => !current)}
            >
              <span className="sr-only">{t('nav.main')}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>

        <div
          id="primary-nav"
          className={`${menuOpen ? 'flex' : 'hidden'} flex-col gap-1 border-t border-white/15 py-3 md:flex md:flex-row md:flex-wrap md:items-center md:justify-end md:gap-1 md:border-0 md:py-0`}
        >
          <Link to="/submit-restaurant" onClick={closeMenu} className={navLinkClassName}>
            {t('nav.addRestaurant')}
          </Link>
          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <Link to="/admin" onClick={closeMenu} className={`${navLinkClassName} font-semibold text-white`}>
                  {t('nav.admin')}
                </Link>
              )}
              <Link
                to="/account"
                title={user.email}
                onClick={closeMenu}
                className={`${navLinkClassName} max-w-full truncate md:max-w-48`}
              >
                {user.email}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/35 px-3.5 text-sm font-medium text-white hover:bg-white/10"
              >
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu} className={navLinkClassName}>
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                onClick={closeMenu}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-canvas px-4 text-sm font-semibold text-forest-deep hover:bg-white"
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
