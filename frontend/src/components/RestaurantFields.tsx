import type { FormOptions, RestaurantFormValues } from '../types/submissions';
import { getCategoryLabel, getFoodTypeLabel, getKashrutLevelLabel } from '../utils/labels';
import AddressSearch from './AddressSearch';
import { inputClassName, labelClassName } from './formStyles';

interface RestaurantFieldsProps {
  values: RestaurantFormValues;
  options: FormOptions;
  disabled: boolean;
  // The user form hides coordinates, food keywords and the kashrut claim. Admins still edit those.
  variant?: 'user' | 'admin';
  onChange: (field: keyof RestaurantFormValues, value: string) => void;
  onToggleCategory: (category: string) => void;
}

function RestaurantFields({
  values,
  options,
  disabled,
  variant = 'admin',
  onChange,
  onToggleCategory,
}: RestaurantFieldsProps) {
  const claimIsOther = values.claimedHechsher === options.hechsherOtherValue;
  const forUser = variant === 'user';

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Restaurant details</h2>

        <div>
          <label htmlFor="restaurant-name" className={labelClassName}>
            Name
          </label>
          <input
            id="restaurant-name"
            type="text"
            required
            maxLength={150}
            disabled={disabled}
            value={values.name}
            onChange={(event) => onChange('name', event.target.value)}
            className={inputClassName}
          />
        </div>

        <AddressSearch
          address={values.address}
          city={values.city}
          latitude={values.latitude}
          disabled={disabled}
          cityRequired={forUser}
          onAddressChange={(value) => onChange('address', value)}
          onCityChange={(value) => onChange('city', value)}
          onLocationChange={(location) => {
            onChange('latitude', location.latitude);
            onChange('longitude', location.longitude);
            onChange('geoapifyPlaceId', location.placeId);
          }}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="restaurant-phone" className={labelClassName}>
              Phone (optional)
            </label>
            <input
              id="restaurant-phone"
              type="tel"
              maxLength={30}
              disabled={disabled}
              value={values.phone}
              onChange={(event) => onChange('phone', event.target.value)}
              className={inputClassName}
            />
          </div>
          <div>
            <label htmlFor="restaurant-website" className={labelClassName}>
              Website (optional)
            </label>
            <input
              id="restaurant-website"
              type="url"
              maxLength={300}
              placeholder="https://"
              disabled={disabled}
              value={values.website}
              onChange={(event) => onChange('website', event.target.value)}
              className={inputClassName}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Food</h2>

        <div>
          <label htmlFor="restaurant-food-type" className={labelClassName}>
            Meat, dairy or pareve
          </label>
          <select
            id="restaurant-food-type"
            required
            disabled={disabled}
            value={values.foodType}
            onChange={(event) => onChange('foodType', event.target.value)}
            className={inputClassName}
          >
            <option value="">Choose...</option>
            {options.foodTypes.map((foodType) => (
              <option key={foodType} value={foodType}>
                {getFoodTypeLabel(foodType)}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className={labelClassName}>Categories (choose at least one)</legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {options.categories.map((category) => (
              <label key={category} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  disabled={disabled}
                  checked={values.categories.includes(category)}
                  onChange={() => onToggleCategory(category)}
                  className="h-4 w-4 accent-green-600"
                />
                {getCategoryLabel(category)}
              </label>
            ))}
          </div>
        </fieldset>

        {!forUser && (
          <div>
            <label htmlFor="restaurant-keywords" className={labelClassName}>
              What do they serve? (optional, separated by commas)
            </label>
            <input
              id="restaurant-keywords"
              type="text"
              placeholder="pizza, pasta, salads"
              disabled={disabled}
              value={values.foodKeywords}
              onChange={(event) => onChange('foodKeywords', event.target.value)}
              className={inputClassName}
            />
          </div>
        )}
      </section>

      {!forUser && (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Kashrut claim (optional)</h2>
        <p className="text-sm text-gray-600">
          If you know which hechsher the place says it has but you have no photo of the certificate, enter it here.
          It will be shown as an unverified claim, not as a verified certificate.
        </p>

        <div>
          <label htmlFor="restaurant-claimed-hechsher" className={labelClassName}>
            Claimed hechsher
          </label>
          <select
            id="restaurant-claimed-hechsher"
            disabled={disabled}
            value={values.claimedHechsher}
            onChange={(event) => onChange('claimedHechsher', event.target.value)}
            className={inputClassName}
          >
            <option value="">No claim</option>
            {options.hechsherOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.labelEn}
              </option>
            ))}
            <option value={options.hechsherOtherValue}>Other (type below)</option>
          </select>
        </div>

        {claimIsOther && (
          <div>
            <label htmlFor="restaurant-claimed-other" className={labelClassName}>
              Name of the hechsher
            </label>
            <input
              id="restaurant-claimed-other"
              type="text"
              required
              maxLength={100}
              disabled={disabled}
              value={values.claimedHechsherOther}
              onChange={(event) => onChange('claimedHechsherOther', event.target.value)}
              className={inputClassName}
            />
          </div>
        )}

        <div>
          <label htmlFor="restaurant-claimed-level" className={labelClassName}>
            Claimed kashrut level
          </label>
          <select
            id="restaurant-claimed-level"
            disabled={disabled}
            value={values.claimedKashrutLevel}
            onChange={(event) => onChange('claimedKashrutLevel', event.target.value)}
            className={inputClassName}
          >
            <option value="">No claim</option>
            {options.kashrutLevels.map((level) => (
              <option key={level} value={level}>
                {getKashrutLevelLabel(level)}
              </option>
            ))}
          </select>
        </div>
      </section>
      )}
    </div>
  );
}

export default RestaurantFields;
