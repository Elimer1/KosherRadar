// NEW (Milestone 4): tests for the public search query validation.
// חדש (אבן דרך 4): בדיקות לבדיקת שאילתת החיפוש הציבורית.
import { describe, it, expect } from 'vitest';
import { searchQuerySchema, suggestionsQuerySchema } from '../src/schemas/searchSchemas.js';

describe('searchQuerySchema', () => {
  it('accepts an empty query and fills in the defaults', () => {
    const result = searchQuerySchema.parse({});

    expect(result).toEqual({
      page: 1,
      hechsher: [],
      foodType: [],
      category: [],
      hideExpired: false,
      includeUnknown: false,
    });
  });

  it('reads every filter', () => {
    const result = searchQuerySchema.parse({
      q: '  pizza ',
      level: 'MEHADRIN',
      hechsher: 'BADATZ_BEIT_YOSEF,OTHER',
      foodType: 'MEAT,DAIRY',
      category: 'CAFE',
      hideExpired: 'true',
      includeUnknown: 'true',
      lat: '31.78',
      lng: '35.21',
      radiusKm: '10',
      page: '3',
    });

    expect(result.q).toBe('pizza');
    expect(result.level).toBe('MEHADRIN');
    expect(result.hechsher).toEqual(['BADATZ_BEIT_YOSEF', 'OTHER']);
    expect(result.foodType).toEqual(['MEAT', 'DAIRY']);
    expect(result.category).toEqual(['CAFE']);
    expect(result.hideExpired).toBe(true);
    expect(result.includeUnknown).toBe(true);
    expect(result.lat).toBe(31.78);
    expect(result.radiusKm).toBe(10);
    expect(result.page).toBe(3);
  });

  it('rejects values outside the allowed lists', () => {
    expect(() => searchQuerySchema.parse({ level: 'SUPER' })).toThrow();
    expect(() => searchQuerySchema.parse({ hechsher: 'NOT_A_HECHSHER' })).toThrow();
    expect(() => searchQuerySchema.parse({ foodType: 'MEAT,FISH' })).toThrow();
    expect(() => searchQuerySchema.parse({ category: 'SPACESHIP' })).toThrow();
    expect(() => searchQuerySchema.parse({ hideExpired: 'yes' })).toThrow();
  });

  it('only allows the radius options 1, 5, 10, 25 and 50 km', () => {
    for (const radius of ['1', '5', '10', '25', '50']) {
      expect(searchQuerySchema.parse({ lat: '31', lng: '35', radiusKm: radius }).radiusKm).toBe(Number(radius));
    }

    expect(() => searchQuerySchema.parse({ lat: '31', lng: '35', radiusKm: '7' })).toThrow();
    expect(() => searchQuerySchema.parse({ lat: '31', lng: '35', radiusKm: '1000' })).toThrow();
  });

  it('needs a location for a radius, and both lat and lng together', () => {
    expect(() => searchQuerySchema.parse({ radiusKm: '5' })).toThrow();
    expect(() => searchQuerySchema.parse({ lat: '31' })).toThrow();
    expect(() => searchQuerySchema.parse({ lng: '35' })).toThrow();
  });

  it('rejects impossible or empty coordinates instead of turning them into 0', () => {
    expect(() => searchQuerySchema.parse({ lat: '91', lng: '35' })).toThrow();
    expect(() => searchQuerySchema.parse({ lat: '31', lng: '181' })).toThrow();
    expect(() => searchQuerySchema.parse({ lat: '', lng: '' })).toThrow();
    expect(() => searchQuerySchema.parse({ lat: 'abc', lng: '35' })).toThrow();
  });

  it('rejects objects and repeated keys, which is how NoSQL injection arrives in a query string', () => {
    expect(() => searchQuerySchema.parse({ q: { $ne: 'x' } })).toThrow();
    expect(() => searchQuerySchema.parse({ q: ['a', 'b'] })).toThrow();
    expect(() => searchQuerySchema.parse({ level: { $gt: '' } })).toThrow();
    expect(() => searchQuerySchema.parse({ page: ['1', '2'] })).toThrow();
  });

  it('rejects a bad page number', () => {
    expect(() => searchQuerySchema.parse({ page: '0' })).toThrow();
    expect(() => searchQuerySchema.parse({ page: '-1' })).toThrow();
    expect(() => searchQuerySchema.parse({ page: '1.5' })).toThrow();
    expect(() => searchQuerySchema.parse({ page: '' })).toThrow();
    expect(() => searchQuerySchema.parse({ page: '100000' })).toThrow();
  });

  it('limits the length of the search text', () => {
    expect(() => searchQuerySchema.parse({ q: 'a'.repeat(101) })).toThrow();
  });

  it('does not accept a page size: it is always 20', () => {
    const result = searchQuerySchema.parse({ limit: '1000' });

    expect(result).not.toHaveProperty('limit');
  });
});

describe('suggestionsQuerySchema', () => {
  it('needs at least 2 characters (spec section 8)', () => {
    expect(() => suggestionsQuerySchema.parse({})).toThrow();
    expect(() => suggestionsQuerySchema.parse({ q: 'a' })).toThrow();
    expect(() => suggestionsQuerySchema.parse({ q: ' a ' })).toThrow();
    expect(suggestionsQuerySchema.parse({ q: 'pi' }).q).toBe('pi');
  });

  it('accepts the same filters as the search', () => {
    const result = suggestionsQuerySchema.parse({ q: 'pizza', includeUnknown: 'true', foodType: 'DAIRY' });

    expect(result.includeUnknown).toBe(true);
    expect(result.foodType).toEqual(['DAIRY']);
  });
});
