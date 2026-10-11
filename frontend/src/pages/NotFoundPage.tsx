import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="py-12 text-center">
      <h1 className="text-2xl font-bold text-gray-900">Page not found</h1>
      <p className="mt-2 text-gray-600">The page you are looking for does not exist.</p>
      <Link to="/" className="mt-4 inline-block font-medium text-green-700 hover:underline">
        Back to home
      </Link>
    </div>
  );
}

export default NotFoundPage;
