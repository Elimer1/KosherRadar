// NEW (Milestone 4): tests for the search query string builder.
// חדש (אבן דרך 4): בדיקות לבונה מחרוזת השאילתה של החיפוש.
import { describe, expect, it } from 'vitest';
import { buildSearchParams } from './searchApi';
import { emptySearchFilters } from '../types/search';

describe('buildSearchParams', () => {
  it('sends nothing for the default filters', () => {
    expect(buildSearchParams(emptySearchFilters)).toEqual({});
  });

  it('trims the text and leaves out blank text', () => {
    expect(buildSearchParams({ ...emptySearchFilters, q: '  pizza ' })).toEqual({ q: 'pizza' });
    expect(buildSearchParams({ ...emptySearchFilters, q: '   ' })).toEqual({});
  });

  it('sends lists as comma separated text', () => {
    const params = buildSearchParams({
      ...emptySearchFilters,
      hechsher: ['BADATZ_MACHPUD', 'OTHER'],
      foodType: ['MEAT', 'DAIRY'],
      category: ['CAFE'],
    });

    expect(params).toEqual({ hechsher: 'BADATZ_MACHPUD,OTHER', foodType: 'MEAT,DAIRY', category: 'CAFE' });
  });

  it('sends the switches only when they are on', () => {
    expect(buildSearchParams({ ...emptySearchFilters, hideExpired: true })).toEqual({ hideExpired: 'true' });
    expect(buildSearchParams({ ...emptySearchFilters, includeUnknown: true })).toEqual({ includeUnknown: 'true' });
  });

  it('sends the level only when one is chosen', () => {
    expect(buildSearchParams({ ...emptySearchFilters, level: 'MEHADRIN' })).toEqual({ level: 'MEHADRIN' });
    expect(buildSearchParams({ ...emptySearchFilters, level: '' })).toEqual({});
  });

  it('sends the radius only together with a location', () => {
    const withRadiusOnly = { ...emptySearchFilters, radiusKm: 5 };
    const withBoth = { ...emptySearchFilters, location: { lat: 31.78, lng: 35.21 }, radiusKm: 5 };
    const withLocationOnly = { ...emptySearchFilters, location: { lat: 31.78, lng: 35.21 } };

    expect(buildSearchParams(withRadiusOnly)).toEqual({});
    expect(buildSearchParams(withBoth)).toEqual({ lat: '31.78', lng: '35.21', radiusKm: '5' });
    expect(buildSearchParams(withLocationOnly)).toEqual({ lat: '31.78', lng: '35.21' });
  });

  it('sends the page only after the first one', () => {
    expect(buildSearchParams(emptySearchFilters, 1)).toEqual({});
    expect(buildSearchParams(emptySearchFilters, 3)).toEqual({ page: '3' });
  });

  it('never sends the page size: the server always uses 20', () => {
    expect(Object.keys(buildSearchParams(emptySearchFilters, 2))).not.toContain('limit');
  });
});
