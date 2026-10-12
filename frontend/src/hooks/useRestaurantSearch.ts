// NEW (Milestone 4): loads the first page of search results whenever the text or a filter changes, and
// the next page when the visitor presses "Load More". The server does the filtering and sorting.
// חדש (אבן דרך 4): טוען את העמוד הראשון בכל שינוי של טקסט או מסנן, ואת העמוד הבא ב"טען עוד". השרת מסנן וממיין.
import { useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../api/errors';
import i18n from '../i18n';
import { searchRestaurants } from '../api/searchApi';
import type { RestaurantCardData, SearchFilters, SearchResult } from '../types/search';
import { appendNewRestaurants } from '../utils/searchResults';

interface SearchState {
  items: RestaurantCardData[];
  page: number;
  total: number;
  hasMore: boolean;
  capped: boolean;
  atlasUnavailable: boolean;
}

const emptyState: SearchState = {
  items: [],
  page: 0,
  total: 0,
  hasMore: false,
  capped: false,
  atlasUnavailable: false,
};

const toState = (result: SearchResult, items: RestaurantCardData[]): SearchState => ({
  items,
  page: result.page,
  total: result.total,
  hasMore: result.hasMore,
  capped: result.capped,
  atlasUnavailable: result.search.atlasUnavailable,
});

// `enabled` is false while the map is showing, so the list does not keep loading pages in the background.
// enabled הוא false בזמן שהמפה מוצגת, כדי שהרשימה לא תמשיך לטעון עמודים ברקע.
export const useRestaurantSearch = (filters: SearchFilters, enabled = true) => {
  const [state, setState] = useState<SearchState>(emptyState);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [retryCounter, setRetryCounter] = useState(0);

  // Any change of text or filters means a new search that starts again from page 1.
  const filtersKey = JSON.stringify(filters);
  const latestFiltersKey = useRef(filtersKey);

  useEffect(() => {
    latestFiltersKey.current = filtersKey;

    if (!enabled) {
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    // `ignore` stops a slow answer for OLD filters from replacing the answer for the current ones.
    let ignore = false;

    const loadFirstPage = async () => {
      setLoading(true);
      setLoadingMore(false);
      setError('');
      setState(emptyState);

      try {
        const result = await searchRestaurants(filters, 1);

        if (!ignore) {
          setState(toState(result, result.items));
        }
      } catch (err) {
        if (!ignore) {
          setError(getErrorMessage(err, i18n.t('home.loadError')));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadFirstPage();

    return () => {
      ignore = true;
    };
    // `filters` is rebuilt on every render; `filtersKey` is its content, which is the real trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, retryCounter, enabled]);

  const loadMore = async () => {
    if (loading || loadingMore || !state.hasMore) {
      return;
    }

    const keyWhenStarted = filtersKey;
    setLoadingMore(true);
    setError('');

    try {
      const result = await searchRestaurants(filters, state.page + 1);

      // The visitor changed the filters while this page was loading: the answer belongs to an old search.
      if (latestFiltersKey.current === keyWhenStarted) {
        setState((current) => toState(result, appendNewRestaurants(current.items, result.items)));
      }
    } catch (err) {
      if (latestFiltersKey.current === keyWhenStarted) {
        setError(getErrorMessage(err, i18n.t('home.moreError')));
      }
    } finally {
      if (latestFiltersKey.current === keyWhenStarted) {
        setLoadingMore(false);
      }
    }
  };

  const retry = () => setRetryCounter((current) => current + 1);

  return { ...state, loading, loadingMore, error, loadMore, retry };
};
