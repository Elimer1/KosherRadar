import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

function HomePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <section className="py-8 text-center sm:py-16">
      <h1 className="text-3xl font-bold text-green-700 sm:text-5xl">KosherRadar</h1>
      <p className="mx-auto mt-4 max-w-xl text-gray-600">
        A community directory of kashrut certificates for restaurants and food businesses in Israel.
        Verified certificates, unverified claims and expired certificates are always shown separately.
      </p>
      <p className="mx-auto mt-4 max-w-xl text-sm text-gray-500">
        Restaurant search is not available yet. You can already log in and send restaurants and certificates for
        admin review.
      </p>

      <div className="mt-6">
        <Link
          to="/submit-restaurant"
          className="inline-block rounded bg-green-600 px-5 py-2.5 font-medium text-white hover:bg-green-700"
        >
          Add a restaurant
        </Link>
      </div>

      {!user && (
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/register"
            className="w-full rounded bg-green-600 px-5 py-2.5 font-medium text-white hover:bg-green-700 sm:w-auto"
          >
            Create an account
          </Link>
          <Link
            to="/login"
            className="w-full rounded border border-green-600 px-5 py-2.5 font-medium text-green-700 hover:bg-green-50 sm:w-auto"
          >
            Log in
          </Link>
        </div>
      )}
    </section>
  );
}

export default HomePage;
