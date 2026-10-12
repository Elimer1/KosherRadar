// NEW (Milestone 3): wraps the admin pages. This only decides what the screen shows. The real protection is on
// the server: every /api/admin request is checked for a valid token and the ADMIN role.
// חדש (אבן דרך 3): עוטף את דפי המנהל. זה רק קובע מה מוצג. ההגנה האמיתית בשרת: כל בקשת /api/admin נבדקת.
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

function AdminRoute() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  if (user?.role !== 'ADMIN') {
    return (
      <p role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        This area is only for administrators.
      </p>
    );
  }

  return <Outlet />;
}

export default AdminRoute;
