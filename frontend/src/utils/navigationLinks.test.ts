// NEW (Milestone 4): tests for the Call, Waze and Google Maps links.
// חדש (אבן דרך 4): בדיקות לקישורי התקשר, Waze ו-Google Maps.
import { describe, expect, it, vi } from 'vitest';
import { buildGoogleMapsUrl, buildTelUrl, buildWazeUrl, restaurantPageUrl, sharePage } from './navigationLinks';

describe('buildGoogleMapsUrl', () => {
  it('uses the coordinates when the restaurant has them', () => {
    expect(buildGoogleMapsUrl(31.78, 35.21, '1 Main St')).toBe(
      'https://www.google.com/maps/search/?api=1&query=31.78%2C35.21'
    );
  });

  it('searches the address when there are no coordinates, and encodes it', () => {
    expect(buildGoogleMapsUrl(null, null, 'Jaffa 1 & more=1, Tel Aviv')).toBe(
      'https://www.google.com/maps/search/?api=1&query=Jaffa%201%20%26%20more%3D1%2C%20Tel%20Aviv'
    );
  });

  it('has no link when there is nothing to search for', () => {
    expect(buildGoogleMapsUrl(null, null, '   ')).toBeNull();
  });
});

describe('buildTelUrl and buildWazeUrl', () => {
  it('keeps only phone characters', () => {
    expect(buildTelUrl('02-555 1234; evil')).toBe('tel:025551234');
    expect(buildTelUrl('abc')).toBeNull();
    expect(buildTelUrl(null)).toBeNull();
  });

  it('needs both coordinates for Waze', () => {
    expect(buildWazeUrl(31.78, 35.21)).toBe('https://waze.com/ul?ll=31.78,35.21&navigate=yes');
    expect(buildWazeUrl(31.78, null)).toBeNull();
  });
});

describe('sharePage', () => {
  it('uses the share sheet when the browser has one', async () => {
    const share = vi.fn().mockResolvedValue(undefined);

    await expect(sharePage('Pizza', 'https://example.com/restaurants/1', { share })).resolves.toBe('shared');
    expect(share).toHaveBeenCalledWith({ title: 'Pizza', url: 'https://example.com/restaurants/1' });
  });

  it('treats a cancelled share sheet as a cancel, not a copy', async () => {
    const share = vi.fn().mockRejectedValue(new DOMException('aborted', 'AbortError'));
    const writeText = vi.fn();

    await expect(sharePage('Pizza', 'https://example.com/r/1', { share, writeText })).resolves.toBe('cancelled');
    expect(writeText).not.toHaveBeenCalled();
  });

  it('copies the address when there is no share sheet', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    await expect(sharePage('Pizza', 'https://example.com/r/1', { writeText })).resolves.toBe('copied');
    expect(writeText).toHaveBeenCalledWith('https://example.com/r/1');
  });

  it('builds the restaurant page address from the site origin', () => {
    expect(restaurantPageUrl('abc', 'https://example.com')).toBe('https://example.com/restaurants/abc');
  });
});
