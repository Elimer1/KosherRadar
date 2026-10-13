// NEW (Redesign wave 1): the restaurant name sits on a full-width band. No photo is invented.
// חדש (גל עיצוב 1): שם המסעדה על פס רחב. לא מומצאת תמונה.
import { useTranslation } from 'react-i18next';
import type { RestaurantDetails } from '../../types/restaurantDetails';
import { getCategoryLabel, getFoodTypeLabel } from '../../utils/labels';
import { placeLine } from './placeLine';

interface DisplayNames {
  primary: string;
  secondary: string[];
}

interface DetailsIdentityProps {
  restaurant: RestaurantDetails;
  names: DisplayNames;
}

function DetailsIdentity({ restaurant, names }: DetailsIdentityProps) {
  const { t } = useTranslation();
  const place = placeLine(restaurant.address, restaurant.city);
  const keywords = restaurant.foodKeywords.map((keyword) => keyword.trim()).filter((keyword) => keyword !== '');
  const hasMeta = Boolean(restaurant.foodType) || restaurant.categories.length > 0;

  return (
    <div className="kr-details-identity">
      <h1 className="kr-details-title kr-details-break" dir="auto">
        {names.primary}
      </h1>
      {names.secondary.length > 0 && (
        <p className="kr-details-secondary kr-details-break" dir="auto">
          {names.secondary.map((name, index) => (
            <span key={name}>
              {index > 0 && <span aria-hidden="true"> · </span>}
              <bdi>{name}</bdi>
            </span>
          ))}
        </p>
      )}
      {place !== '' && (
        <p className="kr-details-place kr-details-break" dir="auto">
          {place}
        </p>
      )}
      {hasMeta && (
        <ul className="kr-details-chips">
          {restaurant.foodType && <li className="kr-details-chip kr-details-break">{getFoodTypeLabel(restaurant.foodType)}</li>}
          {restaurant.categories.map((category) => (
            <li key={category} className="kr-details-chip kr-details-break">
              {getCategoryLabel(category)}
            </li>
          ))}
        </ul>
      )}
      {keywords.length > 0 && (
        <p className="kr-details-serves kr-details-break" dir="auto">
          {t('details.serves', { food: keywords.join(', ') })}
        </p>
      )}
    </div>
  );
}

export default DetailsIdentity;
