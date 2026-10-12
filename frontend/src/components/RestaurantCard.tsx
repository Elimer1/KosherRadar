// NEW (Milestone 4): one search result: name, place, food type, categories, kashrut status, distance, Call and Waze.
// There are no ratings or reviews: KosherRadar is a factual directory.
// חדש (אבן דרך 4): תוצאת חיפוש אחת: שם, מקום, סוג אוכל, קטגוריות, כשרות, מרחק, התקשר ו-Waze. אין דירוגים או ביקורות.
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { RestaurantCardData } from '../types/search';
import type { HechsherOption } from '../types/submissions';
import { getCategoryLabel, getFoodTypeLabel } from '../utils/labels';
import { formatDistance } from '../utils/kashrutText';
import { buildTelUrl, buildWazeUrl } from '../utils/navigationLinks';
import KashrutBadge from './KashrutBadge';
import { primaryButtonCompactClassName, secondaryButtonClassName } from './formStyles';

interface RestaurantCardProps {
  restaurant: RestaurantCardData;
  hechsherOptions: HechsherOption[];
}

function RestaurantCard({ restaurant, hechsherOptions }: RestaurantCardProps) {
  const { t } = useTranslation();
  const telUrl = buildTelUrl(restaurant.phone);
  const wazeUrl = buildWazeUrl(restaurant.latitude, restaurant.longitude);
  // The address often already contains the city; do not repeat it.
  const showCity = restaurant.city && !restaurant.address.includes(restaurant.city);
  const place = showCity ? `${restaurant.address}, ${restaurant.city}` : restaurant.address;
  const distanceText = formatDistance(restaurant.distanceKm);

  return (
    <li className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-gray-900">
            <Link to={`/restaurants/${restaurant.id}`} className="rounded-sm hover:text-green-800 hover:underline">
              {restaurant.name}
            </Link>
          </h2>
          <p className="mt-0.5 text-sm text-gray-600">{place}</p>
        </div>
        {distanceText && (
          <p className="shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-900">
            {distanceText}
          </p>
        )}
      </div>

      {(restaurant.foodType || restaurant.categories.length > 0) && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {restaurant.foodType && (
            <li className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-800">
              {getFoodTypeLabel(restaurant.foodType)}
            </li>
          )}
          {restaurant.categories.map((category) => (
            <li key={category} className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-900">
              {getCategoryLabel(category)}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3">
        <KashrutBadge kashrut={restaurant.kashrut} hechsherOptions={hechsherOptions} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link to={`/restaurants/${restaurant.id}`} className={primaryButtonCompactClassName}>
          {t('card.viewDetails')}
        </Link>
        {telUrl && (
          <a href={telUrl} className={secondaryButtonClassName} aria-label={t('card.callName', { name: restaurant.name })}>
            {t('card.call')}
          </a>
        )}
        {wazeUrl && (
          <a
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={secondaryButtonClassName}
            aria-label={t('card.wazeName', { name: restaurant.name })}
          >
            {t('card.waze')}
          </a>
        )}
      </div>
    </li>
  );
}

export default RestaurantCard;
