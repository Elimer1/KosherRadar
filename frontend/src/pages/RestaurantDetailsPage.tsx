import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { getRestaurantDetails } from '../api/restaurantDetailsApi';
import { getErrorMessage } from '../api/errors';
import CertificateList from '../components/details/CertificateList';
import DetailsIdentity from '../components/details/DetailsIdentity';
import { DetailsBackLink, DetailsLoadError, DetailsLoading, DetailsNotFound } from '../components/details/DetailsStates';
import KashrutOverview, { EvidenceFooter } from '../components/details/KashrutOverview';
import { evidenceHeading } from '../components/details/labels';
import { ContactDock, QuickActions } from '../components/details/RestaurantActions';
import UnverifiedClaims from '../components/details/UnverifiedClaims';
import '../components/details/details.css';
import { useFormOptions } from '../hooks/useFormOptions';
import { readRememberedLocation } from '../hooks/useSearchCriteria';
import { usePageMeta } from '../hooks/usePageMeta';
import { resolveSearchReturnPath } from '../search/searchReturn';
import type { RestaurantDetails } from '../types/restaurantDetails';
import { restaurantDisplayNames } from '../utils/restaurantName';

// The public page of one restaurant. Identity is a light heading. One kashrut line
// sits above the records that actually support it. KosherRadar does not certify restaurants.
// דף ציבורי של מסעדה. כותרת בהירה, שורת כשרות אחת, ומתחתיה הראיות עצמן.

interface LoadResult {
  restaurantId: string;
  details: RestaurantDetails | null;
  notFound: boolean;
  error: string;
}

function RestaurantDetailsPage() {
  const { t } = useTranslation();
  const { restaurantId = '' } = useParams();
  const location = useLocation();
  const backTo = resolveSearchReturnPath(location.state);
  const rememberedLocation = readRememberedLocation(location.state);
  const backState = rememberedLocation ? { searchLocation: rememberedLocation } : undefined;
  const { options } = useFormOptions();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<LoadResult | null>(null);
  const loadedRestaurant = result && result.restaurantId === restaurantId ? result.details : null;
  const loadedName = loadedRestaurant ? restaurantDisplayNames(loadedRestaurant).primary : '';

  usePageMeta(
    loadedName ? t('meta.restaurantTitle', { name: loadedName }) : t('meta.title'),
    loadedName ? t('meta.restaurantDescription', { name: loadedName }) : t('meta.description')
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const details = await getRestaurantDetails(restaurantId);
        if (!cancelled) {
          setResult({ restaurantId, details, notFound: false, error: '' });
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        const status = axios.isAxiosError(err) ? err.response?.status : undefined;
        const notFound = status === 404 || status === 400;
        setResult({
          restaurantId,
          details: null,
          notFound,
          error: notFound ? '' : getErrorMessage(err, t('forms.loadRestaurant')),
        });
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [restaurantId, t, attempt]);

  const retry = () => {
    setResult(null);
    setAttempt((value) => value + 1);
  };

  const hechsherOptions = options?.hechsherOptions || [];

  if (!result || result.restaurantId !== restaurantId) {
    return <DetailsLoading to={backTo} state={backState} />;
  }

  if (result.notFound) {
    return <DetailsNotFound to={backTo} state={backState} />;
  }

  if (!result.details) {
    return <DetailsLoadError message={result.error} onRetry={retry} to={backTo} state={backState} />;
  }

  const restaurant = result.details;
  const names = restaurantDisplayNames(restaurant);
  const claims = restaurant.kashrut.items.filter((item) => item.kind === 'UNVERIFIED');
  const hasEvidence = restaurant.teudot.length > 0 || claims.length > 0;
  const sectionTitle = restaurant.teudot.length > 0 ? evidenceHeading() : t('details.claim');

  return (
    <article className="kr-v2-details">
      <DetailsBackLink to={backTo} state={backState} />
      <header className="kr-v2-details-identity">
        <div className="kr-v2-details-identity-main">
          <DetailsIdentity restaurant={restaurant} names={names} />
        </div>
        <QuickActions restaurant={restaurant} primaryName={names.primary} />
      </header>
      <hr className="kr-v2-details-rule" />
      <KashrutOverview restaurant={restaurant} hechsherOptions={hechsherOptions} />
      <div className="kr-v2-details-columns">
        <div className="kr-v2-details-evidence">
          {hasEvidence && (
            <section className="kr-v2-details-evidence-block" aria-labelledby="certificates-heading">
              <h2 id="certificates-heading" className="kr-v2-details-heading">
                {sectionTitle}
              </h2>
              <CertificateList teudot={restaurant.teudot} hechsherOptions={hechsherOptions} />
              <UnverifiedClaims claims={claims} hechsherOptions={hechsherOptions} showStatusLabel={restaurant.teudot.length > 0} />
            </section>
          )}
          <EvidenceFooter kosharotUrl={restaurant.kosharotUrl} />
        </div>
        <ContactDock restaurant={restaurant} primaryName={names.primary} />
      </div>
    </article>
  );
}

export default RestaurantDetailsPage;
