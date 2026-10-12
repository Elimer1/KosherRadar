import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import Navbar from './Navbar';
import { useAuthStore } from '../stores/authStore';

function Layout() {
  const { t } = useTranslation();
  const sessionExpired = useAuthStore((state) => state.sessionExpired);
  const dismissSessionExpired = useAuthStore((state) => state.dismissSessionExpired);

  usePageMeta(t('meta.title'), t('meta.description'));

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {sessionExpired && (
        <div role="alert" className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <span>{t('layout.sessionExpired')}</span>
            <button type="button" onClick={dismissSessionExpired} className="font-medium underline">
              {t('layout.dismiss')}
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8 md:px-8 lg:py-10">
        <Outlet />
      </main>

      <footer className="border-t border-green-100 px-4 py-4 text-center text-xs text-gray-500">
        {t('layout.footer')}
      </footer>
    </div>
  );
}

export default Layout;
