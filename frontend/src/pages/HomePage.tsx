import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import LocationField from '../components/LocationField';
import RestaurantCard from '../components/RestaurantCard';
import RestaurantMap from '../components/RestaurantMap';
import SearchBar from '../components/SearchBar';
import SearchFiltersPanel from '../components/SearchFiltersPanel';
import { useFormOptions } from '../hooks/useFormOptions';
import { useRestaurantSearch } from '../hooks/useRestaurantSearch';
import { useSearchCriteria } from '../hooks/useSearchCriteria';
import type { SearchFilters } from '../types/search';
import { readSavedView, saveView } from '../utils/mapView';
import type { DiscoveryView } from '../utils/mapView';
import { primaryButtonCompactClassName, secondaryButtonClassName } from '../components/formStyles';

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
  const { options } = useFormOptions();

  // NEW (UX WP1A/1B): the address holds the applied search. Typed text is committed after a short pause, or immediately on Enter, Search, or a filter.
  // חדש (חבילת UX 1A/1B): הכתובת מחזיקה את החיפוש שהוחל. טקסט מוקלד נשמר אחרי הפסקה קצרה, או מיד ב-Enter, בחיפוש, או במסנן.
  const criteria = useSearchCriteria();
  const filters = criteria.filters;
  const [showFilters, setShowFilters] = useState(false);
  // NEW (Milestone 5): list and map are never shown together. The choice is remembered on this browser.
  // חדש (אבן דרך 5): רשימה ומפה לא מוצגות יחד. הבחירה נשמרת בדפדפן הזה.
  const [view, setView] = useState<DiscoveryView>(() => readSavedView());

  const search = useRestaurantSearch(filters, view === 'list' && !criteria.locationPending);
  const activeFilterCount = countActiveFilters(filters);
  const hechsherOptions = options?.hechsherOptions || [];
  const hasAnySearchChoice = filters.q.trim() !== '' || activeFilterCount > 0;

  const handleFiltersChange = (next: SearchFilters) => {
    criteria.updateFilters({
      level: next.level,
      hechsher: next.hechsher,
      foodType: next.foodType,
      category: next.category,
      hideExpired: next.hideExpired,
      includeUnknown: next.includeUnknown,
      radiusKm: next.radiusKm,
    });
  };

  const handleViewChange = (next: DiscoveryView) => {
    setView(next);
    saveView(next);
  };

  const listStatus = (() => {
    if (view !== 'list') {
      return '';
    }

    if (criteria.locationPending || search.loading) {
      return t('home.searching');
    }

    if (search.error && search.items.length === 0) {
      return search.error;
    }

    if (!search.error && search.items.length === 0) {
      return hasAnySearchChoice ? t('home.noMatchTitle') : t('home.emptyTitle');
    }

    const countText =
      search.total === 1 ? t('home.foundOne', { count: search.total }) : t('home.foundMany', { count: search.total });

    return search.error ? `${countText}. ${search.error}` : countText;
  })();

  const viewButtonClass = (selected: boolean) =>
    `min-h-11 flex-1 rounded-lg px-4 py-2 text-sm font-medium sm:flex-none ${
      selected ? 'bg-green-700 text-white shadow-sm' : 'text-gray-700 hover:bg-green-50 hover:text-green-800'
    }`;

  return (
    <div>
      <section className="pb-2 pt-2 text-center sm:pb-4 sm:pt-6">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          <span className="text-green-800">{t('home.title')}</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-gray-600">{t('home.intro')}</p>
      </section>

      <div className="mx-auto max-w-3xl">
        <SearchBar
          text={criteria.draftQuery}
          onTextChange={criteria.setDraftQuery}
          onSearch={criteria.commitDraftQuery}
          onPickSuggestion={(restaurantId) => criteria.openRestaurant(restaurantId, false)}
          filters={filters}
          hechsherOptions={hechsherOptions}
        />
        <LocationField
          key={`${criteria.locationSource ?? 'none'}:${criteria.applied.near}`}
          filters={filters}
          appliedLabel={criteria.applied.near}
          locationSource={criteria.locationSource}
          onPickLocation={criteria.pickLocation}
          onClearLocation={criteria.clearLocation}
        />
      </div>

      <div className="mt-6 lg:grid lg:grid-cols-[18rem_1fr] lg:gap-6">
        <aside className="mb-4 lg:mb-0">
          <button
            type="button"
            onClick={() => setShowFilters((current) => !current)}
            aria-expanded={showFilters}
            aria-controls="search-filters"
            className={`${secondaryButtonClassName} w-full lg:hidden`}
          >
            {showFilters ? t('home.hideFilters') : t('home.filters')}
            {activeFilterCount > 0 && ` (${activeFilterCount})`}
          </button>

          <div id="search-filters" className={`mt-3 lg:mt-0 lg:block ${showFilters ? 'block' : 'hidden'}`}>
            <SearchFiltersPanel filters={filters} options={options} onChange={handleFiltersChange} />
          </div>
        </aside>

        <section
          aria-label={t('home.results')}
          aria-busy={view === 'list' && (criteria.locationPending || search.loading)}
        >
          <p className="sr-only" role="status" aria-live="polite">
            {listStatus}
          </p>
          <div
            role="group"
            aria-label={t('home.view')}
            className="mb-4 flex w-full gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm sm:inline-flex sm:w-auto"
          >
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

          {view === 'map' && !criteria.locationPending && (
            <RestaurantMap
              filters={filters}
              hechsherOptions={hechsherOptions}
              returnState={criteria.restaurantState}
              onOpenRestaurant={criteria.openRestaurant}
            />
          )}

          {view === 'list' && search.atlasUnavailable && (
            <p role="status" className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              {t('home.atlasDown')}
            </p>
          )}

          {(criteria.locationPending || (view === 'list' && search.loading)) && (
            <p className="flex items-center justify-center gap-2 py-10 text-gray-600">
              <span className="kr-spinner" aria-hidden="true" />
              {t('home.searching')}
            </p>
          )}

          {view === 'list' && !search.loading && search.error && search.items.length === 0 && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
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
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-gray-700 shadow-sm">
              {hasAnySearchChoice ? (
                <>
                  <p className="font-medium">{t('home.noMatchTitle')}</p>
                  <p className="mt-1 text-sm">{t('home.noMatchBody')}</p>
                  <button
                    type="button"
                    onClick={criteria.clearAll}
                    className={`${secondaryButtonClassName} mt-4`}
                  >
                    {t('home.clear')}
                  </button>
                </>
              ) : (
                <>
                  <p className="font-medium">{t('home.emptyTitle')}</p>
                  <p className="mt-1 text-sm">
                    {t('home.emptyBody')}{' '}
                    <Link to="/submit-restaurant" className="font-medium text-green-800 underline">
                      {t('home.addRestaurant')}
                    </Link>
                  </p>
                </>
              )}
            </div>
          )}

          {view === 'list' && search.items.length > 0 && (
            <>
              <p className="mb-3 text-sm font-medium text-gray-700">
                {search.total === 1 ? t('home.foundOne', { count: search.total }) : t('home.foundMany', { count: search.total })}
              </p>

              {search.capped && (
                <p role="status" className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                  {t('home.capped')}
                </p>
              )}

              <ul className="space-y-4">
                {search.items.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    hechsherOptions={hechsherOptions}
                    returnState={criteria.restaurantState}
                    onOpenRestaurant={criteria.openRestaurant}
                  />
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
                    className={primaryButtonCompactClassName}
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
