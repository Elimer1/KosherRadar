// NEW (Milestone 4): the filters of the search (spec section 8): kashrut level, specific hechsher (multi-select),
// food type (multi-select), category (multi-select), Hide Expired, Include Unknown, and the distance radius
// (1 / 5 / 10 / 25 / 50 km), which only exists once a search location was chosen.
// The filters only collect choices; the server filters and sorts.
// חדש (אבן דרך 4): מסנני החיפוש. הרדיוס קיים רק אחרי שנבחר מיקום. המסננים רק אוספים בחירות; השרת מסנן וממיין.
import { useState } from 'react';
import type { FormOptions } from '../types/submissions';
import { RADIUS_OPTIONS_KM } from '../types/search';
import type { SearchFilters } from '../types/search';
import { getCategoryLabel, getFoodTypeLabel, getKashrutLevelLabel } from '../utils/labels';
import { toggleValue } from '../utils/searchResults';
import { inputClassName, labelClassName } from './formStyles';

interface SearchFiltersPanelProps {
  filters: SearchFilters;
  options: FormOptions | null;
  onChange: (next: SearchFilters) => void;
}

const checkboxLabelClassName = 'flex items-center gap-2 text-sm text-gray-800';

function SearchFiltersPanel({ filters, options, onChange }: SearchFiltersPanelProps) {
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Location is optional and only asked for when the visitor presses the button; nothing needs it to browse.
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Your browser cannot share your location.');
      return;
    }

    setLocating(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        onChange({
          ...filters,
          location: { lat: position.coords.latitude, lng: position.coords.longitude },
        });
      },
      (error) => {
        setLocating(false);
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? 'Location permission was denied. You can still search without a location.'
            : 'Could not find your location. You can still search without it.'
        );
      },
      { timeout: 10000 }
    );
  };

  const handleClearLocation = () => {
    setLocationError('');
    onChange({ ...filters, location: null, radiusKm: null });
  };

  return (
    <div className="space-y-5 rounded-lg border border-gray-200 bg-white p-4">
      <div>
        <label htmlFor="filter-level" className={labelClassName}>
          Kashrut level
        </label>
        <select
          id="filter-level"
          value={filters.level}
          onChange={(event) => onChange({ ...filters, level: event.target.value })}
          className={inputClassName}
        >
          <option value="">Any</option>
          {(options?.kashrutLevels || []).map((level) => (
            <option key={level} value={level}>
              {getKashrutLevelLabel(level)}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className={labelClassName}>Hechsher</legend>
        <div className="mt-1 grid max-h-44 gap-1.5 overflow-y-auto">
          {(options?.hechsherOptions || []).map((option) => (
            <label key={option.value} className={checkboxLabelClassName}>
              <input
                type="checkbox"
                checked={filters.hechsher.includes(option.value)}
                onChange={() => onChange({ ...filters, hechsher: toggleValue(filters.hechsher, option.value) })}
              />
              {option.labelEn}
            </label>
          ))}
          {options && (
            <label className={checkboxLabelClassName}>
              <input
                type="checkbox"
                checked={filters.hechsher.includes(options.hechsherOtherValue)}
                onChange={() =>
                  onChange({ ...filters, hechsher: toggleValue(filters.hechsher, options.hechsherOtherValue) })
                }
              />
              Other
            </label>
          )}
        </div>
      </fieldset>

      <fieldset>
        <legend className={labelClassName}>Food type</legend>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1.5">
          {(options?.foodTypes || []).map((foodType) => (
            <label key={foodType} className={checkboxLabelClassName}>
              <input
                type="checkbox"
                checked={filters.foodType.includes(foodType)}
                onChange={() => onChange({ ...filters, foodType: toggleValue(filters.foodType, foodType) })}
              />
              {getFoodTypeLabel(foodType)}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={labelClassName}>Category</legend>
        <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1.5">
          {(options?.categories || []).map((category) => (
            <label key={category} className={checkboxLabelClassName}>
              <input
                type="checkbox"
                checked={filters.category.includes(category)}
                onChange={() => onChange({ ...filters, category: toggleValue(filters.category, category) })}
              />
              {getCategoryLabel(category)}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2">
        <label className={checkboxLabelClassName}>
          <input
            type="checkbox"
            checked={filters.hideExpired}
            onChange={(event) => onChange({ ...filters, hideExpired: event.target.checked })}
          />
          Hide expired certificates
        </label>
        <label className={checkboxLabelClassName}>
          <input
            type="checkbox"
            checked={filters.includeUnknown}
            onChange={(event) => onChange({ ...filters, includeUnknown: event.target.checked })}
          />
          Include restaurants with unknown kashrut
        </label>
      </div>

      <div>
        <p className={labelClassName}>Near me</p>

        {filters.location ? (
          <div className="mt-1 space-y-2">
            <p className="text-sm text-gray-700">Sorted by distance from your location.</p>
            <div>
              <label htmlFor="filter-radius" className="block text-sm text-gray-700">
                Distance
              </label>
              <select
                id="filter-radius"
                value={filters.radiusKm === null ? '' : String(filters.radiusKm)}
                onChange={(event) =>
                  onChange({ ...filters, radiusKm: event.target.value === '' ? null : Number(event.target.value) })
                }
                className={inputClassName}
              >
                <option value="">Any distance</option>
                {RADIUS_OPTIONS_KM.map((radius) => (
                  <option key={radius} value={radius}>
                    Within {radius} km
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleClearLocation}
              className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Clear my location
            </button>
          </div>
        ) : (
          <div className="mt-1">
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={locating}
              className="rounded border border-green-600 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {locating ? 'Finding your location...' : 'Use my current location'}
            </button>
            <p className="mt-1 text-xs text-gray-500">Optional. Your location is only used for this search.</p>
          </div>
        )}

        {locationError && (
          <p role="alert" className="mt-2 text-sm text-red-700">
            {locationError}
          </p>
        )}
      </div>
    </div>
  );
}

export default SearchFiltersPanel;
