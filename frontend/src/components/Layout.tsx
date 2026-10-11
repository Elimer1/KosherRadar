import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuthStore } from '../stores/authStore';

function Layout() {
  const sessionExpired = useAuthStore((state) => state.sessionExpired);
  const dismissSessionExpired = useAuthStore((state) => state.dismissSessionExpired);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {sessionExpired && (
        <div role="alert" className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <span>Your session has expired. Please log in again to continue.</span>
            <button type="button" onClick={dismissSessionExpired} className="font-medium underline">
              Dismiss
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-green-100 px-4 py-4 text-center text-xs text-gray-500">
        KosherRadar is a community information directory. It does not certify any business as kosher.
      </footer>
    </div>
  );
}

export default Layout;
