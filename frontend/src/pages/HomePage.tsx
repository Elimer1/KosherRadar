import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import DiscoveryFilterDialog from '../components/DiscoveryFilterDialog';
import LocationField from '../components/LocationField';
import RestaurantCard from '../components/RestaurantCard';
import RestaurantMap from '../components/RestaurantMap';
import SearchBar from '../components/SearchBar';
import SearchFiltersPanel from '../components/SearchFiltersPanel';
import { useFormOptions } from '../hooks/useFormOptions';
import { useMinWidth } from '../hooks/useMinWidth';
import { useRestaurantSearch } from '../hooks/useRestaurantSearch';
import { useSearchCriteria } from '../hooks/useSearchCriteria';
import { forgetSearchScroll, readSearchScroll } from '../search/searchReturn';
import type { SearchFilters } from '../types/search';
import { readSavedView, saveView } from '../utils/mapView';
import type { DiscoveryView } from '../utils/mapView';
import {
  errorNoticeClassName,
  primaryButtonCompactClassName,
  quietActionClassName,
  secondaryButtonClassName,
  warningNoticeClassName,
} from '../components/formStyles';

// How many choices are active, shown on the Filters button (the text search is not a filter).
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

  // The address holds the applied search. Typed text is committed after a short pause, or immediately on Enter, Search, or a filter.
  const criteria = useSearchCriteria();
  const filters = criteria.filters;
  const [showFilters, setShowFilters] = useState(false);
  const desktopFilters = useMinWidth(1024);
  // List and map are never shown together. The choice is remembered on this browser.
  const [view, setView] = useState<DiscoveryView>(() => readSavedView());

  const search = useRestaurantSearch(filters, view === 'list' && !criteria.locationPending);
  const activeFilterCount = countActiveFilters(filters);
  const hechsherOptions = options?.hechsherOptions || [];
  const hasAnySearchChoice = filters.q.trim() !== '' || activeFilterCount > 0;
  const closeFilters = useCallback(() => setShowFilters(false), []);
  const filtersOpen = showFilters && !desktopFilters;

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

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return;
    }

    const media = window.matchMedia('(min-width: 1024px)');
    const onChange = () => {
      if (media.matches) {
        setShowFilters(false);
      }
    };

    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (view !== 'list' || criteria.locationPending || search.loading) {
      return;
    }

    const saved = readSearchScroll();

    if (!saved || saved.path !== criteria.returnPath) {
      return;
    }

    forgetSearchScroll();
    const link = document.querySelector<HTMLElement>(`a[href="/restaurants/${saved.restaurantId}"]`);

    if (link) {
      link.focus();
      return;
    }

    window.scrollTo(0, saved.scrollY);
  }, [view, criteria.locationPending, criteria.returnPath, search.loading, search.items]);

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

    const unknownNote = !filters.includeUnknown ? t('home.unknownHidden') : '';

    return [countText, unknownNote, search.error].filter((part) => part !== '').join('. ');
  })();

  const viewButtonClass = (selected: boolean) =>
    `min-h-11 flex-1 border-b-2 px-4 text-sm font-semibold transition-colors sm:flex-none ${
      selected ? 'border-forest text-ink' : 'border-transparent text-muted hover:text-ink'
    }`;

  const filtersPanel = (
    <SearchFiltersPanel
      filters={filters}
      options={options}
      onChange={handleFiltersChange}
      showHeading={desktopFilters}
    />
  );

  const resultCount =
    search.total === 1 ? t('home.foundOne', { count: search.total }) : t('home.foundMany', { count: search.total });

  return (
    <div>
      <section className="bg-forest-deep px-4 pb-16 pt-8 text-white sm:px-6 sm:pt-10 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="discovery-title max-w-3xl text-3xl font-semibold leading-[1.12] text-white sm:text-5xl">
            {t('home.heading')}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-mist">{t('home.intro')}</p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="relative z-10 -mt-10 rounded-[1.75rem] bg-white p-3 shadow-[0_24px_60px_rgba(15,61,45,0.16)] ring-1 ring-black/5 sm:p-5">
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

      <div className="mt-10 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start lg:gap-10">
        {desktopFilters && (
          <aside className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto border-soft lg:border-e lg:pe-6">
            <div id="search-filters">{filtersPanel}</div>
          </aside>
        )}

        <section
          aria-label={t('home.results')}
          aria-busy={view === 'list' && (criteria.locationPending || search.loading)}
        >
          <p className="sr-only" role="status" aria-live="polite">
            {listStatus}
          </p>

          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink">{t('home.results')}</h2>
              {view === 'list' && search.items.length > 0 && <p className="mt-0.5 text-sm text-muted">{resultCount}</p>}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {!desktopFilters && (
              <button
                type="button"
                onClick={() => setShowFilters(true)}
                aria-expanded={filtersOpen}
                aria-controls="search-filters"
                aria-haspopup="dialog"
                className="inline-flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl bg-white px-4 text-sm font-semibold text-ink ring-1 ring-soft sm:w-auto"
              >
                <span>
                  {t('home.filters')}
                  {activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
                </span>
              </button>
            )}

            <div
                role="group"
                aria-label={t('home.view')}
                className="kr-view-toggle flex w-full border-b border-soft sm:w-auto"
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

              {hasAnySearchChoice && (
                <button type="button" onClick={criteria.clearAll} className={quietActionClassName}>
                  {t('home.clear')}
                </button>
              )}
            </div>
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
            <p role="status" className={`mb-3 ${warningNoticeClassName}`}>
              {t('home.atlasDown')}
            </p>
          )}

          {(criteria.locationPending || (view === 'list' && search.loading)) && (
            <p className="flex items-center justify-center gap-2 py-16 text-muted">
              <span className="kr-spinner" aria-hidden="true" />
              {t('home.searching')}
            </p>
          )}

          {view === 'list' && !search.loading && search.error && search.items.length === 0 && (
            <div role="alert" className={errorNoticeClassName}>
              <p>{search.error}</p>
              <button
                type="button"
                onClick={search.retry}
                className="mt-3 inline-flex min-h-11 items-center rounded-xl border border-red-800 bg-white px-3.5 text-sm font-medium text-red-900 hover:bg-red-50"
              >
                {t('common.tryAgain')}
              </button>
            </div>
          )}

          {view === 'list' && !search.loading && !search.error && search.items.length === 0 && (
            <div className="rounded-3xl bg-white px-6 py-14 text-center text-ink ring-1 ring-soft">
              {hasAnySearchChoice ? (
                <>
                  <p className="font-medium">{t('home.noMatchTitle')}</p>
                  <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-muted">{t('home.noMatchBody')}</p>
                  <button type="button" onClick={criteria.clearAll} className={`${secondaryButtonClassName} mt-4`}>
                    {t('home.clear')}
                  </button>
                </>
              ) : (
                <>
                  <p className="font-medium">{t('home.emptyTitle')}</p>
                  <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-muted">
                    {t('home.emptyBody')}{' '}
                    <Link to="/submit-restaurant" className="font-medium text-forest underline-offset-2 hover:underline">
                      {t('home.addRestaurant')}
                    </Link>
                  </p>
                </>
              )}
            </div>
          )}

          {view === 'list' && search.items.length > 0 && (
            <>
              {!filters.includeUnknown && <p className="mb-3 text-sm text-muted">{t('home.unknownHidden')}</p>}

              {search.capped && (
                <p role="status" className={`mb-3 ${warningNoticeClassName}`}>
                  {t('home.capped')}
                </p>
              )}

              <ul className="overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-soft">
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
                <p role="alert" className="mt-3 text-sm text-red-900">
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

      {!desktopFilters && (
        <DiscoveryFilterDialog open={filtersOpen} onClose={closeFilters}>
          {filtersPanel}
        </DiscoveryFilterDialog>
      )}
      </div>
    </div>
  );
}

export default HomePage;
