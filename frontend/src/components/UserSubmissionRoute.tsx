import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function UserSubmissionRoute() {
  const user = useAuthStore((state) => state.user);
  const { restaurantId } = useParams();
  if (user?.role === 'ADMIN') {
    return <Navigate replace to={restaurantId ? `/admin/restaurants/${restaurantId}/add-teuda` : '/admin/restaurants/new'} />;
  }
  return <Outlet />;
}
