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
    return <p className="text-muted">{t('account.loading')}</p>;
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
      <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('account.title')}</h1>

      <section className="mt-6 rounded-2xl border border-soft bg-white px-5 py-5 shadow-[0_1px_2px_rgba(23,75,58,0.05)]">
        <p className="text-sm font-medium text-grove">{t('account.points')}</p>
        <p className="mt-1 text-4xl font-semibold tracking-tight text-ink">{profile.points}</p>
        <p className="mt-3 text-sm leading-relaxed text-ink">{t('account.pointsHint')}</p>
        <ul className="mt-3 list-disc space-y-1 ps-5 text-sm text-muted">
          <li>{t('account.points3')}</li>
          <li>{t('account.points2')}</li>
          <li>{t('account.points1')}</li>
        </ul>
        <p className="mt-3 text-sm text-muted">{t('account.pointsPrivate')}</p>
      </section>

      <SubmissionsPanel />
    </div>
  );
}

export default AccountPage;
