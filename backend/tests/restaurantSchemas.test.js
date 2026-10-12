import { describe, it, expect } from 'vitest';
import { submitRestaurantSchema } from '../src/schemas/restaurantSchemas.js';

const validRestaurant = () => ({
  name: 'Pizza Hut',
  address: '1 Main St, Jerusalem',
  city: 'Jerusalem',
  foodType: 'DAIRY',
  categories: ['RESTAURANT'],
  claimedHechsher: 'LOCAL_RABBANUT',
});

const parse = (restaurant, teuda) => submitRestaurantSchema.parse({ restaurant, teuda });

describe('submitRestaurantSchema', () => {
  it('accepts the minimum required fields', () => {
    const result = parse(validRestaurant());
    expect(result.restaurant.name).toBe('Pizza Hut');
    expect(result.restaurant.foodKeywords).toEqual([]);
    expect(result.teuda).toBeUndefined();
  });

  it('requires a city, allows a blank food type and categories, and still requires a hechsher', () => {
    expect(() =>
      parse({
        ...validRestaurant(),
        city: '',
      })
    ).toThrow(/Enter the city/);

    const result = parse({
      ...validRestaurant(),
      foodType: '',
      categories: [],
      latitude: '',
      longitude: '',
      phone: '',
      website: '',
      claimedKashrutLevel: '',
    });

    expect(result.restaurant.city).toBe('Jerusalem');
    expect(result.restaurant.foodType).toBeUndefined();
    expect(result.restaurant.categories).toEqual([]);
    expect(result.restaurant.claimedHechsher).toBe('LOCAL_RABBANUT');
    expect(result.restaurant.latitude).toBeUndefined();
    expect(result.restaurant.phone).toBeUndefined();
    expect(result.restaurant.website).toBeUndefined();
    expect(() => parse({ ...validRestaurant(), claimedHechsher: '' })).toThrow(/Choose a hechsher/);
  });

  it('requires a name and an address, and rejects an unknown food type or category', () => {
    expect(() => parse({ ...validRestaurant(), name: '  ' })).toThrow();
    expect(() => parse({ ...validRestaurant(), address: '' })).toThrow();
    expect(() => parse({ ...validRestaurant(), foodType: 'FISH' })).toThrow();
    expect(() => parse({ ...validRestaurant(), categories: ['SPACESHIP'] })).toThrow();
  });

  it('removes duplicate categories', () => {
    const result = parse({ ...validRestaurant(), categories: ['CAFE', 'CAFE', 'BAKERY'] });
    expect(result.restaurant.categories).toEqual(['CAFE', 'BAKERY']);
  });

  it('needs both coordinates or neither, and only inside Israel', () => {
    expect(parse({ ...validRestaurant(), latitude: 31.78, longitude: 35.22 }).restaurant.latitude).toBe(31.78);
    expect(() => parse({ ...validRestaurant(), latitude: 31.78 })).toThrow(/both latitude and longitude/);
    expect(() => parse({ ...validRestaurant(), latitude: 48.85, longitude: 2.35 })).toThrow(/outside Israel/);
    expect(() => parse({ ...validRestaurant(), latitude: 'north', longitude: 35 })).toThrow();
  });

  it('accepts only http and https website links', () => {
    expect(parse({ ...validRestaurant(), website: 'https://example.com' }).restaurant.website).toBe(
      'https://example.com'
    );
    expect(() => parse({ ...validRestaurant(), website: 'javascript:alert(1)' })).toThrow();
  });

  it('requires custom text for an OTHER claimed hechsher and drops it otherwise', () => {
    expect(() => parse({ ...validRestaurant(), claimedHechsher: 'OTHER' })).toThrow(
      /Enter the name of the hechsher/
    );

    const other = parse({
      ...validRestaurant(),
      claimedHechsher: 'OTHER',
      claimedHechsherOther: 'Rabbi Levi',
    });
    expect(other.restaurant.claimedHechsherOther).toBe('Rabbi Levi');

    const standard = parse({
      ...validRestaurant(),
      claimedHechsher: 'BADATZ_MACHPUD',
      claimedHechsherOther: 'ignored',
    });
    expect(standard.restaurant.claimedHechsherOther).toBeUndefined();
  });

  it('limits food keywords', () => {
    expect(() =>
      parse({ ...validRestaurant(), foodKeywords: Array.from({ length: 11 }, (_, i) => `word${i}`) })
    ).toThrow();
    expect(() => parse({ ...validRestaurant(), foodKeywords: [''] })).toThrow();
  });

  it('ignores fields the client must not control', () => {
    const result = parse({
      ...validRestaurant(),
      status: 'APPROVED',
      submittedBy: 'someone-else',
      adminNote: 'trust me',
      kosharotUrl: 'https://kosharot.example',
      possibleDuplicates: [],
    });

    expect(result.restaurant.status).toBeUndefined();
    expect(result.restaurant.submittedBy).toBeUndefined();
    expect(result.restaurant.adminNote).toBeUndefined();
    expect(result.restaurant.kosharotUrl).toBeUndefined();
    expect(result.restaurant.possibleDuplicates).toBeUndefined();
  });

  it('accepts partial certificate evidence and drops a user-supplied kashrut level', () => {
    const teuda = {
      hechsher: 'BADATZ_BEIT_YOSEF',
      kashrutLevel: 'MEHADRIN',
      expirationDate: '',
      mashgiachName: '',
      mashgiachPhone: '',
    };

    const parsed = parse(validRestaurant(), teuda);

    expect(parsed.teuda.hechsher).toBe('BADATZ_BEIT_YOSEF');
    expect(parsed.teuda.kashrutLevel).toBeUndefined();
    expect(parsed.teuda.expirationDate).toBeUndefined();
    expect(() => parse(validRestaurant(), { hechsher: 'BADATZ_BEIT_YOSEF', expirationDate: 'not-a-date' })).toThrow();
  });
});
