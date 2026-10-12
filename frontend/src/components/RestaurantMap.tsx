// NEW (Milestone 5): the map view. It loads APPROVED restaurants inside the visible rectangle, using the
// same filters as the list. Moving the map does not change the chosen search location.
// חדש (אבן דרך 5): תצוגת המפה. טוענת מסעדות מאושרות בתוך המלבן הנראה, עם אותם מסננים כמו הרשימה.
// הזזת המפה לא משנה את מיקום החיפוש שנבחר.
import type { MouseEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import axios from 'axios';
import L from 'leaflet';
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';
import { getSearchErrorMessage } from '../api/errors';
import { searchRestaurantsInBounds } from '../api/searchApi';
import type { SearchReturnState } from '../search/searchReturn';
import type { HechsherOption } from '../types/submissions';
import type { MapBounds, RestaurantCardData, SearchFilters } from '../types/search';
import { getFoodTypeLabel } from '../utils/labels';
import { restaurantDisplayNames } from '../utils/restaurantName';
import { ISRAEL_MAP_BOUNDS, boundsCrossDateLine, zoomForRadius } from '../utils/mapView';
import { buildTelUrl, buildWazeUrl, restaurantPageUrl } from '../utils/navigationLinks';
import KashrutBadge from './KashrutBadge';
import ShareButton from './ShareButton';
import { primaryButtonCompactClassName, secondaryButtonClassName } from './formStyles';

interface RestaurantMapProps {
  filters: SearchFilters;
  hechsherOptions: HechsherOption[];
  returnState?: SearchReturnState;
  onOpenRestaurant?: (restaurantId: string, background: boolean) => void;
}

const actionClassName = secondaryButtonClassName;

// A green pin drawn in the page, so the map does not depend on Leaflet's default image files.
// סיכה ירוקה שמצוירת בדף, כדי שהמפה לא תלויה בקובצי התמונה של Leaflet.
const markerIcon = L.divIcon({
  className: 'kr-marker-wrap',
  html: '<span class="kr-marker"></span>',
  iconSize: [28, 36],
  iconAnchor: [14, 34],
  popupAnchor: [0, -30],
});

const readBounds = (map: L.Map): MapBounds => {
  const box = map.getBounds();

  return {
    north: box.getNorth(),
    south: box.getSouth(),
    east: box.getEast(),
    west: box.getWest(),
  };
};

function BoundsReporter({ onBounds }: { onBounds: (bounds: MapBounds) => void }) {
  const map = useMap();
  const onBoundsRef = useRef(onBounds);

  useEffect(() => {
    onBoundsRef.current = onBounds;
  }, [onBounds]);

  useMapEvents({
    moveend() {
      onBoundsRef.current(readBounds(map));
    },
  });

  useEffect(() => {
    onBoundsRef.current(readBounds(map));
  }, [map]);

  return null;
}

// Recenters only when the visitor picks a new search location or radius, not when they drag the map.
// ממקם מחדש רק כשנבחר מיקום חיפוש או רדיוס חדש, לא כשגוררים את המפה.
function FollowSearchLocation({ location, radiusKm }: { location: SearchFilters['location']; radiusKm: number | null }) {
  const map = useMap();
  const seen = useRef<string | null>(null);

  useEffect(() => {
    const key = location ? `${location.lat},${location.lng},${radiusKm ?? ''}` : 'israel';

    if (seen.current === null || seen.current === key) {
      seen.current = key;
      return;
    }

    seen.current = key;

    if (!location) {
      map.fitBounds(
        [
          [ISRAEL_MAP_BOUNDS.south, ISRAEL_MAP_BOUNDS.west],
          [ISRAEL_MAP_BOUNDS.north, ISRAEL_MAP_BOUNDS.east],
        ],
        { padding: [12, 12] }
      );
      return;
    }

    map.setView([location.lat, location.lng], zoomForRadius(radiusKm));
  }, [location, radiusKm, map]);

  return null;
}

function MapPopup({
  restaurant,
  hechsherOptions,
  returnState,
  onOpenRestaurant,
}: {
  restaurant: RestaurantCardData;
  hechsherOptions: HechsherOption[];
  returnState?: SearchReturnState;
  onOpenRestaurant?: (restaurantId: string, background: boolean) => void;
}) {
  const { t } = useTranslation();
  const telUrl = buildTelUrl(restaurant.phone);
  const wazeUrl = buildWazeUrl(restaurant.latitude, restaurant.longitude);
  const pageUrl = restaurantPageUrl(restaurant.id, window.location.origin);
  const names = restaurantDisplayNames(restaurant);
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
    <div className="min-w-52 space-y-2 text-sm text-gray-800">
      <p className="text-base font-semibold text-gray-900">{names.primary}</p>
      {names.secondary.length > 0 && <p className="text-gray-600">{names.secondary.join(' · ')}</p>}
      {restaurant.foodType && <p>{getFoodTypeLabel(restaurant.foodType)}</p>}
      <KashrutBadge kashrut={restaurant.kashrut} hechsherOptions={hechsherOptions} />
      <div className="flex flex-wrap gap-2 pt-1">
        <Link to={`/restaurants/${restaurant.id}`} state={returnState} onClick={handleOpen} className={primaryButtonCompactClassName}>
          {t('card.viewDetails')}
        </Link>
        {telUrl && (
          <a href={telUrl} className={actionClassName}>
            {t('card.call')}
          </a>
        )}
        {wazeUrl && (
          <a href={wazeUrl} target="_blank" rel="noopener noreferrer" className={actionClassName}>
            {t('card.waze')}
          </a>
        )}
        <ShareButton title={names.primary} url={pageUrl} className={actionClassName} />
      </div>
    </div>
  );
}

