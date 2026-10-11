// NEW (Milestone 3): tests for the admin request schemas (reason required, safe query strings, admin fields).
// חדש (אבן דרך 3): בדיקות לסכמות הבקשה של המנהל (סיבה חובה, מחרוזות שאילתה בטוחות, שדות מנהל).
import { describe, it, expect } from 'vitest';
import {
  adminCreateRestaurantSchema,
  adminEditRestaurantSchema,
  adminTeudaFieldsSchema,
  manageRestaurantsQuerySchema,
  pageQuerySchema,
  rejectBodySchema,
  resolveReportSchema,
} from '../src/schemas/adminSchemas.js';
import { validateQuery } from '../src/middleware/validateQuery.js';

const restaurant = (overrides = {}) => ({
  name: 'Pizza Hut',
  address: '1 Main St',
  foodType: 'DAIRY',
  categories: ['RESTAURANT'],
  ...overrides,
});

const teuda = (overrides = {}) => ({
  hechsher: 'BADATZ_MACHPUD',
  kashrutLevel: 'MEHADRIN',
  expirationDate: '2025-01-01',
  mashgiachName: 'Dan',
  mashgiachPhone: '050-1234567',
  ...overrides,
});

describe('rejectBodySchema', () => {
  it('requires a reason', () => {
    expect(() => rejectBodySchema.parse({})).toThrow();
    expect(() => rejectBodySchema.parse({ reason: '' })).toThrow();
    expect(() => rejectBodySchema.parse({ reason: '   ' })).toThrow(/reason/i);
    expect(() => rejectBodySchema.parse({ reason: 'ab' })).toThrow();
  });

  it('accepts and trims a real reason, and refuses an object instead of text', () => {
    expect(rejectBodySchema.parse({ reason: '  Photo is blurry  ' }).reason).toBe('Photo is blurry');
    expect(() => rejectBodySchema.parse({ reason: { $ne: '' } })).toThrow();
  });
});

describe('resolveReportSchema', () => {
  it('accepts only the three known outcomes', () => {
    for (const resolution of ['APPLY_PROPOSED', 'CORRECTION_ALREADY_MADE', 'NO_CORRECTION']) {
      expect(resolveReportSchema.parse({ resolution }).resolution).toBe(resolution);
    }

    expect(() => resolveReportSchema.parse({ resolution: 'RESOLVED' })).toThrow();
    expect(() => resolveReportSchema.parse({})).toThrow();
  });

  it('ignores a client-sent correctionApplied flag', () => {
    const result = resolveReportSchema.parse({ resolution: 'NO_CORRECTION', correctionApplied: true });

    expect(result.correctionApplied).toBeUndefined();
  });
});

describe('admin restaurant schemas', () => {
  it('accepts admin-only extras and an https Kosharot link', () => {
    const result = adminEditRestaurantSchema.parse({
      restaurant: restaurant(),
      extras: { adminNote: 'Checked', kosharotUrl: 'https://example.com/restaurant/12', nameHe: 'פיצה האט' },
    });

    expect(result.extras.adminNote).toBe('Checked');
    expect(result.extras.kosharotUrl).toBe('https://example.com/restaurant/12');
    expect(result.extras.nameHe).toBe('פיצה האט');
  });

  it('rejects an unsafe Kosharot link', () => {
    expect(() =>
      adminEditRestaurantSchema.parse({ restaurant: restaurant(), extras: { kosharotUrl: 'javascript:alert(1)' } })
    ).toThrow();
  });

  it('treats empty extras as "clear this value"', () => {
    const result = adminEditRestaurantSchema.parse({
      restaurant: restaurant(),
      extras: { adminNote: '', kosharotUrl: '' },
    });

    expect(result.extras.adminNote).toBeUndefined();
    expect(result.extras.kosharotUrl).toBeUndefined();
  });

  it('works without extras and with an optional certificate on creation', () => {
    const result = adminCreateRestaurantSchema.parse({ restaurant: restaurant(), teuda: teuda() });

    expect(result.extras).toEqual({});
    expect(result.teuda.kashrutLevel).toBe('MEHADRIN');
  });

  it('does not let the client choose the status or owner', () => {
    const result = adminCreateRestaurantSchema.parse({
      restaurant: restaurant({ status: 'REJECTED', submittedBy: 'someone' }),
    });

    expect(result.restaurant.status).toBeUndefined();
    expect(result.restaurant.submittedBy).toBeUndefined();
  });
});

describe('adminTeudaFieldsSchema', () => {
  it('accepts a past expiration date (the service only rejects typing mistakes)', () => {
    expect(adminTeudaFieldsSchema.parse(teuda()).expirationDate).toBe('2025-01-01');
  });

  it('still needs a valid date, and the custom text for OTHER', () => {
    expect(() => adminTeudaFieldsSchema.parse(teuda({ expirationDate: '2025-02-31' }))).toThrow();
    expect(() => adminTeudaFieldsSchema.parse(teuda({ hechsher: 'OTHER' }))).toThrow(/name of the hechsher/);
  });

  it('does not let the client set the status', () => {
    expect(adminTeudaFieldsSchema.parse(teuda({ status: 'REJECTED' })).status).toBeUndefined();
  });
});

describe('query schemas', () => {
  it('converts page and limit from text and applies defaults and limits', () => {
    expect(pageQuerySchema.parse({})).toEqual({ page: 1, limit: 20 });
    expect(pageQuerySchema.parse({ page: '3', limit: '10' })).toEqual({ page: 3, limit: 10 });
    expect(() => pageQuerySchema.parse({ page: '0' })).toThrow();
    expect(() => pageQuerySchema.parse({ limit: '500' })).toThrow();
    expect(() => pageQuerySchema.parse({ page: 'abc' })).toThrow();
  });

  it('refuses objects and arrays in the search text (NoSQL injection)', () => {
    expect(() => manageRestaurantsQuerySchema.parse({ search: { $ne: 'x' } })).toThrow();
    expect(() => manageRestaurantsQuerySchema.parse({ search: ['a', 'b'] })).toThrow();
    expect(() => manageRestaurantsQuerySchema.parse({ status: { $ne: 'APPROVED' } })).toThrow();
    expect(() => manageRestaurantsQuerySchema.parse({ status: 'DELETED' })).toThrow();
  });

  it('accepts a normal search with a status', () => {
    expect(manageRestaurantsQuerySchema.parse({ search: ' pizza ', status: 'APPROVED' })).toMatchObject({
      search: 'pizza',
      status: 'APPROVED',
    });
  });

  it('validateQuery stores clean values in req.validatedQuery and leaves req.query alone', () => {
    const req = { query: { page: '2' } };
    const next = () => {};

    validateQuery(pageQuerySchema)(req, {}, next);

    expect(req.validatedQuery).toEqual({ page: 2, limit: 20 });
    expect(req.query).toEqual({ page: '2' });
  });
});
