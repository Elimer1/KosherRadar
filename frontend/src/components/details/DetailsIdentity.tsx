// NEW (Visual v2): restaurant details presentation; existing contracts and status labels stay authoritative.
// חדש (עיצוב 2): תצוגת פרטי מסעדה תוך שמירה על חוזים ותוויות קיימים.
// Light identity: name, place, and food. No photo is invented.
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
    <div className="kr-v2-details-nameblock">
      <h1 className="kr-v2-details-title" dir="auto">
        {names.primary}
      </h1>
      {names.secondary.length > 0 && (
        <p className="kr-v2-details-alt">
          {names.secondary.map((name, index) => (
            <span key={`${name}-${index}`}>
              {index > 0 && <span aria-hidden="true"> · </span>}
              <bdi>{name}</bdi>
            </span>
          ))}
        </p>
      )}
      {place !== '' && (
        <p className="kr-details-place kr-v2-details-address">
          <bdi>{place}</bdi>
        </p>
      )}
      {hasMeta && (
        <ul className="kr-v2-details-tags">
          {restaurant.foodType && <li>{getFoodTypeLabel(restaurant.foodType)}</li>}
          {restaurant.categories.map((category) => (
            <li key={category}>{getCategoryLabel(category)}</li>
          ))}
        </ul>
      )}
      {keywords.length > 0 && (
        <p className="kr-v2-details-serves">
          <bdi>{t('details.serves', { food: keywords.join(', ') })}</bdi>
        </p>
      )}
    </div>
  );
}

export default DetailsIdentity;
