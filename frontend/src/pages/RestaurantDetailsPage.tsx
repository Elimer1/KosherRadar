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
import { ContactDock, QuickActions } from '../components/details/RestaurantActions';
import UnverifiedClaims from '../components/details/UnverifiedClaims';
import '../components/details/details.css';
import { useFormOptions } from '../hooks/useFormOptions';
import { readRememberedLocation } from '../hooks/useSearchCriteria';
import { usePageMeta } from '../hooks/usePageMeta';
import { resolveSearchReturnPath } from '../search/searchReturn';
import type { RestaurantDetails } from '../types/restaurantDetails';
import { restaurantDisplayNames } from '../utils/restaurantName';

// NEW (Milestone 4): the public page of one restaurant. It shows the status in words and, below it, all the
// evidence on its own: certificates (verified or EXPIRED, with the photo) and unverified claims, kept apart.
// KosherRadar only shows what was submitted and approved; it never certifies anything itself.
// חדש (אבן דרך 4): הדף הציבורי של מסעדה. הסטטוס במילים ומתחתיו כל הראיות בנפרד: תעודות (תקפות או פג תוקף,
// עם תמונה) וטענות לא מאומתות. KosherRadar מציג רק מה שנשלח ואושר, ואינו מעניק כשרות בעצמו.

// NEW (Redesign wave 1): the same evidence, arranged so identity, status, certificates, and claims are separate.
// חדש (גל עיצוב 1): אותן ראיות, בפריסה שמפרידה זהות, סטטוס, תעודות, וטענות.

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
  // NEW (UX WP1A): Back to search uses the originating search, then the same-tab search, then home.
  // חדש (חבילת UX 1A): חזרה לחיפוש משתמשת בחיפוש המקורי, אחר כך בחיפוש בלשונית, ולבסוף בדף הבית.
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

        // 404 (not public or no such restaurant) and 400 (not a valid id) both mean "no such page".
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

    // A fast click to another restaurant must not show the answer of the previous one.
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

  return (
    <article className="kr-details">
      <DetailsBackLink to={backTo} state={backState} />
      <header className="kr-details-hero">
        <DetailsIdentity restaurant={restaurant} names={names} />
        <QuickActions restaurant={restaurant} primaryName={names.primary} />
      </header>
      <div className="kr-details-layout">
        <div className="kr-details-evidence">
          <KashrutOverview restaurant={restaurant} hechsherOptions={hechsherOptions} />
          <CertificateList teudot={restaurant.teudot} hechsherOptions={hechsherOptions} />
          <UnverifiedClaims claims={claims} hechsherOptions={hechsherOptions} />
          <EvidenceFooter kosharotUrl={restaurant.kosharotUrl} />
        </div>
        <ContactDock restaurant={restaurant} primaryName={names.primary} />
      </div>
    </article>
  );
}

export default RestaurantDetailsPage;
