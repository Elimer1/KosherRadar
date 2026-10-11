import { useEffect, useState } from 'react';
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

      <dl className="mt-6 divide-y divide-green-100 rounded border border-green-100">
        <div className="flex justify-between gap-4 px-4 py-3">
          <dt className="text-gray-600">Email</dt>
          <dd className="break-all font-medium text-gray-900">{profile.email}</dd>
        </div>
        <div className="flex justify-between gap-4 px-4 py-3">
          <dt className="text-gray-600">Role</dt>
          <dd className="font-medium text-gray-900">{profile.role === 'ADMIN' ? 'Administrator' : 'Member'}</dd>
        </div>
        <div className="flex justify-between gap-4 px-4 py-3">
          <dt className="text-gray-600">Contribution points</dt>
          <dd className="font-medium text-gray-900">{profile.points}</dd>
        </div>
      </dl>

      <p className="mt-3 text-xs text-gray-500">Points are private. Only you can see them.</p>
    </div>
  );
}

export default AccountPage;
