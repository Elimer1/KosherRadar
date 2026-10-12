import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getMyProfile } from '../api/authApi';
import { SubmissionsPanel } from './MySubmissionsPage';
import { getErrorMessage } from '../api/errors';
import type { UserProfile } from '../types/auth';

function AccountPage() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getMyProfile();
        setProfile(data);
      } catch (err) {
        setError(getErrorMessage(err, t('account.loadError')));
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [t]);

  if (loading) {
    return <p className="text-gray-600">{t('account.loading')}</p>;
  }

  if (error || !profile) {
    return (
      <p role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {error || t('account.loadError')}
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">{t('account.title')}</h1>

      <div className="mt-6 rounded border border-green-200 bg-green-50 px-4 py-5">
        <p className="text-sm font-medium text-green-800">{t('account.points')}</p>
        <p className="mt-1 text-4xl font-bold text-gray-900">{profile.points}</p>
      </div>

      <SubmissionsPanel />
    </div>
  );
}

export default AccountPage;
