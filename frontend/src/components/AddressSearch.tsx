import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { searchAddresses } from '../api/placesApi';
import type { AddressSuggestion } from '../api/placesApi';
import { inputClassName, labelClassName } from './formStyles';

interface AddressLocation {
  latitude: string;
  longitude: string;
  placeId: string;
}

interface AddressSearchProps {
  address: string;
  city: string;
  latitude: string;
  disabled: boolean;
  cityRequired: boolean;
  invalid?: boolean;
  invalidCity?: boolean;
  onAddressChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onLocationChange: (location: AddressLocation) => void;
}

const emptyLocation: AddressLocation = { latitude: '', longitude: '', placeId: '' };

function AddressSearch({
  address,
  city,
  latitude,
  disabled,
  cityRequired,
  invalid = false,
  invalidCity = false,
  onAddressChange,
  onCityChange,
  onLocationChange,
}: AddressSearchProps) {
  const { t, i18n } = useTranslation();
  const [searching, setSearching] = useState(false);
  const [manual, setManual] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [lookupNote, setLookupNote] = useState('');

  useEffect(() => {
    if (!searching || manual) {
      return;
    }

    const text = address.trim();

    if (text.length < 2) {
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const result = await searchAddresses(text, i18n.language.startsWith('he') ? 'he' : 'en');

        if (cancelled) {
          return;
        }

        setSuggestions(result.suggestions);

        if (!result.available) {
          setLookupNote(t('forms.lookupDown'));
          setManual(true);
        }
      } catch {
        if (!cancelled) {
          setLookupNote(t('forms.lookupDown'));
          setSuggestions([]);
          setManual(true);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [address, searching, manual, t, i18n.language]);

  const handleAddressType = (value: string) => {
    setSearching(true);
    setLookupNote('');
    if (value.trim().length < 2) {
      setSuggestions([]);
    }
    onAddressChange(value);
    onLocationChange(emptyLocation);
  };

  const handlePick = (suggestion: AddressSuggestion) => {
    setSearching(false);
    setSuggestions([]);
    setLookupNote('');
    onAddressChange(suggestion.address);
    if (suggestion.city) {
      onCityChange(suggestion.city);
    }
    onLocationChange({
      latitude: String(suggestion.latitude),
      longitude: String(suggestion.longitude),
      placeId: suggestion.placeId,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="relative">
          <label htmlFor="restaurant-address" className={labelClassName}>
            {t('forms.street')}
          </label>
          <input
            id="restaurant-address"
            type="text"
            required
            maxLength={250}
            autoComplete="off"
            disabled={disabled}
            aria-invalid={invalid}
            value={address}
            onChange={(event) => handleAddressType(event.target.value)}
            className={`${inputClassName} ${invalid ? 'border-red-500' : ''}`}
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded border border-soft bg-white shadow">
              {suggestions.map((suggestion) => (
                <li key={`${suggestion.placeId}-${suggestion.label}`}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-start text-sm text-ink hover:bg-mist"
                    onClick={() => handlePick(suggestion)}
                  >
                    {suggestion.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <label htmlFor="restaurant-city" className={labelClassName}>
            {cityRequired ? t('forms.city') : t('forms.cityOptional')}
          </label>
          <input
            id="restaurant-city"
            type="text"
            required={cityRequired}
            maxLength={100}
            disabled={disabled}
            aria-invalid={invalidCity}
            value={city}
            onChange={(event) => {
              onCityChange(event.target.value);
              onLocationChange(emptyLocation);
            }}
            className={`${inputClassName} ${invalidCity ? 'border-red-500' : ''}`}
          />
        </div>
      </div>

      <p className="text-sm text-muted">
        {latitude ? t('forms.placed') : t('forms.manualHint')}
      </p>
      {lookupNote && <p className="text-sm text-amber-800">{lookupNote}</p>}
      {!manual && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setManual(true);
            setSuggestions([]);
            setSearching(false);
          }}
          className="text-sm font-medium text-grove underline"
        >
          {t('forms.typeIt')}
        </button>
      )}
    </div>
  );
}

export default AddressSearch;
