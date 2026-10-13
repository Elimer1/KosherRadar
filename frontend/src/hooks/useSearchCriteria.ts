// NEW (UX WP1A): applied search lives in the URL. Draft text lives in React state.
// Device coordinates live in this history entry only, never in the shareable address or sessionStorage.
// חדש (חבילת UX 1A): חיפוש שהוחל נמצא בכתובת. טקסט בהקלדה נמצא ב-state.
// קואורדינטות של המכשיר נשמרות רק ברשומת ההיסטוריה, לא בכתובת ולא ב-sessionStorage.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { geocodePlace } from '../api/placesApi';
import { activeLanguage } from '../i18n';
import {
  canonicalSearchPath,
  cleanRadius,
  clearAppliedFilters,
  clearAppliedQuery,
  clearAppliedSearch,
  commitCriteriaPatch,
  commitDraftText,
  draftAfterAppliedChange,
  parseSearchQuery,
  type AppliedSearchCriteria,
  type SearchFilterPatch,
} from '../search/searchCriteria';
import { rememberSearchReturnPath, rememberSearchScroll, type SearchReturnState } from '../search/searchReturn';
import { toggleValue } from '../utils/searchResults';
import type { SearchFilters } from '../types/search';

export interface SearchLocationPick {
  source: 'named' | 'device';
  label: string;
  latitude: number;
  longitude: number;
}

export interface RememberedSearchLocation {
  source: 'named' | 'device';
  label: string;
  lat: number;
  lng: number;
  radiusKm: number | null;
}

const isLatLng = (lat: number, lng: number) => {
  return Number.isFinite(lat) && lat >= -90 && lat <= 90 && Number.isFinite(lng) && lng >= -180 && lng <= 180;
};

export const readRememberedLocation = (state: unknown): RememberedSearchLocation | null => {
  if (!state || typeof state !== 'object' || !('searchLocation' in state)) {
    return null;
  }

  const value = (state as { searchLocation?: unknown }).searchLocation;

  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<RememberedSearchLocation>;

  if ((candidate.source !== 'named' && candidate.source !== 'device') || typeof candidate.label !== 'string') {
    return null;
  }

  if (typeof candidate.lat !== 'number' || typeof candidate.lng !== 'number' || !isLatLng(candidate.lat, candidate.lng)) {
    return null;
  }

  return {
    source: candidate.source,
    label: candidate.label,
    lat: candidate.lat,
    lng: candidate.lng,
    radiusKm: candidate.source === 'device' ? cleanRadius(candidate.radiusKm) : null,
  };
};

// Live search waits for a short pause, then commits with replace. A filter flushes the draft sooner.
// חיפוש חי מחכה להפסקה קצרה ואז שומר עם replace. מסנן שומר את הטיוטה מיד.
export const DRAFT_COMMIT_DELAY_MS = 350;

const locationsEqual = (left: RememberedSearchLocation | null, right: RememberedSearchLocation | null) => {
  if (left === right) {
    return true;
  }

  if (!left || !right) {
    return false;
  }

  return (
    left.source === right.source &&
    left.label === right.label &&
    left.lat === right.lat &&
    left.lng === right.lng &&
    left.radiusKm === right.radiusKm
  );
};

const toFilters = (criteria: AppliedSearchCriteria, location: RememberedSearchLocation | null): SearchFilters => ({
  q: criteria.q,
  level: criteria.level,
  hechsher: criteria.hechsher,
  foodType: criteria.foodType,
  category: criteria.category,
  hideExpired: criteria.hideExpired,
  includeUnknown: criteria.includeUnknown,
  location: location ? { lat: location.lat, lng: location.lng } : null,
  radiusKm: location ? (location.source === 'device' ? location.radiusKm : criteria.radiusKm) : null,
});

