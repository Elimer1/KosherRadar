import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import MySubmissionsPage from './pages/MySubmissionsPage';
import SubmitRestaurantPage from './pages/SubmitRestaurantPage';
import SubmitReportPage from './pages/SubmitReportPage';
import SubmitTeudaPage from './pages/SubmitTeudaPage';
import NotFoundPage from './pages/NotFoundPage';
// NEW (Milestone 4) / חדש (אבן דרך 4)
import RestaurantDetailsPage from './pages/RestaurantDetailsPage';
// NEW (Milestone 3) / חדש (אבן דרך 3)
import AdminRoute from './components/AdminRoute';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminAddTeudaPage from './pages/AdminAddTeudaPage';
import AdminCreateRestaurantPage from './pages/AdminCreateRestaurantPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminRestaurantPage from './pages/AdminRestaurantPage';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        {/* NEW (Milestone 4): public restaurant page, no login needed / חדש (אבן דרך 4): דף מסעדה ציבורי */}
        <Route path="/restaurants/:restaurantId" element={<RestaurantDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* NEW (Milestone 3): password reset pages (no login needed) / חדש (אבן דרך 3): דפי איפוס סיסמה */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Pages below need a logged-in user */}
        <Route element={<ProtectedRoute />}>
          <Route path="/account" element={<AccountPage />} />
          <Route path="/account/submissions" element={<MySubmissionsPage />} />
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
