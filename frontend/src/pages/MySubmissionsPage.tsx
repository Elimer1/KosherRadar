import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { getMySubmissions } from '../api/submissionsApi';
import { getErrorMessage } from '../api/errors';
import FormAlert from '../components/FormAlert';
import type { MySubmissions } from '../types/mySubmissions';
import { getStatusLabel } from '../utils/adminLabels';

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
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
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {children || <p className="text-sm text-gray-600">{empty}</p>}
    </section>
  );
}

function MySubmissionsPage() {
  const [submissions, setSubmissions] = useState<MySubmissions | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setSubmissions(await getMySubmissions());
      } catch (err) {
        setError(getErrorMessage(err, 'Could not load your submissions.'));
      }
    };

    load();
  }, []);

  if (error) {
    return <FormAlert message={error} />;
  }

  if (!submissions) {
    return <p className="text-gray-600">Loading your submissions...</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link to="/account" className="text-sm font-medium text-green-700 underline">
          Back to my account
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">My submissions</h1>
        <p className="mt-2 text-sm text-gray-600">
          Restaurants, certificates and reports you sent, and what happened to each one.
        </p>
      </div>

      <StatusList title="Restaurants" empty="You have not sent a restaurant yet.">
        {submissions.restaurants.length > 0 && (
          <ul className="space-y-3">
            {submissions.restaurants.map((restaurant) => (
              <li key={restaurant.id} className="rounded border border-green-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-gray-900">{restaurant.name}</p>
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                    {getStatusLabel(restaurant.status)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{formatDate(restaurant.createdAt)}</p>
                {restaurant.rejectionReason && (
                  <p className="mt-2 text-sm text-gray-700">Reason: {restaurant.rejectionReason}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </StatusList>

      <StatusList title="Certificates" empty="You have not sent a certificate yet.">
        {submissions.teudot.length > 0 && (
          <ul className="space-y-3">
            {submissions.teudot.map((teuda) => (
              <li key={teuda.id} className="rounded border border-green-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-gray-900">{teuda.restaurantName || 'Restaurant'}</p>
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                    {getStatusLabel(teuda.status)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {formatDate(teuda.createdAt)}
                  {teuda.points > 0 ? ` · +${teuda.points} points` : ''}
                </p>
                {teuda.rejectionReason && <p className="mt-2 text-sm text-gray-700">Reason: {teuda.rejectionReason}</p>}
              </li>
            ))}
          </ul>
        )}
      </StatusList>

      <StatusList title="Reports" empty="You have not sent a report yet.">
        {submissions.reports.length > 0 && (
          <ul className="space-y-3">
            {submissions.reports.map((report) => (
              <li key={report.id} className="rounded border border-green-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-gray-900">{report.restaurantName || 'Restaurant'}</p>
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                    {getStatusLabel(report.status)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-700">{report.description}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {formatDate(report.createdAt)}
                  {report.points > 0 ? ` · +${report.points} points` : ''}
                </p>
                {report.rejectionReason && (
                  <p className="mt-2 text-sm text-gray-700">Reason: {report.rejectionReason}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </StatusList>
    </div>
  );
}

export default MySubmissionsPage;
