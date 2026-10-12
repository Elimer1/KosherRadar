import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
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
import { buildGoogleMapsUrl, buildTelUrl, buildWazeUrl, restaurantPageUrl } from '../utils/navigationLinks';
import ShareButton from '../components/ShareButton';
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

const actionClassName =
  'rounded border border-green-600 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50';

function TeudaCard({ teuda, hechsherOptions }: { teuda: PublicTeuda; hechsherOptions: HechsherOption[] }) {
  const { t } = useTranslation();
  const isExpired = teuda.visibility === 'RECENT_EXPIRED';
  const date = formatDateOnly(teuda.expirationDate);
  const mashgiachTel = buildTelUrl(teuda.mashgiachPhone);

  return (
    <li
      className={`rounded border p-3 text-sm ${
        isExpired ? 'border-red-400 bg-red-50 text-red-900' : 'border-green-600 bg-green-50 text-green-900'
      }`}
    >
      <p className="font-semibold">
        <span aria-hidden="true">{isExpired ? '✕ ' : '✓ '}</span>
        {isExpired ? t('details.expired') : t('details.verified')}
      </p>
      <p className="mt-0.5">
        {getHechsherLabel(teuda.hechsher, teuda.hechsherOther, hechsherOptions)},{' '}
        {getKashrutLevelLabel(teuda.kashrutLevel)}
      </p>
      <p className="mt-0.5 font-medium">{isExpired ? t('kashrut.expiredOn', { date }) : t('kashrut.validUntil', { date })}</p>

      {teuda.mashgiachName && <p className="mt-1">{t('details.mashgiach', { name: teuda.mashgiachName })}</p>}
      {teuda.mashgiachPhone && (
        <p>
          {t('details.mashgiachPhone')}{' '}
          {mashgiachTel ? (
            <a href={mashgiachTel} className="font-medium underline">
              {teuda.mashgiachPhone}
            </a>
          ) : (
            teuda.mashgiachPhone
          )}
        </p>
      )}

      {isSafeHttpUrl(teuda.photoUrl) && (
        <p className="mt-2">
          <a href={teuda.photoUrl} target="_blank" rel="noopener noreferrer" className="font-medium underline">
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
  const { options } = useFormOptions();
  const [result, setResult] = useState<LoadResult | null>(null);
  const loadedName = result && result.restaurantId === restaurantId ? result.details?.name : '';

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
    return <p className="text-gray-600">{t('details.loading')}</p>;
  }

  if (result.notFound) {
    return (
      <div className="mx-auto max-w-lg space-y-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('details.notFoundTitle')}</h1>
        <p className="text-gray-600">{t('details.notFoundBody')}</p>
        <Link to="/" className="inline-block font-medium text-green-700 hover:underline">
          {t('details.back')}
        </Link>
      </div>
    );
  }

  if (!result.details) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <FormAlert message={result.error} />
        <Link to="/" className="inline-block font-medium text-green-700 hover:underline">
          {t('details.back')}
        </Link>
      </div>
    );
  }

  const restaurant = result.details;
  const claims = restaurant.kashrut.items.filter((item) => item.kind === 'UNVERIFIED');
  const telUrl = buildTelUrl(restaurant.phone);
  const wazeUrl = buildWazeUrl(restaurant.latitude, restaurant.longitude);
  const mapsUrl = buildGoogleMapsUrl(restaurant.latitude, restaurant.longitude, restaurant.address);
  const showCity = restaurant.city && !restaurant.address.includes(restaurant.city);
  const place = showCity ? `${restaurant.address}, ${restaurant.city}` : restaurant.address;
  const otherNames = [restaurant.nameHe, restaurant.nameEn].filter(
    (name): name is string => Boolean(name) && name !== restaurant.name
  );

  return (
    <article className="mx-auto max-w-3xl space-y-6">
        <Link to="/" className="text-sm font-medium text-green-700 hover:underline">
          {/* NEW (Milestone 6): this link was English only. The missing-restaurant state already uses the translation. */}
          {/* חדש (אבן דרך 6): הקישור הזה היה באנגלית בלבד. מצב "מסעדה לא נמצאה" כבר משתמש בתרגום. */}
          {t('details.back')}
        </Link>

      <header>
        <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
        {otherNames.length > 0 && <p className="text-gray-600">{otherNames.join(' · ')}</p>}
        <p className="mt-1 text-gray-700">{place}</p>
        <p className="mt-2 text-sm text-gray-700">
          <span className="font-medium">{getFoodTypeLabel(restaurant.foodType)}</span>
          {restaurant.categories.length > 0 && (
            <span> · {restaurant.categories.map((category) => getCategoryLabel(category)).join(', ')}</span>
          )}
        </p>
        {restaurant.foodKeywords.length > 0 && (
          <p className="mt-1 text-sm text-gray-600">{t('details.serves', { food: restaurant.foodKeywords.join(', ') })}</p>
        )}
      </header>

      <section aria-labelledby="kashrut-heading" className="space-y-3">
        <h2 id="kashrut-heading" className="text-xl font-semibold text-gray-900">
          {t('details.kashrut')}
        </h2>
        <KashrutBadge kashrut={restaurant.kashrut} hechsherOptions={hechsherOptions} />

        {restaurant.teudot.length > 0 && (
          <div>
            <h3 className="mb-2 font-medium text-gray-900">{t('details.certificates')}</h3>
            <ul className="space-y-2">
              {restaurant.teudot.map((teuda) => (
                <TeudaCard key={teuda.id} teuda={teuda} hechsherOptions={hechsherOptions} />
              ))}
            </ul>
          </div>
        )}

        {claims.length > 0 && (
          <div>
            <h3 className="mb-2 font-medium text-gray-900">{t('details.claim')}</h3>
            <ul className="space-y-2">
              {claims.map((claim, index) => (
                <li
                  key={index}
                  className="rounded border border-dashed border-amber-500 bg-amber-50 p-3 text-sm text-amber-900"
                >
                  <p className="font-semibold">
                    <span aria-hidden="true">! </span>
                    {t('kashrut.UNVERIFIED')}
                  </p>
                  <p className="mt-0.5">{t('details.claimSays', { name: describeEvidenceName(claim, hechsherOptions) })}</p>
                  <p className="mt-0.5">{t('details.claimNote')}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {restaurant.kashrut.status === 'UNKNOWN' && (
          <p className="text-sm text-gray-600">
            {t('details.unknown')}
          </p>
        )}

        {isSafeHttpUrl(restaurant.kosharotUrl) && (
          <p>
            <a
              href={restaurant.kosharotUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-green-700 underline"
            >
              {t('details.kosharot')}
            </a>
          </p>
        )}

        <p className="text-xs text-gray-500">
          {t('details.disclaimer')}
        </p>
      </section>

      <section aria-labelledby="contact-heading" className="space-y-2">
        <h2 id="contact-heading" className="text-xl font-semibold text-gray-900">
          {t('details.contact')}
        </h2>
        {restaurant.phone && (
          <p className="text-gray-700">
            {t('details.phone')}{' '}
            {telUrl ? (
              <a href={telUrl} className="font-medium text-green-700 underline">
                {restaurant.phone}
              </a>
            ) : (
              restaurant.phone
            )}
          </p>
        )}
        {isSafeHttpUrl(restaurant.website) && (
          <p className="text-gray-700">
            {t('details.website')}{' '}
            <a
              href={restaurant.website}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-green-700 underline"
            >
              {restaurant.website}
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
            title={restaurant.name}
            url={restaurantPageUrl(restaurant.id, window.location.origin)}
            className={actionClassName}
          />
        </div>
      </section>

      <section aria-labelledby="help-heading" className="space-y-2 border-t border-gray-200 pt-4">
        <h2 id="help-heading" className="text-xl font-semibold text-gray-900">
          {t('details.help')}
        </h2>
        <p className="text-sm text-gray-600">{t('details.needAccount')}</p>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/restaurants/${restaurant.id}/add-teuda`}
            className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
          >
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
