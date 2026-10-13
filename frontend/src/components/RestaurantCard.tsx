// One search result in the directory: name, place, food, kashrut evidence, and quiet actions.
// There are no ratings, reviews, photos, or opening hours.
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

function PhoneIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6.2 3.6h2l1 2.4-1.3 1a9 9 0 0 0 4.1 4.1l1-1.3 2.4 1v2A1.4 1.4 0 0 1 14 14 11.4 11.4 0 0 1 4.6 4.6 1.4 1.4 0 0 1 6.2 3.6z" />
    </svg>
  );
}

function RouteIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="5" cy="5" r="2" />
      <circle cx="15" cy="15" r="2" />
      <path d="M7 6.2c2.4.4 3.6 1.6 4.2 3.2S13 13 13 13" />
    </svg>
  );
}

function RestaurantCard({ restaurant, hechsherOptions, returnState, onOpenRestaurant }: RestaurantCardProps) {
  const { t } = useTranslation();
  const telUrl = buildTelUrl(restaurant.phone);
  const wazeUrl = buildWazeUrl(restaurant.latitude, restaurant.longitude);
  const place = placeLine(restaurant);
  const distanceText = formatDistance(restaurant.distanceKm);
  const names = restaurantDisplayNames(restaurant);
  const meta = [
    restaurant.foodType ? getFoodTypeLabel(restaurant.foodType) : '',
    ...restaurant.categories.map((category) => getCategoryLabel(category)),
  ].filter((part) => part !== '');
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
    <li className="v2-result kr-card">
      <div className="v2-result-identity">
        <h3 className="v2-result-name text-start">
          <Link
            to={`/restaurants/${restaurant.id}`}
            state={returnState}
            onClick={handleOpen}
            className="text-ink underline-offset-2 hover:text-forest hover:underline"
          >
            <bdi>{names.primary}</bdi>
          </Link>
        </h3>
        {names.secondary.length > 0 && (
          <p className="v2-result-secondary text-start">
            {names.secondary.map((name, index) => (
              <span key={`${name}-${index}`}>
                {index > 0 && <span aria-hidden="true"> · </span>}
                <bdi>{name}</bdi>
              </span>
            ))}
          </p>
        )}
        {place !== '' && (
          <p className="v2-result-address text-start">
            <bdi>{place}</bdi>
            {distanceText && <span className="ms-2 text-ink">{distanceText}</span>}
          </p>
        )}
        {place === '' && distanceText && <p className="v2-result-address text-ink">{distanceText}</p>}
      </div>

      <p className="v2-result-meta">{meta.join(' · ')}</p>

      <div className="v2-result-kashrut">
        <KashrutBadge kashrut={restaurant.kashrut} hechsherOptions={hechsherOptions} />
      </div>

      <div className="v2-result-actions">
        <Link to={`/restaurants/${restaurant.id}`} state={returnState} onClick={handleOpen} className="v2-details-action">
          {t('card.viewDetails')}
          <span aria-hidden="true" className="v2-forward-mark">
            →
          </span>
        </Link>
        {telUrl && (
          <a href={telUrl} className="v2-aux-action" aria-label={t('card.callName', { name: names.primary })}>
            <PhoneIcon />
            {t('card.call')}
          </a>
        )}
        {wazeUrl && (
          <a
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="v2-aux-action"
            aria-label={t('card.wazeName', { name: names.primary })}
          >
            <RouteIcon />
            {t('card.waze')}
          </a>
        )}
      </div>
    </li>
  );
}

export default RestaurantCard;
