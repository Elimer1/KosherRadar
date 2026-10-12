import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { PageMetaProvider } from './PageMetaProvider';
import Navbar from './Navbar';
import { useAuthStore } from '../stores/authStore';

function Layout() {
  const { t } = useTranslation();
  const sessionExpired = useAuthStore((state) => state.sessionExpired);
  const dismissSessionExpired = useAuthStore((state) => state.dismissSessionExpired);

  return (
    <PageMetaProvider title={t('meta.title')} description={t('meta.description')}>
      <div className="flex min-h-screen flex-col">
        <Navbar />

        {sessionExpired && (
          <div role="alert" className="border-b border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-ink">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
              <span>{t('layout.sessionExpired')}</span>
              <button type="button" onClick={dismissSessionExpired} className="min-h-11 rounded-md px-2 font-medium underline">
                {t('layout.dismiss')}
              </button>
            </div>
          </div>
        )}

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8 md:px-8 lg:py-10">
          <Outlet />
        </main>

        <footer className="bg-forest px-4 py-5 text-center text-sm text-mist">
          <p className="mx-auto max-w-5xl">{t('layout.footer')}</p>
        </footer>
      </div>
    </PageMetaProvider>
  );
}

export default Layout;
