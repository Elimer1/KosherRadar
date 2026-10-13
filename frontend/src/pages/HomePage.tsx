import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import DiscoveryFilterDialog from '../components/DiscoveryFilterDialog';
import DiscoveryMethods from '../components/discovery/DiscoveryMethods';
import DiscoveryPreview from '../components/discovery/DiscoveryPreview';
import { discoveryCopy } from '../components/discovery/discoveryCopy';
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
  dangerButtonClassName,
  errorNoticeClassName,
  primaryButtonCompactClassName,
  quietActionClassName,
  warningNoticeClassName,
} from '../components/formStyles';

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

const focusControl = (id: string) => {
  document.getElementById(id)?.focus();
};

function HomePage() {
  const { t } = useTranslation();
  const copy = discoveryCopy();
  const { options } = useFormOptions();
  const criteria = useSearchCriteria();
  const filters = criteria.filters;
  const [showFilters, setShowFilters] = useState(false);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const desktopFilters = useMinWidth(1024);
  const [view, setView] = useState<DiscoveryView>(() => readSavedView());

  const search = useRestaurantSearch(filters, view === 'list' && !criteria.locationBlocked);
  const activeFilterCount = countActiveFilters(filters);
  const hechsherOptions = options?.hechsherOptions || [];
  const hasAnySearchChoice = filters.q.trim() !== '' || activeFilterCount > 0 || criteria.applied.near !== '';
  const showDirectory = view === 'map' || hasAnySearchChoice || directoryOpen;
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

  const handleSearch = (text: string) => {
    criteria.commitDraftQuery(text);
    setDirectoryOpen(true);
  };

  const handleClearAll = () => {
    criteria.clearAll();
    setDirectoryOpen(false);
  };

  const listStatus = (() => {
    if (view !== 'list' || !showDirectory) {
      return '';
    }

    if (criteria.locationPending || search.loading) {
      return t('home.searching');
    }

    if (criteria.locationError) return t('location.' + (criteria.locationError === 'not_found' ? 'noMatch' : criteria.locationError));

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
    `min-h-12 flex-1 border-b-2 px-3 text-sm font-semibold sm:flex-none ${
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

  const showCount = view === 'list' && !criteria.locationBlocked && !search.loading && !search.error && search.items.length > 0;
  const resultCount =
    search.total === 1 ? t('home.foundOne', { count: search.total }) : t('home.foundMany', { count: search.total });
  const placeContext =
    criteria.locationSource === 'device'
      ? t('location.using', { place: t('location.current') })
      : criteria.locationSource === 'named' && criteria.applied.near.trim()
        ? t('location.using', { place: criteria.applied.near.trim() })
        : '';

  const composer = (
    <SearchBar
      key="discovery-composer"
      text={criteria.draftQuery}
      onTextChange={criteria.setDraftQuery}
      onSearch={handleSearch}
      onPickSuggestion={(restaurantId) => criteria.openRestaurant(restaurantId, false)}
      filters={filters}
      hechsherOptions={hechsherOptions}
    >
      <LocationField
        key={`${criteria.locationSource ?? 'none'}:${criteria.applied.near}`}
        filters={filters}
        appliedLabel={criteria.applied.near}
        locationSource={criteria.locationSource}
        onPickLocation={criteria.pickLocation}
        onClearLocation={criteria.clearLocation}
      />
    </SearchBar>
  );

  const viewSwitch = (
    <div role="group" aria-label={t('home.view')} className="kr-view-toggle flex min-h-12 border-b border-soft">
      <button type="button" aria-pressed={view === 'list'} onClick={() => handleViewChange('list')} className={viewButtonClass(view === 'list')}>
        {t('home.list')}
      </button>
      <button type="button" aria-pressed={view === 'map'} onClick={() => handleViewChange('map')} className={viewButtonClass(view === 'map')}>
        {t('home.map')}
      </button>
    </div>
  );

  return (
    <section className={`${showDirectory ? 'v2-results-page' : 'v2-intro'} v2-wrap`}>
      {!showDirectory && (
        <div className="v2-intro-copy">
          <p className="v2-lead">{copy.lead}</p>
          <h1 className="v2-display">{t('home.heading')}</h1>
          <p className="v2-support">{t('home.intro')}</p>
        </div>
      )}

      {composer}

      {view === 'list' && !criteria.locationBlocked && !search.loading && search.capped && (
        <p role="status" className={`mt-4 ${warningNoticeClassName}`}>{t('home.capped')}</p>
      )}

      {criteria.locationError && (
        <div role="alert" className={`mt-4 ${errorNoticeClassName}`}>
          <p>{t('location.' + (criteria.locationError === 'not_found' ? 'noMatch' : criteria.locationError))}</p>
          <button type="button" onClick={criteria.retryLocation} className={dangerButtonClassName}>{t('common.tryAgain')}</button>
          <button type="button" onClick={criteria.clearLocation} className={quietActionClassName}>{t('location.clear')}</button>
        </div>
      )}

      {!showDirectory && (
        <DiscoveryMethods
          onSearchByName={() => focusControl('restaurant-search')}
          onExploreArea={() => focusControl('search-location')}
          onNearMe={() => document.getElementById('use-current-location')?.click()}
        />
      )}
      {!showDirectory && <DiscoveryPreview />}

      {!showDirectory && !search.loading && search.error && (
        <div className="v2-intro-status" role="alert">
          <div className={errorNoticeClassName}>
            <p>{search.error}</p>
            <button type="button" onClick={search.retry} className={`${dangerButtonClassName} mt-3`}>
              {t('common.tryAgain')}
            </button>
          </div>
        </div>
      )}

      {!showDirectory && !search.loading && !search.error && search.items.length === 0 && search.page > 0 && (
        <div className="v2-intro-status v2-empty">
          <p className="font-semibold">{t('home.emptyTitle')}</p>
          <p className="mt-1 max-w-md text-sm leading-relaxed text-muted">
            {t('home.emptyBody')}{' '}
            <Link to="/submit-restaurant" className="font-medium text-forest underline-offset-2 hover:underline">
              {t('home.addRestaurant')}
            </Link>
          </p>
        </div>
      )}

      {showDirectory && (
        <div className="mt-8">
          <p className="sr-only" role="status" aria-live="polite">
            {listStatus}
          </p>

          <div className="v2-results-head">
            <div className="min-w-0">
              <h2 className="v2-section-title">{t('home.results')}</h2>
              {(criteria.applied.q.trim() !== '' || placeContext !== '') && (
                <p className="mt-1 text-sm text-muted">
                  {criteria.applied.q.trim() !== '' && <bdi>{criteria.applied.q.trim()}</bdi>}
                  {criteria.applied.q.trim() !== '' && placeContext !== '' && <span aria-hidden="true"> · </span>}
                  {placeContext !== '' && <bdi>{placeContext}</bdi>}
                </p>
              )}
              {showCount && <p className="mt-1 text-sm text-muted">{resultCount}</p>}
            </div>

            <div className="v2-results-tools">
              {!desktopFilters && (
                <button
                  type="button"
                  onClick={() => setShowFilters(true)}
                  aria-expanded={filtersOpen}
                  aria-controls="search-filters"
                  aria-haspopup="dialog"
                  className="v2-filter-button"
                >
                  {t('home.filters')}
                  {activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
                </button>
              )}
              {viewSwitch}
              {hasAnySearchChoice && (
                <button type="button" onClick={handleClearAll} className={quietActionClassName}>
                  {t('home.clear')}
                </button>
              )}
            </div>
          </div>

          <div className="v2-discovery">
            {desktopFilters && (
              <aside className="v2-filters">
                <div id="search-filters">{filtersPanel}</div>
              </aside>
            )}

            <div aria-label={t('home.results')} aria-busy={view === 'list' && (criteria.locationPending || search.loading)}>
              {view === 'map' && !criteria.locationBlocked && (
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
                <p className="flex items-center gap-2 py-10 text-[15px] text-muted">
                  <span className="kr-spinner" aria-hidden="true" />
                  {t('home.searching')}
                </p>
              )}

              {view === 'list' && !criteria.locationBlocked && !search.loading && search.error && search.items.length === 0 && (
                <div role="alert" className={errorNoticeClassName}>
                  <p>{search.error}</p>
                  <button type="button" onClick={search.retry} className={`${dangerButtonClassName} mt-3`}>
                    {t('common.tryAgain')}
                  </button>
                </div>
              )}

              {view === 'list' && !criteria.locationBlocked && !search.loading && !search.error && search.items.length === 0 && (
                <div className="v2-empty">
                  {hasAnySearchChoice ? (
                    <>
                      <p className="font-semibold">{t('home.noMatchTitle')}</p>
                      <p className="mt-1 max-w-md text-sm leading-relaxed text-muted">{t('home.noMatchBody')}</p>
                      <button type="button" onClick={handleClearAll} className={`${quietActionClassName} mt-2 px-0`}>
                        {t('home.clear')}
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold">{t('home.emptyTitle')}</p>
                      <p className="mt-1 max-w-md text-sm leading-relaxed text-muted">
                        {t('home.emptyBody')}{' '}
                        <Link to="/submit-restaurant" className="font-medium text-forest underline-offset-2 hover:underline">
                          {t('home.addRestaurant')}
                        </Link>
                      </p>
                    </>
                  )}
                </div>
              )}

              {view === 'list' && !criteria.locationBlocked && search.items.length > 0 && (
                <>
                  {!filters.includeUnknown && <p className="mb-3 text-sm text-muted">{t('home.unknownHidden')}</p>}

                  <ul className="v2-directory">
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
                    <p role="alert" className="mt-3 text-sm text-danger">
                      {search.error}
                    </p>
                  )}

                  {search.hasMore && (
                    <div className="mt-4">
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
            </div>
          </div>

          {!desktopFilters && (
            <DiscoveryFilterDialog open={filtersOpen} onClose={closeFilters}>
              {filtersPanel}
            </DiscoveryFilterDialog>
          )}
        </div>
      )}
    </section>
  );
}

export default HomePage;
