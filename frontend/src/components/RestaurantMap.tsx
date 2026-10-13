// NEW (Milestone 5): the map view. It loads APPROVED restaurants inside the visible rectangle, using the
// same filters as the list. Moving the map does not change the chosen search location.
// חדש (אבן דרך 5): תצוגת המפה. טוענת מסעדות מאושרות בתוך המלבן הנראה, עם אותם מסננים כמו הרשימה.
// הזזת המפה לא משנה את מיקום החיפוש שנבחר.
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import L from 'leaflet';
import { Circle, MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
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
import { ISRAEL_MAP_BOUNDS, boundsCrossDateLine, zoomForRadius } from '../utils/mapView';
import { restaurantDisplayNames } from '../utils/restaurantName';
import { OSM_ATTRIBUTION, OSM_TILE_URL } from './map/mapChrome';
import { clusterIcon, markerIcon, selectedMarkerIcon } from './map/mapIcons';
import { MapFootnotes, MapOverlayNotices } from './map/MapNotices';
import MapPopupCard from './map/MapPopupCard';
import './map/map.css';

interface RestaurantMapProps {
  filters: SearchFilters;
  hechsherOptions: HechsherOption[];
  returnState?: SearchReturnState;
  onOpenRestaurant?: (restaurantId: string, background: boolean) => void;
}

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

function SelectionClear({ onClear }: { onClear: () => void }) {
  const onClearRef = useRef(onClear);

  useEffect(() => {
    onClearRef.current = onClear;
  }, [onClear]);

  useMapEvents({
    click() {
      onClearRef.current();
    },
  });

  return null;
}

function RestaurantMap({ filters, hechsherOptions, returnState, onOpenRestaurant }: RestaurantMapProps) {
  const { t } = useTranslation();
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const [items, setItems] = useState<RestaurantCardData[]>([]);
  const [capped, setCapped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCounter, setRetryCounter] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const markerClick = useRef(false);

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
  const selected = markers.find((restaurant) => restaurant.id === selectedId) ?? null;

  useEffect(() => {
    if (selectedId && !markers.some((restaurant) => restaurant.id === selectedId)) {
      setSelectedId(null);
    }
  }, [markers, selectedId]);

  useEffect(() => {
    if (selectedId) {
      panelRef.current?.focus();
    }
  }, [selectedId]);

  return (
    <div className="kr-v2-map-shell">
      <div className={`kr-v2-map-frame${selected ? ' kr-v2-map-has-panel' : ''}`}>
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
          className="kr-v2-map-canvas"
        >
          <TileLayer
            attribution={OSM_ATTRIBUTION}
            url={OSM_TILE_URL}
          />
          <BoundsReporter onBounds={setBounds} />
          <SelectionClear
            onClear={() => {
              if (markerClick.current) {
                return;
              }

              setSelectedId(null);
            }}
          />
          <FollowSearchLocation location={filters.location} radiusKm={filters.radiusKm} />
          {filters.location && filters.radiusKm !== null && (
            <Circle
              center={[filters.location.lat, filters.location.lng]}
              radius={filters.radiusKm * 1000}
              pathOptions={{ color: '#176348', weight: 1.5, fillColor: '#176348', fillOpacity: 0.05 }}
            />
          )}
          <MarkerClusterGroup
            chunkedLoading
            showCoverageOnHover={false}
            iconCreateFunction={(cluster) => clusterIcon(cluster.getChildCount())}
          >
            {markers.map((restaurant) => (
              <Marker
                key={restaurant.id}
                position={[restaurant.latitude as number, restaurant.longitude as number]}
                icon={restaurant.id === selectedId ? selectedMarkerIcon : markerIcon}
                eventHandlers={{
                  click: () => {
                    markerClick.current = true;
                    setSelectedId(restaurant.id);
                    window.setTimeout(() => {
                      markerClick.current = false;
                    }, 0);
                  },
                }}
                title={restaurantDisplayNames(restaurant).primary}
              />
            ))}
          </MarkerClusterGroup>
        </MapContainer>

        {loading && (
          <div className="kr-v2-map-progress" role="status">
            <span className="kr-v2-map-sr">{t('map.loading')}</span>
          </div>
        )}
        {selected && (
          <div
            ref={panelRef}
            className="kr-v2-map-panel"
            role="dialog"
            tabIndex={-1}
            aria-label={restaurantDisplayNames(selected).primary}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setSelectedId(null);
              }
            }}
          >
            <MapPopupCard
              restaurant={selected}
              hechsherOptions={hechsherOptions}
              returnState={returnState}
              onOpenRestaurant={onOpenRestaurant}
              onClose={() => setSelectedId(null)}
            />
          </div>
        )}
        <MapOverlayNotices
          tooWide={tooWide}
          error={error}
          capped={capped}
          showEmpty={!loading && !tooWide && error === '' && markers.length === 0}
          onRetry={() => setRetryCounter((current) => current + 1)}
        />
      </div>
      <MapFootnotes showRadius={Boolean(filters.location && filters.radiusKm !== null)} />
    </div>
  );
}

export default RestaurantMap;
