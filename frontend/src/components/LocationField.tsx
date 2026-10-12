// NEW (Milestone 5): the search location, separate from the restaurant-name and food box.
// A suggestion or Enter looks the place up. A miss does not invent coordinates.
// חדש (אבן דרך 5): מיקום החיפוש, נפרד מתיבת השם והאוכל. הצעה או Enter מחפשים את המקום. החטאה לא ממציאה קואורדינטות.
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { geocodePlace, suggestPlaces } from '../api/placesApi';
import { activeLanguage } from '../i18n';
import type { AddressSuggestion, PlaceLanguage } from '../api/placesApi';
import type { SearchLocationPick } from '../hooks/useSearchCriteria';
import type { SearchFilters } from '../types/search';
import { inputClassName, labelClassName } from './formStyles';

interface LocationFieldProps {
  filters: SearchFilters;
  appliedLabel?: string;
  locationSource?: 'named' | 'device' | null;
  onPickLocation: (pick: SearchLocationPick) => void;
  onClearLocation: () => void;
  lang?: PlaceLanguage;
}

function LocationField({ filters, appliedLabel = '', locationSource = null, onPickLocation, onClearLocation, lang }: LocationFieldProps) {
  const { t } = useTranslation();
  const placeLanguage = lang ?? activeLanguage();
  const [text, setText] = useState(locationSource === 'device' ? '' : appliedLabel);
  const [selectedLabel, setSelectedLabel] = useState(locationSource === 'device' ? '' : appliedLabel);
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
        const result = await suggestPlaces(query, placeLanguage, controller.signal);

        if (controller.signal.aborted) {
          return;
        }

        setSuggestions(result.suggestions);

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
    setNote('');
    onPickLocation({ source: 'named', label: place.label, latitude: place.latitude, longitude: place.longitude });
  };

  const handleClear = () => {
    setText('');
    setSelectedLabel('');
    setSuggestions([]);
    setNote('');
    onClearLocation();
  };

  const handleLookupTyped = async () => {
    const query = text.trim();

    if (query.length < 2) {
      return;
    }

    setSuggestions([]);
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

  return (
    <div className="mt-3">
      <label htmlFor="search-location" className={labelClassName}>
        {t('location.label')}
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
          placeholder={t('location.placeholder')}
          autoComplete="off"
          className={`${inputClassName} mt-0 sm:flex-1`}
        />
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={locating}
          className="min-h-11 rounded border border-green-600 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {locating ? t('location.finding') : t('location.useMine')}
        </button>
      </div>

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

      {(locationSource === 'device' || selectedLabel !== '') && filters.location && (
        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-700">
          <span>{t('location.using', { place: locationSource === 'device' ? t('location.current') : selectedLabel })}</span>
          <button type="button" onClick={handleClear} className="font-medium text-green-700 underline">
            {t('location.clear')}
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
