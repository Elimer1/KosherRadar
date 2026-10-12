// NEW (Milestone 4): the filters of the search (spec section 8): kashrut level, specific hechsher (multi-select),
// food type (multi-select), category (multi-select), Hide Expired, Include Unknown, and the distance radius
// (1 / 5 / 10 / 25 / 50 km), which only exists once a search location was chosen.
// The filters only collect choices; the server filters and sorts.
// חדש (אבן דרך 4): מסנני החיפוש. הרדיוס קיים רק אחרי שנבחר מיקום. המסננים רק אוספים בחירות; השרת מסנן וממיין.
import { useTranslation } from 'react-i18next';
import type { FormOptions } from '../types/submissions';
import { RADIUS_OPTIONS_KM } from '../types/search';
import type { SearchFilters } from '../types/search';
import { getCategoryLabel, getFoodTypeLabel, getHechsherOptionLabel, getKashrutLevelLabel } from '../utils/labels';
import { toggleValue } from '../utils/searchResults';
import { inputClassName, labelClassName } from './formStyles';

interface SearchFiltersPanelProps {
  filters: SearchFilters;
  options: FormOptions | null;
  onChange: (next: SearchFilters) => void;
}

const checkboxLabelClassName = 'flex items-center gap-2 py-0.5 text-sm text-gray-800';

function SearchFiltersPanel({ filters, options, onChange }: SearchFiltersPanelProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div>
        <label htmlFor="filter-level" className={labelClassName}>
          {t('filters.level')}
        </label>
        <select
          id="filter-level"
          value={filters.level}
          onChange={(event) => onChange({ ...filters, level: event.target.value })}
          className={inputClassName}
        >
          <option value="">{t('filters.any')}</option>
          {(options?.kashrutLevels || []).map((level) => (
            <option key={level} value={level}>
              {getKashrutLevelLabel(level)}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className={labelClassName}>{t('filters.hechsher')}</legend>
        <div className="mt-1 grid max-h-44 gap-1.5 overflow-y-auto">
          {(options?.hechsherOptions || []).map((option) => (
            <label key={option.value} className={checkboxLabelClassName}>
              <input
                type="checkbox"
                className="size-4 shrink-0"
                checked={filters.hechsher.includes(option.value)}
                onChange={() => onChange({ ...filters, hechsher: toggleValue(filters.hechsher, option.value) })}
              />
              {getHechsherOptionLabel(option)}
            </label>
          ))}
          {options && (
            <label className={checkboxLabelClassName}>
              <input
                type="checkbox"
                className="size-4 shrink-0"
                checked={filters.hechsher.includes(options.hechsherOtherValue)}
                onChange={() =>
                  onChange({ ...filters, hechsher: toggleValue(filters.hechsher, options.hechsherOtherValue) })
                }
              />
              {t('common.other')}
            </label>
          )}
        </div>
      </fieldset>

      <fieldset>
        <legend className={labelClassName}>{t('filters.foodType')}</legend>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1.5">
          {(options?.foodTypes || []).map((foodType) => (
            <label key={foodType} className={checkboxLabelClassName}>
              <input
                type="checkbox"
                className="size-4 shrink-0"
                checked={filters.foodType.includes(foodType)}
                onChange={() => onChange({ ...filters, foodType: toggleValue(filters.foodType, foodType) })}
              />
              {getFoodTypeLabel(foodType)}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={labelClassName}>{t('filters.category')}</legend>
        <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1.5">
          {(options?.categories || []).map((category) => (
            <label key={category} className={checkboxLabelClassName}>
              <input
                type="checkbox"
                className="size-4 shrink-0"
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
            className="size-4 shrink-0"
            checked={filters.hideExpired}
            onChange={(event) => onChange({ ...filters, hideExpired: event.target.checked })}
          />
          {t('filters.hideExpired')}
        </label>
        <label className={checkboxLabelClassName}>
          <input
            type="checkbox"
            className="size-4 shrink-0"
            checked={filters.includeUnknown}
            onChange={(event) => onChange({ ...filters, includeUnknown: event.target.checked })}
          />
          {t('filters.includeUnknown')}
        </label>
      </div>

      <div>
        <label htmlFor="filter-radius" className={labelClassName}>
          {t('filters.distance')}
        </label>
        {filters.location ? (
          <select
            id="filter-radius"
            value={filters.radiusKm === null ? '' : String(filters.radiusKm)}
            onChange={(event) =>
              onChange({ ...filters, radiusKm: event.target.value === '' ? null : Number(event.target.value) })
            }
            className={inputClassName}
          >
            <option value="">{t('filters.anyDistance')}</option>
            {RADIUS_OPTIONS_KM.map((radius) => (
              <option key={radius} value={radius}>
                {t('filters.withinKm', { km: radius })}
              </option>
            ))}
          </select>
        ) : (
          <p id="filter-radius" className="mt-1 text-sm text-gray-600">
            {t('filters.needLocation')}
          </p>
        )}
      </div>
    </div>
  );
}

export default SearchFiltersPanel;
