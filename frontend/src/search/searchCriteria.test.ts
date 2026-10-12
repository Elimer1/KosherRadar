import { describe, expect, it } from 'vitest';
import {
  canonicalSearchPath,
  clearAppliedFilters,
  clearAppliedSearch,
  commitCriteriaPatch,
  commitDraftText,
  draftAfterAppliedChange,
  emptyAppliedSearch,
  parseSearchQuery,
  serializeSearchQuery,
} from './searchCriteria';

const meatAndDairy = () => ({
  ...emptyAppliedSearch(),
  q: 'pizza',
  foodType: ['MEAT', 'DAIRY'],
  level: 'MEHADRIN',
  hechsher: ['BADATZ_MACHPUD', 'OTHER'],
  category: ['CAFE'],
  hideExpired: true,
  includeUnknown: true,
  near: 'ירושלים',
  radiusKm: 5,
});

describe('search criteria URL contract', () => {
  it('omits defaults and produces a stable parameter order', () => {
    expect(serializeSearchQuery(emptyAppliedSearch())).toBe('');
    expect(canonicalSearchPath(emptyAppliedSearch())).toBe('/');

    const serialized = serializeSearchQuery(meatAndDairy());

    expect(serialized).toBe(
      'q=pizza&foodType=MEAT&foodType=DAIRY&level=MEHADRIN&hechsher=BADATZ_MACHPUD&hechsher=OTHER&category=CAFE&hideExpired=true&includeUnknown=true&near=%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D&radius=5'
    );
    expect(parseSearchQuery(serialized)).toEqual(meatAndDairy());
  });

  it('round-trips Hebrew, mixed text, and trims committed whitespace', () => {
    const hebrew = parseSearchQuery('?q=%D7%A4%D7%99%D7%A6%D7%94');
    expect(hebrew.q).toBe('פיצה');
    expect(serializeSearchQuery(hebrew)).toBe('q=%D7%A4%D7%99%D7%A6%D7%94');

    const mixed = parseSearchQuery(`?q=${encodeURIComponent('pizza פיצה')}`);
    expect(mixed.q).toBe('pizza פיצה');
    expect(parseSearchQuery(serializeSearchQuery(mixed)).q).toBe('pizza פיצה');

    expect(serializeSearchQuery({ ...emptyAppliedSearch(), q: '  פיצה  ' })).toBe('q=%D7%A4%D7%99%D7%A6%D7%94');
    expect(serializeSearchQuery({ ...emptyAppliedSearch(), q: '   ' })).toBe('');
  });

  it('caps a long query at 100 characters', () => {
    const long = `פ${'a'.repeat(120)}`;
    const parsed = parseSearchQuery(`?q=${encodeURIComponent(long)}`);

    expect(parsed.q).toHaveLength(100);
    expect(parsed.q.startsWith('פ')).toBe(true);
  });

  it('accepts comma lists and repeated values, then emits one sorted copy of each', () => {
    const parsed = parseSearchQuery('?foodType=DAIRY,MEAT&foodType=MEAT&foodType=FISH&hechsher=OTHER&hechsher=OTHER');

    expect(parsed.foodType).toEqual(['MEAT', 'DAIRY']);
    expect(parsed.hechsher).toEqual(['OTHER']);
    expect(serializeSearchQuery(parsed)).toBe('foodType=MEAT&foodType=DAIRY&hechsher=OTHER');
  });

  it('ignores unknown, duplicate single-value, and malformed parameters', () => {
    const parsed = parseSearchQuery(
      '?level=NOPE&level=MEHADRIN&hideExpired=yes&hideExpired=true&radius=7&radius=10&lat=31.7&lng=35.2&page=3&view=map&q=%'
    );

    expect(parsed.level).toBe('MEHADRIN');
    expect(parsed.hideExpired).toBe(true);
    expect(parsed.radiusKm).toBe(null);
    expect(parsed.near).toBe('');
    expect(serializeSearchQuery(parsed)).not.toMatch(/lat|lng|page|view/);
    expect(canonicalSearchPath(parsed).includes('31.7')).toBe(false);
  });

  it('drops a radius that has no named place', () => {
    expect(parseSearchQuery('?radius=5').radiusKm).toBe(null);
    expect(serializeSearchQuery({ ...emptyAppliedSearch(), radiusKm: 5, near: '   ' })).toBe('');
    expect(parseSearchQuery('?near=%20%20%20&radius=5')).toEqual(emptyAppliedSearch());
  });

  it('keeps a named place and its radius without coordinates', () => {
    const parsed = parseSearchQuery(`?near=${encodeURIComponent('  Jerusalem  ')}&radius=25&lat=31.78&lng=35.21`);

    expect(parsed.near).toBe('Jerusalem');
    expect(parsed.radiusKm).toBe(25);
    expect(serializeSearchQuery(parsed)).toBe('near=Jerusalem&radius=25');
  });

  it('commits draft text with the filter in one transition', () => {
    const current = { ...emptyAppliedSearch(), foodType: ['DAIRY'] };
    const next = commitCriteriaPatch(current, '  pizza  ', { foodType: ['MEAT'] });

    expect(next.changed).toBe(true);
    expect(next.history).toBe('push');
    expect(next.criteria.q).toBe('pizza');
    expect(next.criteria.foodType).toEqual(['MEAT']);
    expect(canonicalSearchPath(next.criteria)).toBe('/?q=pizza&foodType=MEAT');
  });

  it('does not create a text history change when the committed query already matches', () => {
    const current = { ...emptyAppliedSearch(), q: 'pizza' };
    const next = commitDraftText(current, '  pizza  ');

    expect(next.changed).toBe(false);
    expect(next.history).toBe('replace');
    expect(next.criteria.q).toBe('pizza');
  });

  it('keeps an in-progress draft when the applied query did not change', () => {
    expect(draftAfterAppliedChange('pizz', 'pizza', 'pizza')).toBe('pizz');
    expect(draftAfterAppliedChange('  pizza ', 'pie', 'pizza')).toBe('  pizza ');
    expect(draftAfterAppliedChange('pizza', 'pizza', '')).toBe('');
    expect(draftAfterAppliedChange('burger', 'pizza', 'פיצה')).toBe('פיצה');
  });

  it('clears filters without dropping uncommitted text, and clear-all removes both', () => {
    const current = meatAndDairy();
    const filtersCleared = clearAppliedFilters(current, '  falafel  ');
    const allCleared = clearAppliedSearch(current);

    expect(filtersCleared.criteria).toEqual({ ...emptyAppliedSearch(), q: 'falafel' });
    expect(filtersCleared.history).toBe('push');
    expect(allCleared.criteria).toEqual(emptyAppliedSearch());
    expect(allCleared.changed).toBe(true);
  });
});
