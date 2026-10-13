// NEW (Visual v2): restaurant details presentation; existing contracts and status labels stay authoritative.
// חדש (עיצוב 2): תצוגת פרטי מסעדה תוך שמירה על חוזים ותוויות קיימים.
// Directions is the primary visit action. Call and share stay compact.
// Waze and Google Maps stay separate destinations when both can be built.
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import ShareButton from '../ShareButton';
import type { RestaurantDetails } from '../../types/restaurantDetails';
import { buildGoogleMapsUrl, buildTelUrl, buildWazeUrl, restaurantPageUrl } from '../../utils/navigationLinks';
import { isSafeHttpUrl } from '../../utils/safeUrl';
import { DirectionsIcon } from './StatusIcon';
import { directionsWord } from './labels';
import { placeLine } from './placeLine';

interface ActionProps {
  restaurant: RestaurantDetails;
  primaryName: string;
}

function linksFor(restaurant: RestaurantDetails, primaryName: string) {
  const phone = restaurant.phone?.trim() ?? '';
  return {
    phone,
    place: placeLine(restaurant.address, restaurant.city),
    telUrl: buildTelUrl(phone === '' ? null : phone),
    mapsUrl: buildGoogleMapsUrl(primaryName, placeLine(restaurant.address, restaurant.city)),
    wazeUrl: buildWazeUrl(restaurant.latitude, restaurant.longitude),
    website: isSafeHttpUrl(restaurant.website) ? restaurant.website : null,
  };
}

function DirectionsControl({
  mapsUrl,
  wazeUrl,
  primaryName,
}: {
  mapsUrl: string | null;
  wazeUrl: string | null;
  primaryName: string;
}) {
  const { t } = useTranslation();
  const label = directionsWord();

  if (!mapsUrl && !wazeUrl) {
    return null;
  }

  if (mapsUrl && wazeUrl) {
    return (
      <details className="kr-v2-details-directions" onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.currentTarget.open = false;
          event.currentTarget.querySelector('summary')?.focus();
        }
      }}>
        <summary className="kr-v2-details-primary">
          <DirectionsIcon />
          <span>{label}</span>
          <span className="kr-v2-details-chevron" aria-hidden="true">⌄</span>
        </summary>
        <div className="kr-v2-details-menu">
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
            {t('details.googleMaps')}
          </a>
          <a href={wazeUrl} target="_blank" rel="noopener noreferrer" aria-label={t('card.wazeName', { name: primaryName })}>
            {t('card.waze')}
          </a>
        </div>
      </details>
    );
  }

  const href = mapsUrl ?? wazeUrl ?? '';
  const destination = mapsUrl ? t('details.googleMaps') : t('card.waze');
  const wazeLabel = mapsUrl ? undefined : t('card.wazeName', { name: primaryName });

  return (
    <a
      className="kr-v2-details-primary"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={wazeLabel}
    >
      <DirectionsIcon />
      <span>{label}</span>
      <span className="kr-v2-details-sr">{destination}</span>
    </a>
  );
}

export function QuickActions({ restaurant, primaryName }: ActionProps) {
  const { t } = useTranslation();
  const links = linksFor(restaurant, primaryName);

  return (
    <div className="kr-v2-details-actions" data-directions="">
      <DirectionsControl mapsUrl={links.mapsUrl} wazeUrl={links.wazeUrl} primaryName={primaryName} />
      <div className="kr-v2-details-secondary-row">
        {links.telUrl && (
          <a className="kr-v2-details-action" href={links.telUrl} aria-label={t('card.callName', { name: primaryName })}>
            {t('card.call')}
          </a>
        )}
        <div className="kr-v2-details-share">
          <ShareButton
            title={primaryName}
            url={restaurantPageUrl(restaurant.id, window.location.origin)}
            className="kr-v2-details-action"
          />
        </div>
      </div>
    </div>
  );
}

export function ContactDock({ restaurant, primaryName }: ActionProps) {
  const { t } = useTranslation();
  const links = linksFor(restaurant, primaryName);
  const hasContact = Boolean(links.phone || links.website || links.place || links.mapsUrl || links.wazeUrl);

  return (
    <aside className="kr-v2-details-side">
      {hasContact && (
        <section aria-labelledby="contact-heading">
          <h2 id="contact-heading" className="kr-v2-details-heading">
            {t('details.contact')}
          </h2>
          <div className="kr-v2-details-contact">
            {links.phone !== '' && (
              <p>
                <span className="kr-v2-details-k">{t('details.phone')}</span>{' '}
                {links.telUrl ? (
                  <a href={links.telUrl}>
                    <bdi dir="ltr">{links.phone}</bdi>
                  </a>
                ) : (
                  <bdi dir="ltr">{links.phone}</bdi>
                )}
              </p>
            )}
            {links.website && (
              <p>
                <span className="kr-v2-details-k">{t('details.website')}</span>{' '}
                <a href={links.website} target="_blank" rel="noopener noreferrer">
                  <bdi className="kr-v2-details-url" dir="ltr">
                    {links.website}
                  </bdi>
                </a>
              </p>
            )}
            {links.place !== '' && (
              <p className="kr-v2-details-contact-place" dir="auto">
                <bdi>{links.place}</bdi>
              </p>
            )}
            {(links.mapsUrl || links.wazeUrl) && (
              <p className="kr-v2-details-navlinks">
                {links.mapsUrl && (
                  <a href={links.mapsUrl} target="_blank" rel="noopener noreferrer">
                    {t('details.googleMaps')}
                  </a>
                )}
                {links.wazeUrl && (
                  <a href={links.wazeUrl} target="_blank" rel="noopener noreferrer" aria-label={t('card.wazeName', { name: primaryName })}>
                    {t('card.waze')}
                  </a>
                )}
              </p>
            )}
          </div>
        </section>
      )}
      <section aria-labelledby="help-heading" className="kr-v2-details-help">
        <h2 id="help-heading" className="kr-v2-details-heading">
          {t('details.help')}
        </h2>
        <p className="kr-v2-details-help-note">{t('details.needAccount')}</p>
        <div className="kr-v2-details-help-actions">
          <Link className="kr-v2-details-add" to={`/restaurants/${restaurant.id}/add-teuda`}>
            {t('details.addCertificate')}
          </Link>
          <Link className="kr-v2-details-report" to={`/restaurants/${restaurant.id}/report`}>
            {t('details.report')}
          </Link>
        </div>
      </section>
    </aside>
  );
}
