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
import { metaChipClassName, primaryButtonCompactClassName, quietChipClassName, secondaryButtonClassName } from './formStyles';

interface RestaurantCardProps {
  restaurant: RestaurantCardData;
  hechsherOptions: HechsherOption[];
}

function placeLine(restaurant: RestaurantCardData) {
  const address = restaurant.address.trim();
  const city = restaurant.city?.trim() ?? '';
  const showCity = city !== '' && !address.includes(city);
  return [address, showCity ? city : ''].filter((part) => part !== '').join(', ');
}

function RestaurantCard({ restaurant, hechsherOptions }: RestaurantCardProps) {
  const { t } = useTranslation();
  const telUrl = buildTelUrl(restaurant.phone);
  const wazeUrl = buildWazeUrl(restaurant.latitude, restaurant.longitude);
  const place = placeLine(restaurant);
  const distanceText = formatDistance(restaurant.distanceKm);
  const hasMeta = Boolean(restaurant.foodType) || restaurant.categories.length > 0;

  return (
    <li className="kr-card rounded-2xl border border-soft bg-white p-4 shadow-[0_1px_2px_rgba(23,75,58,0.05)] transition-shadow hover:shadow-[0_8px_24px_rgba(23,75,58,0.08)] focus-within:border-forest sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="break-words text-lg font-semibold leading-snug text-ink">
            <Link
              to={`/restaurants/${restaurant.id}`}
              dir="auto"
              className="rounded-sm text-ink underline-offset-2 hover:text-forest hover:underline"
            >
              {restaurant.name}
            </Link>
          </h2>
          {place !== '' && (
            <p className="mt-1 break-words text-sm leading-relaxed text-muted" dir="auto">
              {place}
            </p>
          )}
        </div>
        {distanceText && <p className={`${metaChipClassName} shrink-0`}>{distanceText}</p>}
      </div>

      {hasMeta && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {restaurant.foodType && <li className={metaChipClassName}>{getFoodTypeLabel(restaurant.foodType)}</li>}
          {restaurant.categories.map((category) => (
            <li key={category} className={quietChipClassName}>
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
