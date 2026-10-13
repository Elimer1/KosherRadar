// NEW (Map tiles fix): provider configuration without live service requests or real keys.
// חדש (תיקון אריחי מפה): בדיקת הגדרת הספק ללא בקשות חיות או מפתחות אמיתיים.
import { describe, expect, it } from 'vitest';
import { geoapifyTileOptions } from './mapTiles';

describe('Geoapify map tiles', () => {
  it.each([undefined, '', '   '])('does not request tiles with a missing key (%s)', (key) => {
    expect(geoapifyTileOptions(key)).toBeNull();
  });

  it('uses Geoapify XYZ raster tiles and preserves the existing zoom limit', () => {
    const options = geoapifyTileOptions(' test-browser-key ');
    expect(options?.url).toBe('https://maps.geoapify.com/v1/tile/osm-carto/{z}/{x}/{y}.png?apiKey=test-browser-key');
    expect(options?.url).not.toContain('tile.openstreetmap.org');
    expect(options?.maxZoom).toBe(18);
  });

  it('encodes the key as one query parameter, without altering the tile template', () => {
    const options = geoapifyTileOptions('test&other=value#fragment');
    const url = new URL(options!.url.replace('{z}/{x}/{y}', '12/2447/1658'));
    expect([...url.searchParams.keys()]).toEqual(['apiKey']);
    expect(url.searchParams.get('apiKey')).toBe('test&other=value#fragment');
    expect(url.hash).toBe('');
  });

  it('credits Geoapify and OpenStreetMap contributors for the osm-carto style', () => {
    const attribution = geoapifyTileOptions('test-browser-key')!.attribution;
    expect(attribution).toContain('Powered by <a href="https://www.geoapify.com/">Geoapify</a>');
    expect(attribution).toContain('https://www.openstreetmap.org/copyright');
    expect(attribution).toContain('OpenStreetMap contributors');
  });
});
