import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

function Navbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="border-b border-green-100 bg-white">
      <nav
        className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3"
        aria-label="Main navigation"
      >
        <Link to="/" className="text-xl font-bold text-green-700">
          KosherRadar
        </Link>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          {user ? (
            <>
              <Link to="/account" className="text-gray-700 hover:text-green-700">
                {user.email}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded border border-green-600 px-3 py-1.5 font-medium text-green-700 hover:bg-green-50"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-green-700">
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded bg-green-600 px-3 py-1.5 font-medium text-white hover:bg-green-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
