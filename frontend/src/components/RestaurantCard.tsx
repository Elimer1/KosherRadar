// One search result: name, place, food type, categories, kashrut status, distance, Call and Waze.
// There are no ratings, reviews, photos, or opening hours. KosherRadar is a factual directory.
import type { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { RestaurantCardData } from '../types/search';
import type { HechsherOption } from '../types/submissions';
import { getCategoryLabel, getFoodTypeLabel } from '../utils/labels';
import { formatDistance } from '../utils/kashrutText';
import { buildTelUrl, buildWazeUrl } from '../utils/navigationLinks';
import { restaurantDisplayNames } from '../utils/restaurantName';
import type { SearchReturnState } from '../search/searchReturn';
import KashrutBadge from './KashrutBadge';
import { metaChipClassName, primaryButtonCompactClassName, quietChipClassName, secondaryButtonClassName } from './formStyles';

interface RestaurantCardProps {
  restaurant: RestaurantCardData;
  hechsherOptions: HechsherOption[];
  returnState?: SearchReturnState;
  onOpenRestaurant?: (restaurantId: string, background: boolean) => void;
}

function placeLine(restaurant: RestaurantCardData) {
  const address = restaurant.address.trim();
  const city = restaurant.city?.trim() ?? '';
  const showCity = city !== '' && !address.includes(city);
  return [address, showCity ? city : ''].filter((part) => part !== '').join(', ');
}

function RestaurantCard({ restaurant, hechsherOptions, returnState, onOpenRestaurant }: RestaurantCardProps) {
  const { t } = useTranslation();
  const telUrl = buildTelUrl(restaurant.phone);
  const wazeUrl = buildWazeUrl(restaurant.latitude, restaurant.longitude);
  const place = placeLine(restaurant);
  const distanceText = formatDistance(restaurant.distanceKm);
  const names = restaurantDisplayNames(restaurant);
  const hasMeta = Boolean(restaurant.foodType) || restaurant.categories.length > 0;
  const handleOpen = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!onOpenRestaurant) {
      return;
    }

    const background = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;

    if (!background) {
      event.preventDefault();
    }

    onOpenRestaurant(restaurant.id, background);
  };

  return (
    <li className="kr-card border-b border-soft px-4 py-5 transition-colors last:border-b-0 hover:bg-canvas/60 sm:px-6">
      <div className="grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0">
          <h3 className="break-words text-xl font-semibold leading-snug tracking-tight text-ink sm:text-2xl">
            <Link
              to={`/restaurants/${restaurant.id}`}
              state={returnState}
              onClick={handleOpen}
              dir="auto"
              className="rounded-sm text-ink underline-offset-2 hover:text-forest hover:underline"
            >
              {names.primary}
            </Link>
          </h3>
          {names.secondary.length > 0 && (
            <p className="mt-0.5 break-words text-sm text-muted" dir="auto">
              {names.secondary.join(' · ')}
            </p>
          )}
          {place !== '' && (
            <p className="mt-1 break-words text-sm leading-relaxed text-muted" dir="auto">
              {place}
              {distanceText && <span className="ms-2 font-medium text-ink">{distanceText}</span>}
            </p>
          )}
          {place === '' && distanceText && <p className="mt-1 text-sm font-medium text-ink">{distanceText}</p>}

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
        </div>

        <KashrutBadge kashrut={restaurant.kashrut} hechsherOptions={hechsherOptions} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2 md:ps-0">
        <Link to={`/restaurants/${restaurant.id}`} state={returnState} onClick={handleOpen} className={primaryButtonCompactClassName}>
          {t('card.viewDetails')}
        </Link>
        {telUrl && (
          <a href={telUrl} className={secondaryButtonClassName} aria-label={t('card.callName', { name: names.primary })}>
            {t('card.call')}
          </a>
        )}
        {wazeUrl && (
          <a
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={secondaryButtonClassName}
            aria-label={t('card.wazeName', { name: names.primary })}
          >
            {t('card.waze')}
          </a>
        )}
      </div>
    </li>
  );
}

export default RestaurantCard;
