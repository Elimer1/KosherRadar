// NEW (Milestone 5): the search location, separate from the restaurant-name and food box.
// A suggestion or Enter looks the place up. A miss does not invent coordinates.
// חדש (אבן דרך 5): מיקום החיפוש, נפרד מתיבת השם והאוכל. הצעה או Enter מחפשים את המקום. החטאה לא ממציאה קואורדינטות.
import { useEffect, useState } from 'react';
import { geocodePlace, suggestPlaces } from '../api/placesApi';
import type { AddressSuggestion, PlaceLanguage } from '../api/placesApi';
import type { SearchFilters } from '../types/search';
import { inputClassName, labelClassName } from './formStyles';

interface LocationFieldProps {
  filters: SearchFilters;
  onChange: (next: SearchFilters) => void;
  lang?: PlaceLanguage;
}

function LocationField({ filters, onChange, lang = 'en' }: LocationFieldProps) {
  const [text, setText] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
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
        const result = await suggestPlaces(query, lang, controller.signal);

        if (controller.signal.aborted) {
          return;
        }

        setSuggestions(result.suggestions);

        if (!result.available) {
          setNote('Place search is unavailable. You can use your current location, or browse without one.');
        }
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
          setNote('Place search is unavailable. You can use your current location, or browse without one.');
        }
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [text, lang, selectedLabel]);

  const applyPlace = (place: AddressSuggestion) => {
    setText(place.label);
    setSelectedLabel(place.label);
    setSuggestions([]);
    setNote('');
    onChange({ ...filters, location: { lat: place.latitude, lng: place.longitude } });
  };

  const handleClear = () => {
    setText('');
    setSelectedLabel('');
    setSuggestions([]);
    setNote('');
    onChange({ ...filters, location: null, radiusKm: null });
  };

  const handleLookupTyped = async () => {
    const query = text.trim();

    if (query.length < 2) {
      return;
    }

    setSuggestions([]);
    const result = await geocodePlace(query, lang);

    if (!result.available) {
      setNote('Place search is unavailable. You can use your current location, or browse without one.');
      return;
    }

    if (!result.place) {
      setNote('No matching place in Israel. Nothing was guessed, so this search stays without a location.');
      onChange({ ...filters, location: null, radiusKm: null });
      setSelectedLabel('');
      return;
    }

    applyPlace(result.place);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setNote('Your browser cannot share your location. You can still type a place or browse without one.');
      return;
    }

    setLocating(true);
    setNote('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        setText('');
        setSelectedLabel('Current location');
        setSuggestions([]);
        onChange({
          ...filters,
          location: { lat: position.coords.latitude, lng: position.coords.longitude },
        });
      },
      (error) => {
        setLocating(false);
        setNote(
          error.code === error.PERMISSION_DENIED
            ? 'Location permission was denied. You can still type a place or browse without one.'
            : 'Could not find your location. You can still type a place or browse without one.'
        );
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="mt-3">
      <label htmlFor="search-location" className={labelClassName}>
        Location
      </label>
      <div className="mt-1 flex flex-col gap-2 sm:flex-row">
        <input
          id="search-location"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setNote('');
            if (event.target.value.trim().length < 2) {
              setSuggestions([]);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              void handleLookupTyped();
            }
          }}
          placeholder="City or address in Israel"
          autoComplete="off"
          className={`${inputClassName} mt-0 sm:flex-1`}
        />
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={locating}
          className="min-h-11 rounded border border-green-600 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {locating ? 'Finding your location...' : 'Use my current location'}
        </button>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Optional. Choose a suggestion, or press Enter to look up what you typed. This is not part of the restaurant
        name search.
      </p>

      {suggestions.length > 0 && (
        <ul className="mt-1 overflow-hidden rounded border border-gray-200 bg-white" role="listbox">
          {suggestions.map((suggestion) => (
            <li key={suggestion.placeId || suggestion.label}>
              <button
                type="button"
                onClick={() => applyPlace(suggestion)}
                className="w-full px-3 py-2 text-start text-sm hover:bg-green-50"
              >
                {suggestion.label}
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedLabel !== '' && filters.location && (
        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-700">
          <span>Using: {selectedLabel}</span>
          <button type="button" onClick={handleClear} className="font-medium text-green-700 underline">
            Clear location
          </button>
        </p>
      )}

      {note !== '' && (
        <p role="status" className="mt-2 text-sm text-amber-800">
          {note}
        </p>
      )}
    </div>
  );
}

export default LocationField;
