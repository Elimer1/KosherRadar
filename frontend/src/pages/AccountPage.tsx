import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyProfile } from '../api/authApi';
import { getErrorMessage } from '../api/errors';
import type { UserProfile } from '../types/auth';

function AccountPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getMyProfile();
        setProfile(data);
      } catch (err) {
        setError(getErrorMessage(err, 'Could not load your account.'));
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return <p className="text-gray-600">Loading your account...</p>;
  }

  if (error || !profile) {
    return (
      <p role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {error || 'Could not load your account.'}
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-gray-900">My account</h1>

      <div className="mt-6 rounded border border-green-200 bg-green-50 px-4 py-5">
        <p className="text-sm font-medium text-green-800">Contribution points</p>
        <p className="mt-1 text-4xl font-bold text-gray-900">{profile.points}</p>
        <p className="mt-2 text-sm text-gray-700">Only you can see this number. Approving or editing as an admin does not earn points.</p>
        <ul className="mt-3 list-disc space-y-1 ps-5 text-sm text-gray-700">
          <li>+3 when a new restaurant you sent with a certificate is approved</li>
          <li>+2 when a certificate you added to an existing restaurant is approved</li>
          <li>+1 when a report you sent leads to a correction</li>
        </ul>
      </div>

      <dl className="mt-6 divide-y divide-green-100 rounded border border-green-100">
        <div className="flex justify-between gap-4 px-4 py-3">
          <dt className="text-gray-600">Email</dt>
          <dd className="break-all font-medium text-gray-900">{profile.email}</dd>
        </div>
        <div className="flex justify-between gap-4 px-4 py-3">
          <dt className="text-gray-600">Role</dt>
          <dd className="font-medium text-gray-900">{profile.role === 'ADMIN' ? 'Administrator' : 'Member'}</dd>
        </div>
      </dl>

      <Link to="/account/submissions" className="mt-4 inline-block font-medium text-green-700 underline">
        My submissions
      </Link>
    </div>
  );
}

export default AccountPage;
