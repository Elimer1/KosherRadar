// NEW (ADMINCERT-001): validate the shared certificate custom-name contract in every request schema.
// חדש (ADMINCERT-001): בדיקת שם הכשר מותאם בכל סכמות בקשת התעודה.
import { describe, expect, it } from 'vitest';
import { adminCreateTeudaSchema, adminEditTeudaSchema, adminCreateRestaurantSchema } from '../src/schemas/adminSchemas.js';
import { submitTeudaSchema } from '../src/schemas/teudaSchemas.js';
import { submitRestaurantSchema } from '../src/schemas/restaurantSchemas.js';
import { HECHSHER_VALUES } from '../src/config/constants.js';

const teuda = {
  hechsher: 'LOCAL_RABBANUT', kashrutLevel: 'RABBANUT', expirationDate: '2027-01-01',
  mashgiachName: 'Dan', mashgiachPhone: '050-1234567',
};
const restaurant = { name: 'Cafe', address: '1 Main St', city: 'Jerusalem', claimedHechsher: 'LOCAL_RABBANUT', foodType: 'DAIRY', categories: ['CAFE'] };

describe.each([
  ['admin add', adminCreateTeudaSchema], ['admin edit', adminEditTeudaSchema],
  ['admin initial certificate', adminCreateRestaurantSchema], ['user add', submitTeudaSchema],
  ['user initial certificate', submitRestaurantSchema],
])('%s certificate custom name contract', (_name, schema) => {
  const parse = (overrides) => schema.parse({ restaurant, teuda: { ...teuda, ...overrides } }).teuda;

  it.each(HECHSHER_VALUES.filter((value) => value !== 'OTHER'))('accepts %s with an omitted, empty or whitespace custom name', (hechsher) => {
    for (const hechsherOther of [undefined, '', '   ']) {
      expect(parse({ hechsher, hechsherOther }).hechsherOther).toBeUndefined();
    }
    expect(parse({ hechsher, hechsherOther: 'Old custom name' }).hechsherOther).toBeUndefined();
  });

  it('trims and retains a custom name only for OTHER', () => {
    expect(parse({ hechsher: 'OTHER', hechsherOther: '  Rabbi Levi  ' }).hechsherOther).toBe('Rabbi Levi');
  });

  it.each([undefined, '', '   '])('requires a name for OTHER (%j)', (hechsherOther) => {
    expect(() => parse({ hechsher: 'OTHER', hechsherOther })).toThrow(/Enter the name of the hechsher/);
  });

  it.each([null, 42, {}, [], 'x'.repeat(101)])('rejects malformed custom names (%j), even for standard selections', (hechsherOther) => {
    for (const hechsher of ['LOCAL_RABBANUT', 'OTHER']) {
      expect(() => parse({ hechsher, hechsherOther })).toThrow();
    }
  });
});
