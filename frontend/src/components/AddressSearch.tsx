import { useEffect, useState } from 'react';
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
  onAddressChange,
  onCityChange,
  onLocationChange,
}: AddressSearchProps) {
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
        const result = await searchAddresses(text);

        if (cancelled) {
          return;
        }

        setSuggestions(result.suggestions);

        if (!result.available) {
          setLookupNote('Address search is unavailable right now. Type the street and city.');
          setManual(true);
        }
      } catch {
        if (!cancelled) {
          setLookupNote('Address search is unavailable right now. Type the street and city.');
          setSuggestions([]);
          setManual(true);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [address, searching, manual]);

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
            Street address
          </label>
          <input
            id="restaurant-address"
            type="text"
            required
            maxLength={250}
            autoComplete="off"
            disabled={disabled}
            value={address}
            onChange={(event) => handleAddressType(event.target.value)}
            className={inputClassName}
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded border border-gray-200 bg-white shadow">
              {suggestions.map((suggestion) => (
                <li key={`${suggestion.placeId}-${suggestion.label}`}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-green-50"
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
            {cityRequired ? 'City' : 'City (optional)'}
          </label>
          <input
            id="restaurant-city"
            type="text"
            required={cityRequired}
            maxLength={100}
            disabled={disabled}
            value={city}
            onChange={(event) => {
              onCityChange(event.target.value);
              onLocationChange(emptyLocation);
            }}
            className={inputClassName}
          />
        </div>
      </div>

      <p className="text-sm text-gray-600">
        {latitude
          ? 'This address is placed on the map.'
          : 'If the address is not in the list, type the street and city. An admin will review it, and it may not appear on the map until then.'}
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
          className="text-sm font-medium text-green-700 underline"
        >
          Can&apos;t find the address? Type it in
        </button>
      )}
    </div>
  );
}

export default AddressSearch;
