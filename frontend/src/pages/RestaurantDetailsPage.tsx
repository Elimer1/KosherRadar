import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { getRestaurantDetails } from '../api/restaurantDetailsApi';
import { getErrorMessage } from '../api/errors';
import FormAlert from '../components/FormAlert';
import KashrutBadge from '../components/KashrutBadge';
import { useFormOptions } from '../hooks/useFormOptions';
import type { PublicTeuda, RestaurantDetails } from '../types/restaurantDetails';
import type { HechsherOption } from '../types/submissions';
import { describeEvidenceName, formatDateOnly } from '../utils/kashrutText';
import { getCategoryLabel, getFoodTypeLabel, getHechsherLabel, getKashrutLevelLabel } from '../utils/labels';
import { restaurantDisplayNames } from '../utils/restaurantName';
import { buildGoogleMapsUrl, buildTelUrl, buildWazeUrl, restaurantPageUrl } from '../utils/navigationLinks';
import ShareButton from '../components/ShareButton';
import {
  metaChipClassName,
  pageTitleClassName,
  primaryButtonCompactClassName,
  quietChipClassName,
  secondaryButtonClassName,
  sectionCardClassName,
  textLinkClassName,
} from '../components/formStyles';
import { readRememberedLocation } from '../hooks/useSearchCriteria';
import { resolveSearchReturnPath } from '../search/searchReturn';
import { isSafeHttpUrl } from '../utils/safeUrl';
import { usePageMeta } from '../hooks/usePageMeta';

// NEW (Milestone 4): the public page of one restaurant. It shows the status in words and, below it, all the
// evidence on its own: certificates (verified or EXPIRED, with the photo) and unverified claims, kept apart.
// KosherRadar only shows what was submitted and approved; it never certifies anything itself.
// חדש (אבן דרך 4): הדף הציבורי של מסעדה. הסטטוס במילים ומתחתיו כל הראיות בנפרד: תעודות (תקפות או פג תוקף,
// עם תמונה) וטענות לא מאומתות. KosherRadar מציג רק מה שנשלח ואושר, ואינו מעניק כשרות בעצמו.

interface LoadResult {
  restaurantId: string;
  details: RestaurantDetails | null;
  notFound: boolean;
  error: string;
}

const actionClassName = secondaryButtonClassName;

function placeLine(address: string, city: string | null) {
  const street = address.trim();
  const cityName = city?.trim() ?? '';
  const showCity = cityName !== '' && !street.includes(cityName);
  return [street, showCity ? cityName : ''].filter((part) => part !== '').join(', ');
}

