// Popup body: stored name, place, and the existing kashrut summary. No ratings, hours, or photos.
// גוף החלון: שם שמור, מקום, וסיכום הכשרות הקיים. בלי דירוג, שעות או תמונות.
import type { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { SearchReturnState } from '../../search/searchReturn';
import type { HechsherOption } from '../../types/submissions';
import type { RestaurantCardData } from '../../types/search';
import { getFoodTypeLabel } from '../../utils/labels';
import { popupPlaceLine } from './mapChrome';
import { restaurantDisplayNames } from '../../utils/restaurantName';
import { formatDistance } from '../../utils/kashrutText';
import { buildTelUrl, buildWazeUrl, restaurantPageUrl } from '../../utils/navigationLinks';
import KashrutBadge from '../KashrutBadge';
import ShareButton from '../ShareButton';

interface MapPopupCardProps {
  restaurant: RestaurantCardData;
  hechsherOptions: HechsherOption[];
  returnState?: SearchReturnState;
  onOpenRestaurant?: (restaurantId: string, background: boolean) => void;
}

function MapPopupCard({ restaurant, hechsherOptions, returnState, onOpenRestaurant }: MapPopupCardProps) {
  const { t } = useTranslation();
  const telUrl = buildTelUrl(restaurant.phone);
  const wazeUrl = buildWazeUrl(restaurant.latitude, restaurant.longitude);
  const pageUrl = restaurantPageUrl(restaurant.id, window.location.origin);
  const names = restaurantDisplayNames(restaurant);
  const place = popupPlaceLine(restaurant.address, restaurant.city);
  const distance = formatDistance(restaurant.distanceKm);
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
    <div className="kr-map-popup-card">
      <div className="kr-map-popup-names">
        <p className="kr-map-popup-title" dir="auto">
          <bdi>{names.primary}</bdi>
        </p>
        {names.secondary.length > 0 && (
          <p className="kr-map-popup-alt">
            {names.secondary.map((name, index) => (
              <span key={`${name}-${index}`}>
                {index > 0 && <span aria-hidden="true"> · </span>}
                <bdi>{name}</bdi>
              </span>
            ))}
          </p>
        )}
      </div>
      {place !== '' && (
        <p className="kr-map-popup-place">
          <bdi>{place}</bdi>
        </p>
      )}
      {(restaurant.foodType || distance !== '') && (
        <p className="kr-map-popup-meta">
          {restaurant.foodType ? getFoodTypeLabel(restaurant.foodType) : ''}
          {restaurant.foodType && distance !== '' ? ' · ' : ''}
          {distance}
        </p>
      )}
      <KashrutBadge kashrut={restaurant.kashrut} hechsherOptions={hechsherOptions} />
      <div className="kr-map-popup-actions">
        <Link to={`/restaurants/${restaurant.id}`} state={returnState} onClick={handleOpen} className="kr-map-action kr-map-action-primary">
          {t('card.viewDetails')}
        </Link>
        {telUrl && (
          <a href={telUrl} className="kr-map-action" aria-label={t('card.callName', { name: names.primary })}>
            {t('card.call')}
          </a>
        )}
        {wazeUrl && (
          <a href={wazeUrl} target="_blank" rel="noopener noreferrer" className="kr-map-action" aria-label={t('card.wazeName', { name: names.primary })}>
            {t('card.waze')}
          </a>
        )}
        <ShareButton title={names.primary} url={pageUrl} className="kr-map-action" />
      </div>
    </div>
  );
}

export default MapPopupCard;
