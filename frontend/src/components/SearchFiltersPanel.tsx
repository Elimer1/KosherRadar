// Filters collect choices and report them immediately. The server filters and sorts.
// Radius exists only after a search location was chosen.
import { useTranslation } from 'react-i18next';
import type { FormOptions } from '../types/submissions';
import { RADIUS_OPTIONS_KM } from '../types/search';
import type { SearchFilters } from '../types/search';
import { getCategoryLabel, getFoodTypeLabel, getHechsherOptionLabel, getKashrutLevelLabel } from '../utils/labels';
import { toggleValue } from '../utils/searchResults';
import { choiceClassName, inputClassName, labelClassName, quietActionClassName } from './formStyles';

interface SearchFiltersPanelProps {
  filters: SearchFilters;
  options: FormOptions | null;
  onChange: (next: SearchFilters) => void;
  showHeading?: boolean;
}

const checkboxLabelClassName = choiceClassName;

function SearchFiltersPanel({ filters, options, onChange, showHeading = true }: SearchFiltersPanelProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {showHeading && <h2 className="text-base font-semibold text-ink">{t('home.filters')}</h2>}
      <div>
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="filter-level" className={labelClassName}>
            {t('filters.level')}
          </label>
          {filters.level !== '' && (
            <button type="button" onClick={() => onChange({ ...filters, level: '' })} className={quietActionClassName}>
              {t('filters.clearGroup')}
            </button>
          )}
        </div>
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
        <legend className="flex w-full items-center justify-between gap-2">
          <span className={labelClassName}>{t('filters.hechsher')}</span>
          {filters.hechsher.length > 0 && (
            <button type="button" onClick={() => onChange({ ...filters, hechsher: [] })} className={quietActionClassName}>
              {t('filters.clearGroup')}
            </button>
          )}
        </legend>
        <div className="mt-1 grid max-h-44 gap-1 overflow-y-auto pe-1">
          {(options?.hechsherOptions || []).map((option) => (
            <label key={option.value} className={checkboxLabelClassName}>
              <input
                type="checkbox"
                className="size-5 shrink-0"
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
                className="size-5 shrink-0"
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
        <legend className="flex w-full items-center justify-between gap-2">
          <span className={labelClassName}>{t('filters.foodType')}</span>
          {filters.foodType.length > 0 && (
            <button type="button" onClick={() => onChange({ ...filters, foodType: [] })} className={quietActionClassName}>
              {t('filters.clearGroup')}
            </button>
          )}
        </legend>
        <div className="mt-1 flex flex-col gap-1">
          {(options?.foodTypes || []).map((foodType) => (
            <label key={foodType} className={checkboxLabelClassName}>
              <input
                type="checkbox"
                className="size-5 shrink-0"
                checked={filters.foodType.includes(foodType)}
                onChange={() => onChange({ ...filters, foodType: toggleValue(filters.foodType, foodType) })}
              />
              {getFoodTypeLabel(foodType)}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="flex w-full items-center justify-between gap-2">
          <span className={labelClassName}>{t('filters.category')}</span>
          {filters.category.length > 0 && (
            <button type="button" onClick={() => onChange({ ...filters, category: [] })} className={quietActionClassName}>
              {t('filters.clearGroup')}
            </button>
          )}
        </legend>
        <div className="mt-1 grid grid-cols-1 gap-1">
          {(options?.categories || []).map((category) => (
            <label key={category} className={checkboxLabelClassName}>
              <input
                type="checkbox"
                className="size-5 shrink-0"
                checked={filters.category.includes(category)}
                onChange={() => onChange({ ...filters, category: toggleValue(filters.category, category) })}
              />
              {getCategoryLabel(category)}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-1">
        <label className={checkboxLabelClassName}>
          <input
            type="checkbox"
            className="size-5 shrink-0"
            checked={filters.hideExpired}
            onChange={(event) => onChange({ ...filters, hideExpired: event.target.checked })}
          />
          {t('filters.hideExpired')}
        </label>
        <label className={checkboxLabelClassName}>
          <input
            type="checkbox"
            className="size-5 shrink-0"
            checked={filters.includeUnknown}
            onChange={(event) => onChange({ ...filters, includeUnknown: event.target.checked })}
          />
          {t('filters.includeUnknown')}
        </label>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="filter-radius" className={labelClassName}>
            {t('filters.distance')}
          </label>
          {filters.radiusKm !== null && (
            <button
              type="button"
              onClick={() => onChange({ ...filters, radiusKm: null })}
              className={quietActionClassName}
            >
              {t('filters.clearGroup')}
            </button>
          )}
        </div>
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
          <p id="filter-radius" className="mt-1 text-sm leading-relaxed text-muted">
            {t('filters.needLocation')}
          </p>
        )}
      </div>
    </div>
  );
}

export default SearchFiltersPanel;
