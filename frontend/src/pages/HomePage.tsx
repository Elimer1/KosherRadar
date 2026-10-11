import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RestaurantCard from '../components/RestaurantCard';
import SearchBar from '../components/SearchBar';
import SearchFiltersPanel from '../components/SearchFiltersPanel';
import { useFormOptions } from '../hooks/useFormOptions';
import { useRestaurantSearch } from '../hooks/useRestaurantSearch';
import { emptySearchFilters } from '../types/search';
import type { SearchFilters } from '../types/search';

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
  const navigate = useNavigate();
  const { options } = useFormOptions();

  // `text` is what is typed in the box; `filters.q` is the text of the last search that was run.
  const [text, setText] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(emptySearchFilters);
  const [showFilters, setShowFilters] = useState(false);

  const search = useRestaurantSearch(filters);
  const activeFilterCount = countActiveFilters(filters);
  const hechsherOptions = options?.hechsherOptions || [];
  const hasAnySearchChoice = filters.q.trim() !== '' || activeFilterCount > 0;

  const handleSearch = (searchText: string) => {
    setFilters((current) => ({ ...current, q: searchText.trim() }));
  };

  const handleClearAll = () => {
    setText('');
    setFilters(emptySearchFilters);
  };

  return (
    <div>
      <section className="py-4 text-center sm:py-8">
        <h1 className="text-3xl font-bold text-green-700 sm:text-4xl">KosherRadar</h1>
        <p className="mx-auto mt-3 max-w-2xl text-gray-600">
          Find restaurants in Israel and see the evidence behind their kashrut: verified certificates, unverified
          claims and expired certificates are always shown separately.
        </p>
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
        <p className="mt-2 text-xs text-gray-500">
          Search by restaurant name or food. KosherRadar does not certify anything: every status shows its source.
        </p>
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
            {showFilters ? 'Hide filters' : 'Filters'}
            {activeFilterCount > 0 && ` (${activeFilterCount})`}
          </button>

          <div id="search-filters" className={`mt-3 lg:mt-0 lg:block ${showFilters ? 'block' : 'hidden'}`}>
            <SearchFiltersPanel filters={filters} options={options} onChange={setFilters} />
          </div>
        </aside>

        <section aria-live="polite" aria-label="Search results">
          {search.atlasUnavailable && (
            <p role="status" className="mb-3 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Typo-tolerant search is temporarily unavailable. Results show restaurants whose name or food starts
              with what you typed.
            </p>
          )}

          {search.loading && <p className="py-8 text-center text-gray-600">Searching...</p>}

          {!search.loading && search.error && search.items.length === 0 && (
            <div role="alert" className="rounded border border-red-200 bg-red-50 p-4 text-red-800">
              <p>{search.error}</p>
              <button
                type="button"
                onClick={search.retry}
                className="mt-2 rounded border border-red-300 px-3 py-1.5 text-sm font-medium hover:bg-red-100"
              >
                Try again
              </button>
            </div>
          )}

          {!search.loading && !search.error && search.items.length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-700">
              {hasAnySearchChoice ? (
                <>
                  <p className="font-medium">No restaurants match your search.</p>
                  <p className="mt-1 text-sm">
                    Try different words or fewer filters. Restaurants whose kashrut is unknown are hidden unless you
                    include them.
                  </p>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="mt-3 rounded border border-green-600 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50"
                  >
                    Clear search and filters
                  </button>
                </>
              ) : (
                <>
                  <p className="font-medium">No restaurants to show yet.</p>
                  <p className="mt-1 text-sm">
                    Restaurants appear here after an admin approves them.{' '}
                    <Link to="/submit-restaurant" className="font-medium text-green-700 underline">
                      Add a restaurant
                    </Link>
                  </p>
                </>
              )}
            </div>
          )}

          {search.items.length > 0 && (
            <>
              <p className="mb-3 text-sm text-gray-600">
                {search.total} {search.total === 1 ? 'restaurant' : 'restaurants'} found
              </p>

              {search.capped && (
                <p role="status" className="mb-3 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  There are very many matches, so this list may be incomplete. Add words or filters to narrow it down.
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
                    {search.loadingMore ? 'Loading...' : 'Load more'}
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
