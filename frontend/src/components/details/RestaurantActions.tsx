// NEW (Redesign wave 1): visit actions sit on the identity band. Account actions sit beside the evidence.
// חדש (גל עיצוב 1): פעולות הביקור על פס הזהות. פעולות החשבון לצד הראיות.
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import ShareButton from '../ShareButton';
import type { RestaurantDetails } from '../../types/restaurantDetails';
import { buildGoogleMapsUrl, buildTelUrl, buildWazeUrl, restaurantPageUrl } from '../../utils/navigationLinks';
import { isSafeHttpUrl } from '../../utils/safeUrl';
import { placeLine } from './placeLine';

interface ActionProps {
  restaurant: RestaurantDetails;
  primaryName: string;
}

function linksFor(restaurant: RestaurantDetails, primaryName: string) {
  const phone = restaurant.phone?.trim() ?? '';
  return {
    phone,
    telUrl: buildTelUrl(phone === '' ? null : phone),
    mapsUrl: buildGoogleMapsUrl(primaryName, placeLine(restaurant.address, restaurant.city)),
    wazeUrl: buildWazeUrl(restaurant.latitude, restaurant.longitude),
    website: isSafeHttpUrl(restaurant.website) ? restaurant.website : null,
  };
}

export function QuickActions({ restaurant, primaryName }: ActionProps) {
  const { t } = useTranslation();
  const links = linksFor(restaurant, primaryName);

  return (
    <div className="kr-details-toolbar">
      {links.telUrl && (
        <a className="kr-details-command" href={links.telUrl} aria-label={t('card.callName', { name: primaryName })}>
          {t('card.call')}
        </a>
      )}
      {links.mapsUrl && (
        <a className="kr-details-command" href={links.mapsUrl} target="_blank" rel="noopener noreferrer">
          {t('details.googleMaps')}
        </a>
      )}
      {links.wazeUrl && (
        <a
          className="kr-details-command"
          href={links.wazeUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('card.wazeName', { name: primaryName })}
        >
          {t('card.waze')}
        </a>
      )}
      <div className="kr-details-share">
        <ShareButton
          title={primaryName}
          url={restaurantPageUrl(restaurant.id, window.location.origin)}
          className="kr-details-command"
        />
      </div>
    </div>
  );
}

export function ContactDock({ restaurant, primaryName }: ActionProps) {
  const { t } = useTranslation();
  const links = linksFor(restaurant, primaryName);

  return (
    <aside className="kr-details-dock" aria-labelledby="contact-heading">
      <h2 id="contact-heading" className="kr-details-heading">
        {t('details.contact')}
      </h2>
      {links.phone !== '' && (
        <p className="kr-details-contact-line">
          <span className="kr-details-caption">{t('details.phone')}</span>
          {links.telUrl ? (
            <a className="kr-details-phone" href={links.telUrl}>
              <bdi dir="ltr">{links.phone}</bdi>
            </a>
          ) : (
            <bdi className="kr-details-phone" dir="ltr">
              {links.phone}
            </bdi>
          )}
        </p>
      )}
      {links.website && (
        <p className="kr-details-contact-line kr-details-break">
          <span className="kr-details-caption">{t('details.website')}</span>
          <a href={links.website} target="_blank" rel="noopener noreferrer">
            <bdi className="kr-details-url" dir="ltr">
              {links.website}
            </bdi>
          </a>
        </p>
      )}
      <div className="kr-details-dock-actions">
        <h2 id="help-heading" className="kr-details-heading">
          {t('details.help')}
        </h2>
        <p className="kr-details-help-note">{t('details.needAccount')}</p>
        <Link className="kr-details-solid" to={`/restaurants/${restaurant.id}/add-teuda`}>
          {t('details.addCertificate')}
        </Link>
        <Link className="kr-details-ghost" to={`/restaurants/${restaurant.id}/report`}>
          {t('details.report')}
        </Link>
      </div>
    </aside>
  );
}