function RestaurantMap({ filters, hechsherOptions, returnState, onOpenRestaurant }: RestaurantMapProps) {
  const { t } = useTranslation();
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const [items, setItems] = useState<RestaurantCardData[]>([]);
  const [capped, setCapped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCounter, setRetryCounter] = useState(0);

  const boundsKey = bounds ? `${bounds.west},${bounds.south},${bounds.east},${bounds.north}` : '';
  const filtersKey = JSON.stringify(filters);
  const tooWide = bounds !== null && boundsCrossDateLine(bounds);

  useEffect(() => {
    if (!bounds || tooWide) {
      setLoading(false);
      setItems([]);
      return;
    }

    let ignore = false;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError('');

      try {
        const result = await searchRestaurantsInBounds(filters, bounds, controller.signal);

        if (!ignore) {
          setItems(result.items);
          setCapped(result.capped);
        }
      } catch (err) {
        if (ignore || axios.isCancel(err)) {
          return;
        }

        setItems([]);
        setCapped(false);
        setError(getSearchErrorMessage(err, t('map.loadError')));
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }, 400);

    return () => {
      ignore = true;
      window.clearTimeout(timer);
      controller.abort();
    };
    // `bounds` and `filters` match the keys above; the keys are what should retrigger the load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boundsKey, filtersKey, retryCounter, tooWide]);

  const located = filters.location
    ? { center: [filters.location.lat, filters.location.lng] as [number, number], zoom: zoomForRadius(filters.radiusKm) }
    : null;

  const markers = items.filter(
    (restaurant) => typeof restaurant.latitude === 'number' && typeof restaurant.longitude === 'number'
  );

  return (
    <div>
      <div className="relative h-[70vh] min-h-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm sm:h-[72vh] md:h-[68vh] lg:h-[calc(100vh-14rem)]">
        <MapContainer
          {...(located
            ? { center: located.center, zoom: located.zoom }
            : {
                bounds: [
                  [ISRAEL_MAP_BOUNDS.south, ISRAEL_MAP_BOUNDS.west],
                  [ISRAEL_MAP_BOUNDS.north, ISRAEL_MAP_BOUNDS.east],
                ] as L.LatLngBoundsExpression,
              })}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <BoundsReporter onBounds={setBounds} />
          <FollowSearchLocation location={filters.location} radiusKm={filters.radiusKm} />
          {filters.location && filters.radiusKm !== null && (
            <Circle
              center={[filters.location.lat, filters.location.lng]}
              radius={filters.radiusKm * 1000}
              pathOptions={{ color: '#15803d', weight: 1, fillColor: '#15803d', fillOpacity: 0.06 }}
            />
          )}
          <MarkerClusterGroup
            chunkedLoading
            showCoverageOnHover={false}
            iconCreateFunction={(cluster) =>
              L.divIcon({
                html: `<span class="kr-cluster">${cluster.getChildCount()}</span>`,
                className: 'kr-cluster-wrap',
                iconSize: [40, 40],
              })
            }
          >
            {markers.map((restaurant) => (
              <Marker key={restaurant.id} position={[restaurant.latitude as number, restaurant.longitude as number]} icon={markerIcon}>
                <Popup>
                  <MapPopup
                    restaurant={restaurant}
                    hechsherOptions={hechsherOptions}
                    returnState={returnState}
                    onOpenRestaurant={onOpenRestaurant}
                  />
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>

        {loading && (
          <p role="status" className="pointer-events-none absolute start-3 top-3 z-[500] inline-flex items-center gap-2 rounded-lg bg-white/95 px-2.5 py-1.5 text-xs text-gray-700 shadow-sm">
            <span className="kr-spinner" aria-hidden="true" />
            {t('map.loading')}
          </p>
        )}
      </div>

      <div className="mt-2 space-y-2 text-sm text-gray-600">
        {tooWide && (
          <p role="status" className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-amber-950">
            {t('map.zoomIn')}
          </p>
        )}
        {error !== '' && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-800">
            {error}{' '}
            <button type="button" onClick={() => setRetryCounter((current) => current + 1)} className="font-medium underline">
              {t('common.tryAgain')}
            </button>
          </p>
        )}
        {capped && (
          <p role="status" className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-amber-950">
            {t('map.capped')}
          </p>
        )}
        {!loading && !tooWide && error === '' && markers.length === 0 && (
          <p>{t('map.empty')}</p>
        )}
        {filters.location && filters.radiusKm !== null && (
          <p>{t('map.radius')}</p>
        )}
        <p>{t('map.note')}</p>
      </div>
    </div>
  );
}

export default RestaurantMap;
