import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import LocationField from '../components/LocationField';
import RestaurantCard from '../components/RestaurantCard';
import RestaurantMap from '../components/RestaurantMap';
import SearchBar from '../components/SearchBar';
import SearchFiltersPanel from '../components/SearchFiltersPanel';
import { useFormOptions } from '../hooks/useFormOptions';
import { useRestaurantSearch } from '../hooks/useRestaurantSearch';
import { emptySearchFilters } from '../types/search';
import type { SearchFilters } from '../types/search';
import { readSavedView, saveView } from '../utils/mapView';
import type { DiscoveryView } from '../utils/mapView';

// NEW (Milestone 4): the home page is the public search: one search box (restaurant name or food), filters,
// and the list of results, 20 at a time. Anyone can use it without an account.
// חדש (אבן דרך 4): דף הבית הוא החיפוש הציבורי: תיבת חיפוש אחת, מסננים ורשימת תוצאות, 20 בכל פעם. בלי חשבון.

// How many choices are active, shown on the "Filters" button (the text search is not a filter).
const countActiveFilters = (filters: SearchFilters) => {
  return (
    (filters.level ? 1 : 0) +
    filters.hechsher.length +
    filters.foodType.length +
    filters.category.length +
    (filters.hideExpired ? 1 : 0) +
    (filters.includeUnknown ? 1 : 0) +
    (filters.location ? 1 : 0)
  );
};

function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { options } = useFormOptions();

  // `text` is what is typed in the box; `filters.q` is the text of the last search that was run.
  const [text, setText] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(emptySearchFilters);
  const [showFilters, setShowFilters] = useState(false);
  // NEW (Milestone 5): list and map are never shown together. The choice is remembered on this browser.
  // חדש (אבן דרך 5): רשימה ומפה לא מוצגות יחד. הבחירה נשמרת בדפדפן הזה.
  const [view, setView] = useState<DiscoveryView>(() => readSavedView());
  const [locationReset, setLocationReset] = useState(0);

  const search = useRestaurantSearch(filters, view === 'list');
  const activeFilterCount = countActiveFilters(filters);
  const hechsherOptions = options?.hechsherOptions || [];
  const hasAnySearchChoice = filters.q.trim() !== '' || activeFilterCount > 0;

  const handleSearch = (searchText: string) => {
    setFilters((current) => ({ ...current, q: searchText.trim() }));
  };

  const handleClearAll = () => {
    setText('');
    setFilters(emptySearchFilters);
    setLocationReset((current) => current + 1);
  };

  const handleViewChange = (next: DiscoveryView) => {
    setView(next);
    saveView(next);
  };

  const viewButtonClass = (selected: boolean) =>
    `min-h-11 flex-1 rounded px-3 py-2 text-sm font-medium sm:flex-none ${
      selected ? 'bg-green-600 text-white' : 'border border-green-600 text-green-700 hover:bg-green-50'
    }`;

  return (
    <div>
      <section className="py-4 text-center sm:py-8">
        <h1 className="text-3xl font-bold text-green-700 sm:text-4xl">{t('home.title')}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-gray-600">{t('home.intro')}</p>
      </section>

      <div className="mx-auto max-w-3xl">
        <SearchBar
          text={text}
          onTextChange={setText}
          onSearch={handleSearch}
          onPickSuggestion={(restaurantId) => navigate(`/restaurants/${restaurantId}`)}
          filters={filters}
          hechsherOptions={hechsherOptions}
        />
        <LocationField key={locationReset} filters={filters} onChange={setFilters} />
      </div>

      <div className="mt-6 lg:grid lg:grid-cols-[18rem_1fr] lg:gap-6">
        <aside className="mb-4 lg:mb-0">
          <button
            type="button"
            onClick={() => setShowFilters((current) => !current)}
            aria-expanded={showFilters}
            aria-controls="search-filters"
            className="w-full rounded border border-green-600 px-3 py-2 font-medium text-green-700 hover:bg-green-50 lg:hidden"
          >
            {showFilters ? t('home.hideFilters') : t('home.filters')}
            {activeFilterCount > 0 && ` (${activeFilterCount})`}
          </button>

          <div id="search-filters" className={`mt-3 lg:mt-0 lg:block ${showFilters ? 'block' : 'hidden'}`}>
            <SearchFiltersPanel filters={filters} options={options} onChange={setFilters} />
          </div>
        </aside>

        <section aria-live="polite" aria-label={t('home.results')}>
          <div role="group" aria-label={t('home.view')} className="mb-3 flex gap-2">
            <button
              type="button"
              aria-pressed={view === 'list'}
              onClick={() => handleViewChange('list')}
              className={viewButtonClass(view === 'list')}
            >
              {t('home.list')}
            </button>
            <button
              type="button"
              aria-pressed={view === 'map'}
              onClick={() => handleViewChange('map')}
              className={viewButtonClass(view === 'map')}
            >
              {t('home.map')}
            </button>
          </div>

          {view === 'map' && <RestaurantMap filters={filters} hechsherOptions={hechsherOptions} />}

          {view === 'list' && search.atlasUnavailable && (
            <p role="status" className="mb-3 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {t('home.atlasDown')}
            </p>
          )}

          {view === 'list' && search.loading && <p className="py-8 text-center text-gray-600">{t('home.searching')}</p>}

          {view === 'list' && !search.loading && search.error && search.items.length === 0 && (
            <div role="alert" className="rounded border border-red-200 bg-red-50 p-4 text-red-800">
              <p>{search.error}</p>
              <button
                type="button"
                onClick={search.retry}
                className="mt-2 rounded border border-red-300 px-3 py-1.5 text-sm font-medium hover:bg-red-100"
              >
                {t('common.tryAgain')}
              </button>
            </div>
          )}

          {view === 'list' && !search.loading && !search.error && search.items.length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-700">
              {hasAnySearchChoice ? (
                <>
                  <p className="font-medium">{t('home.noMatchTitle')}</p>
                  <p className="mt-1 text-sm">{t('home.noMatchBody')}</p>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="mt-3 rounded border border-green-600 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50"
                  >
                    {t('home.clear')}
                  </button>
                </>
              ) : (
                <>
                  <p className="font-medium">{t('home.emptyTitle')}</p>
                  <p className="mt-1 text-sm">
                    {t('home.emptyBody')}{' '}
                    <Link to="/submit-restaurant" className="font-medium text-green-700 underline">
                      {t('home.addRestaurant')}
                    </Link>
                  </p>
                </>
              )}
            </div>
          )}

          {view === 'list' && search.items.length > 0 && (
            <>
              <p className="mb-3 text-sm text-gray-600">
                {search.total === 1 ? t('home.foundOne', { count: search.total }) : t('home.foundMany', { count: search.total })}
              </p>

              {search.capped && (
                <p role="status" className="mb-3 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  {t('home.capped')}
                </p>
              )}

              <ul className="space-y-3">
                {search.items.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} hechsherOptions={hechsherOptions} />
                ))}
              </ul>

              {search.error && (
                <p role="alert" className="mt-3 text-sm text-red-700">
                  {search.error}
                </p>
              )}

              {search.hasMore && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={search.loadMore}
                    disabled={search.loadingMore}
                    className="rounded bg-green-600 px-6 py-2.5 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {search.loadingMore ? t('home.loadingMore') : t('home.loadMore')}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default HomePage;
