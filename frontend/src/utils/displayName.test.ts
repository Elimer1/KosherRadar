import { describe, expect, it } from 'vitest';
import { localizedAddress, localizedRestaurantName } from './displayName';

const place = {
  name: 'Pizza Place',
  nameHe: 'מקום פיצה',
  nameEn: 'Pizza Place',
  address: '12 King George',
  addressHe: 'קינג ג׳ורג׳ 12',
  addressEn: '12 King George',
};

describe('localizedRestaurantName', () => {
  it('uses the stored Hebrew name as the heading when the interface is Hebrew', () => {
    expect(localizedRestaurantName(place, 'he')).toEqual({
      primary: 'מקום פיצה',
      secondary: 'Pizza Place',
    });
  });

  it('uses the stored English name as the heading when the interface is English', () => {
    expect(localizedRestaurantName(place, 'en').primary).toBe('Pizza Place');
  });

  it('does not invent a Hebrew name that was not stored', () => {
    expect(localizedRestaurantName({ name: 'Claimed Grill', nameHe: null, nameEn: null }, 'he')).toEqual({
      primary: 'Claimed Grill',
      secondary: '',
    });
  });
});

describe('localizedAddress', () => {
  it('uses a stored Hebrew address only when one exists', () => {
    expect(localizedAddress(place, 'he')).toBe('קינג ג׳ורג׳ 12');
    expect(localizedAddress({ name: 'Cafe', address: '1 Jaffa', addressHe: null }, 'he')).toBe('1 Jaffa');
  });
});
