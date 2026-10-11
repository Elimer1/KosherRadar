// NEW (Milestone 4): tests for the public kashrut texts, links and result merging.
// חדש (אבן דרך 4): בדיקות לטקסטי הכשרות הציבוריים, לקישורים ולמיזוג התוצאות.
import { describe, expect, it } from 'vitest';
import {
  describeEvidenceName,
  describeKashrutShort,
  describeValidity,
  formatDateOnly,
  formatDistance,
  formatMoreCount,
  getStatusHeadline,
} from './kashrutText';
import { buildTelUrl, buildWazeUrl } from './navigationLinks';
import { appendNewRestaurants, toggleValue } from './searchResults';
import type { KashrutPrimary, RestaurantCardData } from '../types/search';
import type { HechsherOption } from '../types/submissions';

const options: HechsherOption[] = [
  { value: 'LOCAL_RABBANUT', labelEn: 'Local Rabbinate', labelHe: 'הרבנות המקומית' },
];

const primary = (overrides: Partial<KashrutPrimary> = {}): KashrutPrimary => ({
  kind: 'VERIFIED',
  hechsher: 'LOCAL_RABBANUT',
  hechsherOther: null,
  kashrutLevel: 'MEHADRIN',
  expirationDate: '2026-10-11',
  ...overrides,
});

describe('getStatusHeadline', () => {
  it('spells out the difference between verified, unverified, expired and unknown', () => {
    expect(getStatusHeadline('VERIFIED')).toMatch(/verified/i);
    expect(getStatusHeadline('UNVERIFIED')).toMatch(/unverified claim/i);
    expect(getStatusHeadline('UNVERIFIED')).toMatch(/no certificate/i);
    expect(getStatusHeadline('EXPIRED')).toContain('EXPIRED');
    expect(getStatusHeadline('UNKNOWN')).toMatch(/unknown/i);
  });

  it('does not say a claim is a certificate', () => {
    expect(getStatusHeadline('UNVERIFIED')).not.toBe(getStatusHeadline('VERIFIED'));
  });
});

describe('describeEvidenceName', () => {
  it('joins the hechsher and the level, never showing raw values', () => {
    const text = describeEvidenceName(primary(), options);

    expect(text).toBe('Local Rabbinate, Mehadrin');
    expect(text).not.toContain('MEHADRIN');
    expect(text).not.toContain('LOCAL_RABBANUT');
  });

  it('shows the free text of an "Other" hechsher', () => {
    expect(describeEvidenceName(primary({ hechsher: 'OTHER', hechsherOther: 'Rabbi Cohen' }), options)).toBe(
      'Rabbi Cohen, Mehadrin'
    );
  });

  it('handles a claim with only a level, only a hechsher, or neither', () => {
    expect(describeEvidenceName(primary({ hechsher: null }), options)).toBe('Mehadrin');
    expect(describeEvidenceName(primary({ kashrutLevel: null }), options)).toBe('Local Rabbinate');
    expect(describeEvidenceName(primary({ hechsher: null, kashrutLevel: null }), options)).toBe('No hechsher named');
  });
});

describe('describeKashrutShort', () => {
  it('writes the status and the primary evidence, with "+N more"', () => {
    const kashrut = { status: 'VERIFIED' as const, primary: primary(), moreCount: 1, hasRecentExpired: false };

    expect(describeKashrutShort(kashrut, options)).toBe('Verified certificate: Local Rabbinate, Mehadrin (+1 more)');
  });

  it('writes only the headline when nothing is known', () => {
    const kashrut = { status: 'UNKNOWN' as const, primary: null, moreCount: 0, hasRecentExpired: false };

    expect(describeKashrutShort(kashrut, options)).toBe('Kashrut status unknown');
  });
});

describe('formatDateOnly', () => {
  it('formats a calendar date without using the time zone', () => {
    expect(formatDateOnly('2026-10-11')).toBe('11 Oct 2026');
    expect(formatDateOnly('2027-01-01')).toBe('1 Jan 2027');
    expect(formatDateOnly('2026-12-31')).toBe('31 Dec 2026');
  });

  it('returns unexpected text unchanged', () => {
    expect(formatDateOnly('soon')).toBe('soon');
    expect(formatDateOnly('2026-13-01')).toBe('2026-13-01');
  });
});

describe('describeValidity', () => {
  it('says "Valid until" for a certificate and "Expired on" for an expired one', () => {
    expect(describeValidity(primary())).toBe('Valid until 11 Oct 2026');
    expect(describeValidity(primary({ kind: 'EXPIRED' }))).toBe('Expired on 11 Oct 2026');
  });

  it('says nothing for a claim, which has no date', () => {
    expect(describeValidity(primary({ kind: 'UNVERIFIED', expirationDate: null }))).toBe('');
  });
});

describe('formatMoreCount and formatDistance', () => {
  it('shows "+N more" only when there is more', () => {
    expect(formatMoreCount(0)).toBe('');
    expect(formatMoreCount(2)).toBe('+2 more');
  });

  it('shows a distance only when there is one', () => {
    expect(formatDistance(null)).toBe('');
    expect(formatDistance(2.4)).toBe('2.4 km away');
  });
});

describe('buildTelUrl', () => {
  it('keeps only digits and +', () => {
    expect(buildTelUrl('02-555 1234')).toBe('tel:025551234');
    expect(buildTelUrl('+972 (0)50-123-4567')).toBe('tel:+9720501234567');
  });

  it('cannot carry anything else into the link', () => {
    expect(buildTelUrl('050"><script>alert(1)</script>')).toBe('tel:0501');
  });

  it('is null without a usable phone', () => {
    expect(buildTelUrl(null)).toBeNull();
    expect(buildTelUrl('')).toBeNull();
    expect(buildTelUrl('call me')).toBeNull();
  });
});

describe('buildWazeUrl', () => {
  it('uses the coordinates', () => {
    expect(buildWazeUrl(31.78, 35.21)).toBe('https://waze.com/ul?ll=31.78,35.21&navigate=yes');
  });

  it('is null without both coordinates (and works for 0)', () => {
    expect(buildWazeUrl(null, null)).toBeNull();
    expect(buildWazeUrl(31.78, null)).toBeNull();
    expect(buildWazeUrl(0, 0)).toBe('https://waze.com/ul?ll=0,0&navigate=yes');
  });
});

describe('toggleValue', () => {
  it('adds a missing value and removes an existing one without changing the original list', () => {
    const original = ['MEAT'];

    expect(toggleValue(original, 'DAIRY')).toEqual(['MEAT', 'DAIRY']);
    expect(toggleValue(original, 'MEAT')).toEqual([]);
    expect(original).toEqual(['MEAT']);
  });
});

describe('appendNewRestaurants', () => {
  const card = (id: string) => ({ id, name: id }) as RestaurantCardData;

  it('adds a new page after the current results', () => {
    expect(appendNewRestaurants([card('a'), card('b')], [card('c')]).map((item) => item.id)).toEqual(['a', 'b', 'c']);
  });

  it('never shows the same restaurant twice', () => {
    expect(appendNewRestaurants([card('a'), card('b')], [card('b'), card('c')]).map((item) => item.id)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });
});
