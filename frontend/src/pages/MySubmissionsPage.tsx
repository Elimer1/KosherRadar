import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { getMySubmissions } from '../api/submissionsApi';
import { getErrorMessage } from '../api/errors';
import FormAlert from '../components/FormAlert';
import type { MySubmissions } from '../types/mySubmissions';
import { getStatusLabel } from '../utils/adminLabels';
import { activeLanguage } from '../i18n';

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(activeLanguage() === 'he' ? 'he-IL' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

function StatusList({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
      {children || <p className="text-sm text-muted">{empty}</p>}
    </section>
  );
}

// NEW (update): the list lives on the account page. The old address still opens that page.
// חדש (עדכון): הרשימה יושבת בדף החשבון. הכתובת הישנה עדיין פותחת את הדף הזה.
export function SubmissionsPanel() {
  const { t } = useTranslation();
  const [submissions, setSubmissions] = useState<MySubmissions | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setSubmissions(await getMySubmissions());
      } catch (err) {
        setError(getErrorMessage(err, t('forms.loadSubmissions')));
      }
    };

    load();
  }, [t]);

  if (error) {
    return <FormAlert message={error} />;
  }

  if (!submissions) {
    return <p className="text-muted">{t('forms.loadingSubmissions')}</p>;
  }

  return (
    <div className="mt-8 space-y-8">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-ink">{t('forms.mySubmissions')}</h2>
        <p className="mt-2 text-sm text-muted">{t('forms.submissionsBody')}</p>
        <p className="mt-2 text-sm text-muted">{t('forms.submissionsLimit')}</p>
      </div>

      <StatusList title={t('forms.restaurants')} empty={t('forms.noRestaurants')}>
        {submissions.restaurants.length > 0 && (
          <ul className="space-y-3">
            {submissions.restaurants.map((restaurant) => (
              <li key={restaurant.id} className="rounded-2xl border border-soft bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-ink">{restaurant.name}</p>
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-ink">
                    {getStatusLabel(restaurant.status)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted">{formatDate(restaurant.createdAt)}</p>
                {restaurant.rejectionReason && (
                  <p className="mt-2 text-sm text-ink">{t('forms.reason', { reason: restaurant.rejectionReason })}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </StatusList>

      <StatusList title={t('forms.certificates')} empty={t('forms.noCertificates')}>
        {submissions.teudot.length > 0 && (
          <ul className="space-y-3">
            {submissions.teudot.map((teuda) => (
              <li key={teuda.id} className="rounded-2xl border border-soft bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-ink">{teuda.restaurantName || t('forms.fallbackRestaurant')}</p>
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-ink">
                    {getStatusLabel(teuda.status)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {formatDate(teuda.createdAt)}
                  {teuda.points > 0 ? ` · ${t('forms.pointsEarned', { count: teuda.points })}` : ''}
                </p>
                {teuda.rejectionReason && (
                  <p className="mt-2 text-sm text-ink">{t('forms.reason', { reason: teuda.rejectionReason })}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </StatusList>

      <StatusList title={t('forms.reports')} empty={t('forms.noReports')}>
        {submissions.reports.length > 0 && (
          <ul className="space-y-3">
            {submissions.reports.map((report) => (
              <li key={report.id} className="rounded-2xl border border-soft bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-ink">{report.restaurantName || t('forms.fallbackRestaurant')}</p>
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-ink">
                    {getStatusLabel(report.status)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink">{report.description}</p>
                <p className="mt-1 text-sm text-muted">
                  {formatDate(report.createdAt)}
                  {report.points > 0 ? ` · ${t('forms.pointsEarned', { count: report.points })}` : ''}
                </p>
                {report.status === 'RESOLVED' && (
                  <p className="mt-2 text-sm text-ink">
                    {report.correctionApplied ? t('forms.correctionApplied') : t('forms.closedWithoutChange')}
                  </p>
                )}
                {report.rejectionReason && (
                  <p className="mt-2 text-sm text-ink">{t('forms.reason', { reason: report.rejectionReason })}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </StatusList>
    </div>
  );
}

export default SubmissionsPanel;
