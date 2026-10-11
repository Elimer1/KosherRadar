import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import SubmitRestaurantPage from './pages/SubmitRestaurantPage';
import SubmitReportPage from './pages/SubmitReportPage';
import SubmitTeudaPage from './pages/SubmitTeudaPage';
import NotFoundPage from './pages/NotFoundPage';
// NEW (Milestone 3) / חדש (אבן דרך 3)
import AdminRoute from './components/AdminRoute';
import AdminAddTeudaPage from './pages/AdminAddTeudaPage';
import AdminCreateRestaurantPage from './pages/AdminCreateRestaurantPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminRestaurantPage from './pages/AdminRestaurantPage';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Pages below need a logged-in user */}
        <Route element={<ProtectedRoute />}>
          <Route path="/account" element={<AccountPage />} />
          <Route path="/submit-restaurant" element={<SubmitRestaurantPage />} />
          <Route path="/restaurants/:restaurantId/add-teuda" element={<SubmitTeudaPage />} />
          <Route path="/restaurants/:restaurantId/report" element={<SubmitReportPage />} />
        </Route>

        {/* NEW (Milestone 3): admin pages. The server checks the ADMIN role on every call too. */}
        {/* חדש (אבן דרך 3): דפי מנהל. גם השרת בודק תפקיד ADMIN בכל קריאה. */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/restaurants/new" element={<AdminCreateRestaurantPage />} />
          <Route path="/admin/restaurants/:restaurantId" element={<AdminRestaurantPage />} />
          <Route path="/admin/restaurants/:restaurantId/add-teuda" element={<AdminAddTeudaPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
