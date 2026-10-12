// NEW (Milestone 3): dashboard tab "Manage Restaurants": find any restaurant, then open it to edit or delete.
// חדש (אבן דרך 3): לשונית "ניהול מסעדות": מציאת כל מסעדה, ואז פתיחה לעריכה או מחיקה.
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { searchRestaurants } from '../../api/adminApi';
import { usePagedList } from '../../hooks/usePagedList';
import { getStatusLabel } from '../../utils/adminLabels';
import FormAlert from '../FormAlert';
import { inputClassName, labelClassName } from '../formStyles';
import Pagination from './Pagination';

function ManageRestaurantsTab() {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [status, setStatus] = useState('APPROVED');
  // The list only searches when the admin submits the form, not on every key press.
  const [applied, setApplied] = useState({ search: '', status: 'APPROVED' });

  const { data, page, setPage, error, loading } = usePagedList(
    (pageNumber) => searchRestaurants(applied.search, applied.status, pageNumber),
    `${applied.search}|${applied.status}`
  );

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    setApplied({ search: searchText.trim(), status });
  };

  return (
    <section className="space-y-4" aria-label={t('desk.manage')}>
      <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
        <div className="min-w-48 flex-1">
          <label htmlFor="manage-search" className={labelClassName}>
            {t('desk.searchName')}
          </label>
          <input
            id="manage-search"
            type="search"
            maxLength={100}
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            className={inputClassName}
          />
        </div>
        <div>
          <label htmlFor="manage-status" className={labelClassName}>
            {t('desk.status')}
          </label>
          <select
            id="manage-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className={inputClassName}
          >
            <option value="">{t('common.all')}</option>
            <option value="APPROVED">{t('admin.status.APPROVED')}</option>
            <option value="PENDING">{t('admin.status.PENDING')}</option>
            <option value="REJECTED">{t('admin.status.REJECTED')}</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
        >
          {t('common.search')}
        </button>
        <Link
          to="/admin/restaurants/new"
          className="rounded border border-green-600 px-4 py-2 font-medium text-green-700 hover:bg-green-50"
        >
          {t('nav.addRestaurant')}
        </Link>
      </form>

      <FormAlert message={error} />
      {loading && !data && <p className="text-gray-600">{t('common.loading')}</p>}
      {data && data.items.length === 0 && <p className="text-gray-600">{t('desk.noMatch')}</p>}

      <ul className="divide-y divide-green-100 rounded border border-green-100">
        {data?.items.map((restaurant) => (
          <li key={restaurant.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <div>
              <p className="font-medium text-gray-900">{restaurant.name}</p>
              <p className="text-sm text-gray-600">
                {restaurant.address}
                {restaurant.city ? `, ${restaurant.city}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                {getStatusLabel(restaurant.status)}
              </span>
              <Link to={`/admin/restaurants/${restaurant.id}`} className="text-sm font-medium text-green-700 underline">
                {t('common.open')}
              </Link>
            </div>
          </li>
        ))}
      </ul>

      {data && <Pagination page={page} totalPages={data.totalPages} total={data.total} disabled={loading} onPageChange={setPage} />}
    </section>
  );
}

export default ManageRestaurantsTab;
