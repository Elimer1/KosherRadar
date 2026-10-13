import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router-dom';
import { PageMetaProvider } from './PageMetaProvider';
import Navbar from './Navbar';
import { useAuthStore } from '../stores/authStore';

function Layout() {
  const { t } = useTranslation();
  const sessionExpired = useAuthStore((state) => state.sessionExpired);
  const dismissSessionExpired = useAuthStore((state) => state.dismissSessionExpired);
  const discoveryHome = useLocation().pathname === '/';

  return (
    <PageMetaProvider title={t('meta.title')} description={t('meta.description')}>
      <div className="flex min-h-screen flex-col bg-canvas">
        <Navbar />

        {sessionExpired && (
          <div role="alert" className="border-b border-amber-ink/30 bg-amber-soft px-4 py-2.5 text-sm text-amber-ink">
            <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-3 md:px-4">
              <span>{t('layout.sessionExpired')}</span>
              <button type="button" onClick={dismissSessionExpired} className="min-h-11 shrink-0 rounded-xl px-2 font-medium underline">
                {t('layout.dismiss')}
              </button>
            </div>
          </div>
        )}

        <main className={discoveryHome ? 'w-full flex-1 pb-12' : 'mx-auto w-full max-w-[1200px] flex-1 px-4 py-6 md:px-8 md:py-8'}>
          <Outlet />
        </main>

        <footer className="border-t border-soft px-4 py-6 text-center text-sm text-muted md:px-8">
          <p className="mx-auto max-w-[1200px] leading-relaxed">{t('layout.footer')}</p>
        </footer>
      </div>
    </PageMetaProvider>
  );
}

export default Layout;