// Public search-state interface consumed by the home page and intended for the design agent.
// ממשק מצב החיפוש לדף הבית, וגם לסוכן העיצוב.
export const useSearchCriteria = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const applied = useMemo(() => parseSearchQuery(location.search), [location.search]);
  const remembered = useMemo(() => readRememberedLocation(location.state), [location.state]);
  const [draftQuery, setDraftQueryState] = useState(applied.q);
  const [failedNear, setFailedNear] = useState<string | null>(null);
  const [failureReason, setFailureReason] = useState<'unavailable' | 'ambiguous' | 'not_found'>('unavailable');
  const [locationAttempt, setLocationAttempt] = useState(0);
  const seenAppliedQ = useRef(applied.q);
  const draftRef = useRef(draftQuery);
  const appliedRef = useRef(applied);
  const locationRef = useRef(location);
  const navigateRef = useRef(navigate);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const commitDraftQueryRef = useRef<(text?: string) => void>(() => {});

  const cancelDraftTimer = () => {
    if (draftTimer.current !== null) {
      clearTimeout(draftTimer.current);
      draftTimer.current = null;
    }
  };

  useEffect(() => cancelDraftTimer, []);

  useEffect(() => {
    draftRef.current = draftQuery;
    appliedRef.current = applied;
    locationRef.current = location;
    navigateRef.current = navigate;
  }, [applied, draftQuery, location, navigate]);

  const namedReady = remembered?.source === 'named' && remembered.label === applied.near ? remembered : null;
  const deviceReady = applied.near === '' && remembered?.source === 'device' ? remembered : null;
  const activeLocation = deviceReady ?? namedReady;
  const locationPending = applied.near.length >= 2 && !namedReady && failedNear !== applied.near;
  const locationBlocked = applied.near.length >= 2 && !namedReady;
  const locationError = locationBlocked && failedNear === applied.near ? failureReason : null;

  useEffect(() => {
    const nextDraft = draftAfterAppliedChange(draftRef.current, seenAppliedQ.current, applied.q);
    seenAppliedQ.current = applied.q;

    if (nextDraft !== draftRef.current) {
      cancelDraftTimer();
      draftRef.current = nextDraft;
      setDraftQueryState(nextDraft);
    }
  }, [applied.q]);

  useEffect(() => {
    rememberSearchReturnPath(canonicalSearchPath(applied));
  }, [applied]);

  useEffect(() => {
    if (location.pathname !== '/') {
      return;
    }

    const canonical = canonicalSearchPath(applied);
    const here = `${location.pathname}${location.search}`;

    if (here === canonical) {
      return;
    }

    navigate(canonical, { replace: true, state: location.state });
  }, [applied, location.pathname, location.search, location.state, navigate]);

  useEffect(() => {
    if (applied.near.length < 2 || namedReady) {
      return undefined;
    }

    let cancelled = false;
    const near = applied.near;

    geocodePlace(near, activeLanguage())
      .then((result) => {
        if (cancelled) {
          return;
        }

        const place = result.place;

        if (!result.available || !place || !isLatLng(place.latitude, place.longitude)) {
          setFailureReason(result.available && !place && result.reason === 'ambiguous' ? 'ambiguous' : result.available && !place ? 'not_found' : 'unavailable');
          setFailedNear(near);
          return;
        }

        const current = locationRef.current;
        navigateRef.current(canonicalSearchPath(parseSearchQuery(current.search)), {
          replace: true,
          state: {
            searchLocation: {
              source: 'named',
              label: near,
              lat: place.latitude,
              lng: place.longitude,
              radiusKm: null,
            } satisfies RememberedSearchLocation,
          },
        });
      })
      .catch(() => {
        if (!cancelled) {
          setFailureReason('unavailable');
          setFailedNear(near);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [applied.near, namedReady, locationAttempt]);

  const go = (
    criteria: AppliedSearchCriteria,
    history: 'push' | 'replace',
    nextLocation: RememberedSearchLocation | null
  ) => {
    const current = locationRef.current;
    const currentCriteria = canonicalSearchPath(parseSearchQuery(current.search));
    const nextCriteria = canonicalSearchPath(criteria);
    const sameCriteria = currentCriteria === nextCriteria;
    const sameLocation = locationsEqual(readRememberedLocation(current.state), nextLocation);

    if (sameCriteria && sameLocation) {
      return;
    }

    navigateRef.current(nextCriteria, {
      replace: history === 'replace' || sameCriteria,
      state: nextLocation ? { searchLocation: nextLocation } : {},
    });
  };

  const keptLocation = (criteria: AppliedSearchCriteria, explicit: RememberedSearchLocation | null | undefined) => {
    if (explicit !== undefined) {
      return explicit;
    }

    const currentLocation = readRememberedLocation(locationRef.current.state);

    if (criteria.near !== '') {
      return currentLocation?.source === 'named' && currentLocation.label === criteria.near ? currentLocation : null;
    }

    return currentLocation?.source === 'device' ? currentLocation : null;
  };

  const setDraftQuery = (text: string) => {
    const next = text.slice(0, 100);
    draftRef.current = next;
    setDraftQueryState(next);
    cancelDraftTimer();
    draftTimer.current = setTimeout(() => {
      draftTimer.current = null;
      commitDraftQueryRef.current();
    }, DRAFT_COMMIT_DELAY_MS);
  };

  const commitDraftQuery = (text?: string) => {
    cancelDraftTimer();
    const raw = text ?? draftRef.current;
    const next = commitDraftText(appliedRef.current, raw);
    // A blank commit clears the field. A non-empty commit may keep a trailing space so later
    // debounced updates do not jump the cursor while the trimmed query already matches.
    // שמירה ריקה מנקה את השדה. שמירה עם טקסט יכולה להשאיר רווח סופי כדי שהסמן לא יקפוץ.
    setDraftQueryState((current) => {
      const source = (text ?? current).slice(0, 100);

      if (next.criteria.q === '') {
        return '';
      }

      return source.trim() === next.criteria.q ? source : next.criteria.q;
    });
    go(next.criteria, 'replace', keptLocation(next.criteria, undefined));
  };

  useEffect(() => {
    commitDraftQueryRef.current = commitDraftQuery;
  });

  const updateFilters = (patch: SearchFilterPatch) => {
    // A waiting keystroke is kept and committed with this filter. Cancelling the timer does not wipe the box.
    // הקשה שממתינה נשמרת יחד עם המסנן. ביטול הטיימר לא מוחק את התיבה.
    cancelDraftTimer();
    const current = appliedRef.current;
    const currentLocation = readRememberedLocation(locationRef.current.state);
    const deviceActive = current.near === '' && currentLocation?.source === 'device';

    if (deviceActive && patch.radiusKm !== undefined && patch.near === undefined) {
      const { radiusKm, ...rest } = patch;
      const next = commitCriteriaPatch(current, draftRef.current, rest);
      const nextLocation: RememberedSearchLocation = {
        ...currentLocation,
        radiusKm: cleanRadius(radiusKm),
      };
      setDraftQueryState(next.criteria.q);
      go(next.criteria, next.changed ? 'push' : 'replace', nextLocation);
      return;
    }

    const next = commitCriteriaPatch(current, draftRef.current, patch);
    setDraftQueryState(next.criteria.q);
    go(next.criteria, 'push', keptLocation(next.criteria, undefined));
  };

  const pickLocation = (pick: SearchLocationPick) => {
    cancelDraftTimer();

    if (!isLatLng(pick.latitude, pick.longitude)) {
      return;
    }

    if (pick.source === 'device') {
      const current = appliedRef.current;
      const currentLocation = readRememberedLocation(locationRef.current.state);
      const radiusKm = current.radiusKm ?? (currentLocation?.source === 'device' ? currentLocation.radiusKm : null);
      const next = commitCriteriaPatch(current, draftRef.current, { near: '', radiusKm: null });
      setDraftQueryState(next.criteria.q);
      go(next.criteria, next.changed ? 'push' : 'replace', {
        source: 'device',
        label: '',
        lat: pick.latitude,
        lng: pick.longitude,
        radiusKm,
      });
      return;
    }

    const current = appliedRef.current;
    const currentLocation = readRememberedLocation(locationRef.current.state);
    const carriedRadius = current.radiusKm ?? (currentLocation?.source === 'device' ? currentLocation.radiusKm : null);
    const next = commitCriteriaPatch(current, draftRef.current, { near: pick.label, radiusKm: carriedRadius });

    if (next.criteria.near.length < 2) {
      return;
    }

    setDraftQueryState(next.criteria.q);
    go(next.criteria, 'push', {
      source: 'named',
      label: next.criteria.near,
      lat: pick.latitude,
      lng: pick.longitude,
      radiusKm: null,
    });
  };

  const clearLocation = () => {
    cancelDraftTimer();
    const next = commitCriteriaPatch(appliedRef.current, draftRef.current, { near: '', radiusKm: null });
    setDraftQueryState(next.criteria.q);
    go(next.criteria, next.changed ? 'push' : 'replace', null);
  };

  const clearQuery = () => {
    cancelDraftTimer();
    const next = clearAppliedQuery(appliedRef.current);
    setDraftQueryState('');
    go(next.criteria, next.changed ? 'push' : 'replace', keptLocation(next.criteria, undefined));
  };

  const clearFilters = () => {
    cancelDraftTimer();
    const next = clearAppliedFilters(appliedRef.current, draftRef.current);
    setDraftQueryState(next.criteria.q);
    go(next.criteria, 'push', null);
  };

  const clearAll = () => {
    cancelDraftTimer();
    const next = clearAppliedSearch(appliedRef.current);
    setDraftQueryState('');
    go(next.criteria, 'push', null);
  };

  const returnPath = canonicalSearchPath(applied);
  const restaurantState: SearchReturnState = {
    from: returnPath,
    ...(activeLocation ? { searchLocation: activeLocation } : {}),
  };
  const filters = toFilters(applied, activeLocation);

  const openRestaurant = (id: string, background = false) => {
    cancelDraftTimer();

    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return;
    }

    const next = commitDraftText(appliedRef.current, draftRef.current);
    const path = canonicalSearchPath(next.criteria);
    const loc = keptLocation(next.criteria, undefined);
    setDraftQueryState(next.criteria.q);
    seenAppliedQ.current = next.criteria.q;
    rememberSearchReturnPath(path);
    rememberSearchScroll(path, id, window.scrollY);

    const current = locationRef.current;
    const here = `${current.pathname}${current.search}`;

    if (here !== path || !locationsEqual(readRememberedLocation(current.state), loc)) {
      navigateRef.current(path, { replace: true, state: loc ? { searchLocation: loc } : {} });
    }

    if (!background) {
      navigateRef.current(`/restaurants/${id}`, {
        state: loc ? { from: path, searchLocation: loc } : { from: path },
      });
    }
  };

  return {
    applied,
    draftQuery,
    setDraftQuery,
    commitDraftQuery,
    updateFilters,
    setLevel: (level: string) => updateFilters({ level }),
    toggleHechsher: (value: string) => updateFilters({ hechsher: toggleValue(appliedRef.current.hechsher, value) }),
    toggleFoodType: (value: string) => updateFilters({ foodType: toggleValue(appliedRef.current.foodType, value) }),
    toggleCategory: (value: string) => updateFilters({ category: toggleValue(appliedRef.current.category, value) }),
    setHideExpired: (value: boolean) => updateFilters({ hideExpired: value }),
    setIncludeUnknown: (value: boolean) => updateFilters({ includeUnknown: value }),
    setRadiusKm: (radiusKm: number | null) => updateFilters({ radiusKm }),
    pickLocation,
    clearLocation,
    clearQuery,
    clearFilters,
    clearAll,
    filters,
    locationPending,
    locationBlocked,
    locationError,
    retryLocation: () => {
      setFailedNear(null);
      setLocationAttempt((attempt) => attempt + 1);
    },
    locationSource: (deviceReady ? 'device' : namedReady ? 'named' : null) as 'device' | 'named' | null,
    returnPath,
    restaurantState,
    openRestaurant,
  };
};

export type SearchCriteriaApi = ReturnType<typeof useSearchCriteria>;
