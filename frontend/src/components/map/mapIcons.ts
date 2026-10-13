// Leaflet icons for the public map. One circle for every restaurant.
import L from 'leaflet';
import { clusterBubbleHtml, clusterMetrics, markerGlyphHtml, markerIconMetrics } from './mapChrome';

const placeIcon = (selected: boolean) =>
  L.divIcon({
    className: markerIconMetrics.className,
    html: markerGlyphHtml(selected),
    iconSize: markerIconMetrics.iconSize,
    iconAnchor: markerIconMetrics.iconAnchor,
  });

export const markerIcon = placeIcon(false);
export const selectedMarkerIcon = placeIcon(true);

export const clusterIcon = (count: number) => {
  const metrics = clusterMetrics(count);

  return L.divIcon({
    className: metrics.className,
    html: clusterBubbleHtml(count),
    iconSize: [metrics.size, metrics.size],
    iconAnchor: [metrics.anchor, metrics.anchor],
  });
};
