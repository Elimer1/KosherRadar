// NEW (Milestone 3): dashboard tab "Expiring Soon": approved certificates that expire in the next 30 days.
// חדש (אבן דרך 3): לשונית "פגות בקרוב": תעודות מאושרות שפוקעות ב-30 הימים הקרובים.
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getExpiringSoon } from '../../api/adminApi';
import { getErrorMessage } from '../../api/errors';
import { describeDaysLeft } from '../../utils/adminLabels';
import type { ExpiringTeuda } from '../../types/admin';
import type { HechsherOption } from '../../types/submissions';
import FormAlert from '../FormAlert';
import TeudaFacts from './TeudaFacts';

interface ExpiringSoonTabProps {
  hechsherOptions: HechsherOption[];
}

function ExpiringSoonTab({ hechsherOptions }: ExpiringSoonTabProps) {
  const { t } = useTranslation();
  const [items, setItems] = useState<ExpiringTeuda[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadItems = async () => {
      try {
        setItems(await getExpiringSoon());
      } catch (err) {
        setError(getErrorMessage(err, t('desk.loadExpiring')));
      }
    };

    loadItems();
  }, [t]);

  return (
    <section className="space-y-4" aria-label={t('desk.expiringLabel')}>
      <p className="text-sm text-gray-600">{t('desk.expiringBody')}</p>
      <FormAlert message={error} />

      {!items && !error && <p className="text-gray-600">{t('common.loading')}</p>}
      {items && items.length === 0 && <p className="text-gray-600">{t('desk.noneExpiring')}</p>}

      <ul className="space-y-4">
        {items?.map((teuda) => (
          <li key={teuda.id} className="space-y-2 rounded border border-green-100 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="text-lg font-semibold text-gray-900">{teuda.restaurant?.name || t('desk.unknownRestaurant')}</h3>
              <span className="rounded bg-amber-50 px-2 py-0.5 text-sm font-medium text-amber-900">
                {describeDaysLeft(teuda.daysLeft)}
              </span>
            </div>
            <TeudaFacts teuda={teuda} hechsherOptions={hechsherOptions} />
            {teuda.restaurant && (
              <Link to={`/admin/restaurants/${teuda.restaurant.id}`} className="text-sm font-medium text-green-700 underline">
                {t('desk.openRestaurant')}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ExpiringSoonTab;
