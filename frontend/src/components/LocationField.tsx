// The search location, separate from the restaurant-name and food box.
// A suggestion or Enter looks the place up. A miss does not invent coordinates.
// Geolocation runs only after the visitor presses the current-location control.
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { KeyboardEvent } from 'react';
import { geocodePlace, suggestPlaces } from '../api/placesApi';
import { activeLanguage } from '../i18n';
import type { AddressSuggestion, PlaceLanguage } from '../api/placesApi';
import type { SearchLocationPick } from '../hooks/useSearchCriteria';
import type { SearchFilters } from '../types/search';
import { inputClassName, labelClassName, quietActionClassName } from './formStyles';

interface LocationFieldProps {
  filters: SearchFilters;
  appliedLabel?: string;
  locationSource?: 'named' | 'device' | null;
  onPickLocation: (pick: SearchLocationPick) => void;
  onClearLocation: () => void;
  lang?: PlaceLanguage;
}

const LIST_ID = 'location-suggestions';

function LocationField({ filters, appliedLabel = '', locationSource = null, onPickLocation, onClearLocation, lang }: LocationFieldProps) {
  const { t } = useTranslation();
  const placeLanguage = lang ?? activeLanguage();
  const [text, setText] = useState(locationSource === 'device' ? '' : appliedLabel);
  const [selectedLabel, setSelectedLabel] = useState(locationSource === 'device' ? '' : appliedLabel);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [note, setNote] = useState('');
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    const query = text.trim();

    if (query.length < 2 || query === selectedLabel) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const result = await suggestPlaces(query, placeLanguage, controller.signal);

        if (controller.signal.aborted) {
          return;
        }

        setSuggestions(result.suggestions);
        setActiveIndex(-1);

        if (!result.available) {
          setNote(t('location.unavailable'));
        }
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
          setNote(t('location.unavailable'));
        }
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [text, placeLanguage, selectedLabel, t]);

  const applyPlace = (place: AddressSuggestion) => {
    setText(place.label);
    setSelectedLabel(place.label);
    setSuggestions([]);
    setOpen(false);
    setActiveIndex(-1);
    setNote('');
    onPickLocation({ source: 'named', label: place.label, latitude: place.latitude, longitude: place.longitude });
  };

  const handleClear = () => {
    setText('');
    setSelectedLabel('');
    setSuggestions([]);
    setOpen(false);
    setNote('');
    onClearLocation();
  };

  const handleLookupTyped = async () => {
    const query = text.trim();

    if (query.length < 2) {
      return;
    }

    setSuggestions([]);
    setOpen(false);
    const result = await geocodePlace(query, placeLanguage);

    if (!result.available) {
      setNote(t('location.unavailable'));
      return;
    }

    if (!result.place) {
      setNote(t(result.reason === 'ambiguous' ? 'location.ambiguous' : 'location.noMatch'));
      onClearLocation();
      setSelectedLabel('');
      return;
    }

    applyPlace(result.place);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setNote(t('location.noGeo'));
      return;
    }

    setLocating(true);
    setNote('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        setText('');
        setSelectedLabel('');
        setSuggestions([]);
        setOpen(false);
        onPickLocation({
          source: 'device',
          label: '',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        setLocating(false);
        setNote(error.code === error.PERMISSION_DENIED ? t('location.denied') : t('location.failed'));
      },
      { timeout: 10000 }
    );
  };

  const showList = open && suggestions.length > 0;

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }

    if (event.key === 'ArrowDown' && showList) {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
      return;
    }

    if (event.key === 'ArrowUp' && showList) {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();

      if (showList && activeIndex >= 0) {
        applyPlace(suggestions[activeIndex]);
        return;
      }

      void handleLookupTyped();
    }
  };

  return (
    <div className="mt-4 border-t border-soft pt-4">
      <label htmlFor="search-location" className={labelClassName}>
        {t('location.label')}
      </label>
      <div className="mt-1.5 flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <input
          id="search-location"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setNote('');
            setOpen(true);
            if (event.target.value.trim().length < 2) {
              setSuggestions([]);
            }
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={handleKeyDown}
          placeholder={t('location.placeholder')}
          autoComplete="off"
          dir="auto"
          role="combobox"
          aria-expanded={showList}
          aria-controls={LIST_ID}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `location-suggestion-${activeIndex}` : undefined}
          className={`${inputClassName} mt-0 sm:min-w-0 sm:flex-1`}
        />
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={locating}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-grove-soft px-4 text-sm font-semibold text-forest-deep hover:bg-[#d7efe3] disabled:cursor-not-allowed disabled:opacity-60 sm:w-56"
        >
          {locating ? t('location.finding') : t('location.useMine')}
        </button>
      </div>

      {showList && (
        <ul
          id={LIST_ID}
          role="listbox"
          className="mt-2 overflow-hidden rounded-2xl bg-white shadow-[0_16px_40px_rgba(28,36,32,0.1)] ring-1 ring-soft"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.placeId || suggestion.label}
              id={`location-suggestion-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(event) => {
                event.preventDefault();
                applyPlace(suggestion);
              }}
              className={`min-h-11 cursor-pointer px-3 py-2 text-start text-sm text-ink ${index === activeIndex ? 'bg-mist' : 'hover:bg-canvas'}`}
              dir="auto"
            >
              {suggestion.label}
            </li>
          ))}
        </ul>
      )}

      {(locationSource === 'device' || selectedLabel !== '') && filters.location && (
        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink">
          <span dir="auto">
            {t('location.using', { place: locationSource === 'device' ? t('location.current') : selectedLabel })}
          </span>
          <button type="button" onClick={handleClear} className={quietActionClassName}>
            {t('location.clear')}
          </button>
        </p>
      )}

      {note !== '' && (
        <p role="status" className="mt-2 text-sm text-amber-ink">
          {note}
        </p>
      )}
    </div>
  );
}

export default LocationField;
