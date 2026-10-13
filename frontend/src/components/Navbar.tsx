import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import i18n, { activeLanguage } from '../i18n';
import { rememberLanguage } from '../utils/language';
import type { AppLanguage } from '../utils/language';

const textActionClassName =
  'inline-flex min-h-11 items-center gap-1.5 rounded-[10px] px-2.5 text-sm font-medium text-ink hover:bg-mist hover:text-forest-deep';

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M8 2.5v11M2.5 8h11" />
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

  const languageButton = (
    <button
      type="button"
      onClick={() => handleLanguage(language === 'he' ? 'en' : 'he')}
      aria-label={t('nav.switchLanguage')}
      className="inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-[10px] px-2 text-ink hover:bg-mist"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" />
      </svg>
      <span className="text-xs font-semibold">{nextCode}</span>
    </button>
  );

  const actions = (
    <>
      <Link to={user?.role === 'ADMIN' ? '/admin/restaurants/new' : '/submit-restaurant'} onClick={closeMenu} className={textActionClassName}>
        <PlusIcon />
        {t('nav.addRestaurant')}
      </Link>
      {user ? (
        <>
          {user.role === 'ADMIN' && (
            <Link to="/admin" onClick={closeMenu} className={`${textActionClassName} font-semibold`}>
              {t('nav.admin')}
            </Link>
          )}
          <Link
            to="/account"
            title={user.email}
            onClick={closeMenu}
            className={`${textActionClassName} max-w-full truncate md:max-w-48`}
          >
            {user.email}
          </Link>
          <button type="button" onClick={handleLogout} className={textActionClassName}>
            {t('nav.logout')}
          </button>
        </>
      ) : (
        <>
          <Link to="/login" onClick={closeMenu} className={textActionClassName}>
            {t('nav.login')}
          </Link>
          <Link
            to="/register"
            onClick={closeMenu}
            className="inline-flex min-h-11 items-center justify-center rounded-[10px] bg-forest px-3.5 text-sm font-semibold text-white hover:bg-forest-deep"
          >
            {t('nav.signup')}
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="kr-header sticky top-0 z-[1100] border-b border-soft bg-white text-ink">
      <nav className="v2-wrap" aria-label={t('nav.main')}>
        <div className="flex h-[68px] items-center justify-between gap-3">
          <Link to="/" onClick={closeMenu} className="inline-flex min-h-11 items-center text-lg font-semibold text-ink">
            KosherRadar
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            {actions}
            {languageButton}
          </div>
          <div className="flex items-center gap-1 md:hidden">
            {languageButton}
            <button
              type="button"
              className="inline-flex h-11 min-w-11 items-center justify-center rounded-[10px] text-ink hover:bg-mist"
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
          className={`${menuOpen ? 'flex' : 'hidden'} flex-col gap-1 border-t border-soft py-3 md:hidden`}
        >
          {actions}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
