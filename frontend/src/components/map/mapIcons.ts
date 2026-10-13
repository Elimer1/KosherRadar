// Leaflet icons for the public map. One pin design for every restaurant.
// סמלי Leaflet למפה הציבורית. עיצוב סיכה אחד לכל מסעדה.
import L from 'leaflet';
import { clusterBubbleHtml, clusterMetrics, markerIconMetrics, markerPinHtml } from './mapChrome';

const pinIcon = (selected: boolean) =>
  L.divIcon({
    className: selected ? 'kr-map-pin-wrap kr-map-pin-selected' : markerIconMetrics.className,
    html: markerPinHtml(selected),
    iconSize: markerIconMetrics.iconSize,
    iconAnchor: markerIconMetrics.iconAnchor,
    popupAnchor: markerIconMetrics.popupAnchor,
  });

export const markerIcon = pinIcon(false);
export const selectedMarkerIcon = pinIcon(true);

export const clusterIcon = (count: number) => {
  const metrics = clusterMetrics(count);

  return L.divIcon({
    className: metrics.className,
    html: clusterBubbleHtml(count),
    iconSize: [metrics.size, metrics.size],
    iconAnchor: [metrics.anchor, metrics.anchor],
  });
};
