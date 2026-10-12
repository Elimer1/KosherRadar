import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getMyProfile } from '../api/authApi';
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
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-gray-900">{t('account.title')}</h1>

      <div className="mt-6 rounded border border-green-200 bg-green-50 px-4 py-5">
        <p className="text-sm font-medium text-green-800">{t('account.points')}</p>
        <p className="mt-1 text-4xl font-bold text-gray-900">{profile.points}</p>
        <p className="mt-2 text-sm text-gray-700">{t('account.pointsPrivate')}</p>
        <ul className="mt-3 list-disc space-y-1 ps-5 text-sm text-gray-700">
          <li>{t('account.points3')}</li>
          <li>{t('account.points2')}</li>
          <li>{t('account.points1')}</li>
        </ul>
      </div>

      <dl className="mt-6 divide-y divide-green-100 rounded border border-green-100">
        <div className="flex justify-between gap-4 px-4 py-3">
          <dt className="text-gray-600">{t('common.email')}</dt>
          <dd className="break-all font-medium text-gray-900">{profile.email}</dd>
        </div>
        <div className="flex justify-between gap-4 px-4 py-3">
          <dt className="text-gray-600">{t('account.role')}</dt>
          <dd className="font-medium text-gray-900">{profile.role === 'ADMIN' ? t('account.adminRole') : t('account.memberRole')}</dd>
        </div>
      </dl>

      <Link to="/account/submissions" className="mt-4 inline-block font-medium text-green-700 underline">
        {t('account.submissions')}
      </Link>
    </div>
  );
}

export default AccountPage;
