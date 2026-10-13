// Selected-restaurant panel. Stored name, place, and one kashrut summary. No ratings, hours, or photos.
import type { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { SearchReturnState } from '../../search/searchReturn';
import type { HechsherOption } from '../../types/submissions';
import type { KashrutStatus, RestaurantCardData } from '../../types/search';
import { getFoodTypeLabel } from '../../utils/labels';
import { evidenceSummaryLine, popupPlaceLine } from './mapChrome';
import { restaurantDisplayNames } from '../../utils/restaurantName';
import { formatDistance, getStatusHeadline } from '../../utils/kashrutText';
import { buildTelUrl, buildWazeUrl, restaurantPageUrl } from '../../utils/navigationLinks';
import ShareButton from '../ShareButton';

interface MapPopupCardProps {
  restaurant: RestaurantCardData;
  hechsherOptions: HechsherOption[];
  returnState?: SearchReturnState;
  onOpenRestaurant?: (restaurantId: string, background: boolean) => void;
  onClose: () => void;
}

const STATUS_MARK: Record<KashrutStatus, string> = {
  VERIFIED: '✓',
  UNVERIFIED: '!',
  EXPIRED: '✕',
  UNKNOWN: '?',
};

const STATUS_CLASS: Record<KashrutStatus, string> = {
  VERIFIED: 'kr-v2-map-status-verified',
  UNVERIFIED: 'kr-v2-map-status-unverified',
  EXPIRED: 'kr-v2-map-status-expired',
  UNKNOWN: 'kr-v2-map-status-unknown',
};

function MapPopupCard({ restaurant, hechsherOptions, returnState, onOpenRestaurant, onClose }: MapPopupCardProps) {
  const { t } = useTranslation();
  const telUrl = buildTelUrl(restaurant.phone);
  const wazeUrl = buildWazeUrl(restaurant.latitude, restaurant.longitude);
  const pageUrl = restaurantPageUrl(restaurant.id, window.location.origin);
  const names = restaurantDisplayNames(restaurant);
  const place = popupPlaceLine(restaurant.address, restaurant.city);
  const distance = formatDistance(restaurant.distanceKm);
  const evidence = evidenceSummaryLine(restaurant.kashrut, hechsherOptions);
  const food = restaurant.foodType ? getFoodTypeLabel(restaurant.foodType) : '';
  const meta = [food, distance].filter((part) => part !== '').join(' · ');
  const mentionsHiddenExpired = restaurant.kashrut.hasRecentExpired && restaurant.kashrut.status !== 'EXPIRED';
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
    <div className="kr-v2-map-panel-card">
      {/* NEW (Visual v2): scroll restaurant content together so short maps keep actions visible. */}
      {/* חדש (עיצוב v2): גלילת פרטי המסעדה יחד כדי לשמור על כפתורים גלויים במפה נמוכה. */}
      <div className="kr-v2-map-panel-body">
        <div className="kr-v2-map-panel-fixed-top">
          <div className="kr-v2-map-panel-head">
            <div className="kr-v2-map-panel-names">
              <p className="kr-v2-map-panel-title" dir="auto">
                <bdi>{names.primary}</bdi>
              </p>
              {names.secondary.length > 0 && (
                <p className="kr-v2-map-panel-alt">
                  {names.secondary.map((name, index) => (
                    <span key={`${name}-${index}`}>
                      {index > 0 && <span aria-hidden="true"> · </span>}
                      <bdi>{name}</bdi>
                    </span>
                  ))}
                </p>
              )}
            </div>
            <button type="button" className="kr-v2-map-panel-close" onClick={onClose} aria-label={t('layout.dismiss')}>
              <span aria-hidden="true">×</span>
            </button>
          </div>
          {place !== '' && (
            <p className="kr-v2-map-panel-address">
              <bdi>{place}</bdi>
            </p>
          )}
          <p className={`kr-v2-map-panel-status ${STATUS_CLASS[restaurant.kashrut.status]}`}>
            <span aria-hidden="true" className="kr-v2-map-panel-status-mark">
              {STATUS_MARK[restaurant.kashrut.status]}
            </span>
            {getStatusHeadline(restaurant.kashrut.status)}
          </p>
        </div>
        <div className="kr-v2-map-panel-scroll">
          {evidence !== '' && <p className="kr-v2-map-panel-evidence">{evidence}</p>}
          {mentionsHiddenExpired && <p className="kr-v2-map-panel-evidence">{t('kashrut.alsoExpired')}</p>}
          {meta !== '' && <p className="kr-v2-map-panel-meta">{meta}</p>}
        </div>
      </div>
      <div className="kr-v2-map-panel-fixed-bottom">
        <div className="kr-v2-map-panel-actions">
          <Link
            to={`/restaurants/${restaurant.id}`}
            state={returnState}
            onClick={handleOpen}
            className="kr-v2-map-action kr-v2-map-action-primary"
          >
            {t('card.viewDetails')}
          </Link>
          <div className="kr-v2-map-panel-secondary">
            {wazeUrl && (
              <a
                href={wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="kr-v2-map-action kr-v2-map-action-secondary"
                aria-label={t('card.wazeName', { name: names.primary })}
              >
                {t('card.waze')}
              </a>
            )}
            {telUrl && (
              <a
                href={telUrl}
                className="kr-v2-map-action kr-v2-map-action-secondary"
                aria-label={t('card.callName', { name: names.primary })}
              >
                {t('card.call')}
              </a>
            )}
            <ShareButton title={names.primary} url={pageUrl} className="kr-v2-map-action kr-v2-map-action-quiet" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapPopupCard;