function TeudaCard({ teuda, hechsherOptions }: { teuda: PublicTeuda; hechsherOptions: HechsherOption[] }) {
  const { t } = useTranslation();
  const isExpired = teuda.visibility === 'RECENT_EXPIRED';
  const date = formatDateOnly(teuda.expirationDate);
  const mashgiachTel = buildTelUrl(teuda.mashgiachPhone);

  return (
    <li
      className={`rounded-xl border p-3 text-sm leading-relaxed ${
        isExpired ? 'border-red-800 bg-red-50 text-red-900' : 'border-forest bg-mist text-forest-deep'
      }`}
    >
      <p className="font-semibold">
        <span aria-hidden="true">{isExpired ? '✕ ' : '✓ '}</span>
        {isExpired ? t('details.expired') : t('details.verified')}
      </p>
      <p className="mt-1" dir="auto">
        {getHechsherLabel(teuda.hechsher, teuda.hechsherOther, hechsherOptions)}, {getKashrutLevelLabel(teuda.kashrutLevel)}
      </p>
      <p className="mt-1 font-medium">{isExpired ? t('kashrut.expiredOn', { date }) : t('kashrut.validUntil', { date })}</p>

      {teuda.mashgiachName && (
        <p className="mt-2" dir="auto">
          {t('details.mashgiach', { name: teuda.mashgiachName })}
        </p>
      )}
      {teuda.mashgiachPhone && (
        <p>
          {t('details.mashgiachPhone')}{' '}
          {mashgiachTel ? (
            <a href={mashgiachTel} className="font-medium underline">
              <bdi dir="ltr">{teuda.mashgiachPhone}</bdi>
            </a>
          ) : (
            <bdi dir="ltr">{teuda.mashgiachPhone}</bdi>
          )}
        </p>
      )}

      {isSafeHttpUrl(teuda.photoUrl) && (
        <p className="mt-2">
          <a href={teuda.photoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-medium underline">
            {t('details.photo')}
          </a>
        </p>
      )}
    </li>
  );
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
  }, [restaurantId, t]);

  const hechsherOptions = options?.hechsherOptions || [];

  if (!result || result.restaurantId !== restaurantId) {
    return (
      <p className="flex items-center justify-center gap-2 py-16 text-muted">
        <span className="kr-spinner" aria-hidden="true" />
        {t('details.loading')}
      </p>
    );
  }

  if (result.notFound) {
    return (
      <div className={`${sectionCardClassName} mx-auto max-w-lg space-y-4 text-center`}>
        <h1 className={pageTitleClassName}>{t('details.notFoundTitle')}</h1>
        <p className="text-muted">{t('details.notFoundBody')}</p>
        <Link to={backTo} state={backState} className={`${primaryButtonCompactClassName} mx-auto`}>
          {t('details.back')}
        </Link>
      </div>
    );
  }

  if (!result.details) {
    return (
      <div className={`${sectionCardClassName} mx-auto max-w-lg space-y-4`}>
        <FormAlert message={result.error} />
        <Link to={backTo} state={backState} className="kr-back inline-flex min-h-11 items-center gap-1 text-sm font-medium text-forest underline-offset-2 hover:underline">
          <span aria-hidden="true" className="kr-back-mark">
            ‹
          </span>
          {t('details.back')}
        </Link>
      </div>
    );
  }

  const restaurant = result.details;
  const telUrl = buildTelUrl(restaurant.phone);
  const wazeUrl = buildWazeUrl(restaurant.latitude, restaurant.longitude);
  const place = placeLine(restaurant.address, restaurant.city);
  const names = restaurantDisplayNames(restaurant);
  const mapsUrl = buildGoogleMapsUrl(names.primary, place);
  const claims = restaurant.kashrut.items.filter((item) => item.kind === 'UNVERIFIED');

  return (
    <article className="mx-auto max-w-3xl space-y-5">
      <Link to={backTo} state={backState} className="kr-back inline-flex min-h-11 items-center gap-1 text-sm font-medium text-forest underline-offset-2 hover:underline">
        <span aria-hidden="true" className="kr-back-mark">
          ‹
        </span>
        {/* NEW (Milestone 6): this link was English only. The missing-restaurant state already uses the translation. */}
        {/* חדש (אבן דרך 6): הקישור הזה היה באנגלית בלבד. מצב "מסעדה לא נמצאה" כבר משתמש בתרגום. */}
        {t('details.back')}
      </Link>

      <header className={sectionCardClassName}>
        <h1 className="break-words text-3xl font-semibold tracking-tight text-ink" dir="auto">
          {names.primary}
        </h1>
        {names.secondary.length > 0 && (
          <p className="mt-1 break-words text-muted" dir="auto">
            {names.secondary.join(' · ')}
          </p>
        )}
        {place !== '' && (
          <p className="mt-2 break-words text-ink" dir="auto">
            {place}
          </p>
        )}
        {(restaurant.foodType || restaurant.categories.length > 0) && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {restaurant.foodType && <li className={metaChipClassName}>{getFoodTypeLabel(restaurant.foodType)}</li>}
            {restaurant.categories.map((category) => (
              <li key={category} className={quietChipClassName}>
                {getCategoryLabel(category)}
              </li>
            ))}
          </ul>
        )}
        {restaurant.foodKeywords.length > 0 && (
          <p className="mt-3 text-sm text-muted" dir="auto">
            {t('details.serves', { food: restaurant.foodKeywords.join(', ') })}
          </p>
        )}
      </header>

      <section aria-labelledby="kashrut-heading" className={`${sectionCardClassName} space-y-4`}>
        <h2 id="kashrut-heading" className="text-xl font-semibold text-ink">
          {t('details.kashrut')}
        </h2>
        <KashrutBadge kashrut={restaurant.kashrut} hechsherOptions={hechsherOptions} />

        {restaurant.teudot.length > 0 && (
          <div>
            <h3 className="mb-2 font-semibold text-ink">{t('details.certificates')}</h3>
            <ul className="space-y-2">
              {restaurant.teudot.map((teuda) => (
                <TeudaCard key={teuda.id} teuda={teuda} hechsherOptions={hechsherOptions} />
              ))}
            </ul>
          </div>
        )}

        {claims.length > 0 && (
          <div>
            <h3 className="mb-2 font-semibold text-ink">{t('details.claim')}</h3>
            <ul className="space-y-2">
              {claims.map((claim, index) => (
                <li
                  key={`${claim.hechsher ?? 'none'}-${claim.kashrutLevel ?? 'none'}-${index}`}
                  className="rounded-xl border border-dashed border-amber-ink bg-white p-3 text-sm leading-relaxed text-amber-ink"
                >
                  <p className="font-semibold">
                    <span aria-hidden="true" className="me-1">
                      !
                    </span>
                    {t('details.claim')}
                  </p>
                  <p className="mt-1" dir="auto">
                    {t('details.claimSays', { name: describeEvidenceName(claim, hechsherOptions) })}
                  </p>
                  <p className="mt-1">{t('details.claimNote')}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {restaurant.kashrut.status === 'UNKNOWN' && <p className="text-sm text-muted">{t('details.unknown')}</p>}

        {isSafeHttpUrl(restaurant.kosharotUrl) && (
          <p>
            <a href={restaurant.kosharotUrl} target="_blank" rel="noopener noreferrer" className={textLinkClassName}>
              {t('details.kosharot')}
            </a>
          </p>
        )}

        <p className="text-xs leading-relaxed text-muted">{t('details.disclaimer')}</p>
      </section>

      <section aria-labelledby="contact-heading" className={`${sectionCardClassName} space-y-3`}>
        <h2 id="contact-heading" className="text-xl font-semibold text-ink">
          {t('details.contact')}
        </h2>
        {restaurant.phone && (
          <p className="text-ink">
            {t('details.phone')}{' '}
            {telUrl ? (
              <a href={telUrl} className={textLinkClassName}>
                <bdi dir="ltr">{restaurant.phone}</bdi>
              </a>
            ) : (
              <bdi dir="ltr">{restaurant.phone}</bdi>
            )}
          </p>
        )}
        {isSafeHttpUrl(restaurant.website) && (
          <p className="break-all text-ink">
            {t('details.website')}{' '}
            <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className={textLinkClassName}>
              <bdi dir="ltr">{restaurant.website}</bdi>
            </a>
          </p>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          {telUrl && (
            <a href={telUrl} className={actionClassName}>
              {t('card.call')}
            </a>
          )}
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={actionClassName}>
              {t('details.googleMaps')}
            </a>
          )}
          {wazeUrl && (
            <a href={wazeUrl} target="_blank" rel="noopener noreferrer" className={actionClassName}>
              {t('card.waze')}
            </a>
          )}
          <ShareButton
            title={names.primary}
            url={restaurantPageUrl(restaurant.id, window.location.origin)}
            className={actionClassName}
          />
        </div>
      </section>

      <section aria-labelledby="help-heading" className={`${sectionCardClassName} space-y-3`}>
        <h2 id="help-heading" className="text-xl font-semibold text-ink">
          {t('details.help')}
        </h2>
        <p className="text-sm text-muted">{t('details.needAccount')}</p>
        <div className="flex flex-wrap gap-2">
          <Link to={`/restaurants/${restaurant.id}/add-teuda`} className={primaryButtonCompactClassName}>
            {t('details.addCertificate')}
          </Link>
          <Link to={`/restaurants/${restaurant.id}/report`} className={actionClassName}>
            {t('details.report')}
          </Link>
        </div>
      </section>
    </article>
  );
}

export default RestaurantDetailsPage;
