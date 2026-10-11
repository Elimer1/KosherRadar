// NEW (Milestone 3): tests that the edit forms are filled correctly and survive a round trip to the payload.
// חדש (אבן דרך 3): בדיקות שטפסי העריכה ממולאים נכון ושורדים מעבר הלוך ושוב למטען.
import { describe, expect, it } from 'vitest';
import { buildRestaurantPayload } from '../api/restaurantApi';
import type { AdminRestaurant, AdminTeuda } from '../types/admin';
import { restaurantToExtrasValues, restaurantToFormValues, teudaToFormValues } from './adminForms';

const restaurant = (overrides: Partial<AdminRestaurant> = {}): AdminRestaurant => ({
  id: 'r1',
  name: 'Pizza Hut',
  nameHe: null,
  nameEn: null,
  address: '1 Main St',
  addressHe: null,
  addressEn: null,
  city: null,
  latitude: null,
  longitude: null,
  geoapifyPlaceId: null,
  phone: null,
  website: null,
  foodType: 'DAIRY',
  categories: ['RESTAURANT'],
  foodKeywords: ['pizza', 'pasta'],
  claimedHechsher: null,
  claimedHechsherOther: null,
  claimedKashrutLevel: null,
  status: 'PENDING',
  submittedBy: null,
  adminNote: null,
  rejectionReason: null,
  kosharotUrl: null,
  possibleDuplicates: [],
  createdAt: '2026-10-11T09:00:00.000Z',
  ...overrides,
});

describe('restaurantToFormValues', () => {
  it('turns missing values into empty text and numbers into text', () => {
    const values = restaurantToFormValues(restaurant({ latitude: 31.7683, longitude: 35.2137 }));

    expect(values.city).toBe('');
    expect(values.phone).toBe('');
    expect(values.latitude).toBe('31.7683');
    expect(values.longitude).toBe('35.2137');
    expect(values.foodKeywords).toBe('pizza, pasta');
  });

  it('keeps coordinates empty (never "null" or 0) when the restaurant has none', () => {
    const values = restaurantToFormValues(restaurant());

    expect(values.latitude).toBe('');
    expect(values.longitude).toBe('');
  });

  it('survives a round trip: editing nothing sends back the same data', () => {
    const original = restaurant({ city: 'Haifa', phone: '04-1234567', claimedKashrutLevel: 'MEHADRIN' });

    const payload = buildRestaurantPayload(restaurantToFormValues(original));

    expect(payload).toMatchObject({
      name: 'Pizza Hut',
      city: 'Haifa',
      phone: '04-1234567',
      claimedKashrutLevel: 'MEHADRIN',
      foodKeywords: ['pizza', 'pasta'],
    });
    expect(payload.latitude).toBeUndefined();
  });
});

describe('restaurantToExtrasValues', () => {
  it('keeps the private note and the Kosharot link', () => {
    const extras = restaurantToExtrasValues(
      restaurant({ adminNote: 'Visited', kosharotUrl: 'https://example.com/r/1', nameHe: 'פיצה האט' })
    );

    expect(extras).toMatchObject({ adminNote: 'Visited', kosharotUrl: 'https://example.com/r/1', nameHe: 'פיצה האט' });
    expect(extras.nameEn).toBe('');
  });
});

describe('teudaToFormValues', () => {
  it('copies the certificate fields the form edits', () => {
    const teuda = {
      hechsher: 'OTHER',
      hechsherOther: 'Rav Cohen',
      kashrutLevel: 'RABBANUT',
      expirationDate: '2027-01-01',
      mashgiachName: 'Dan',
      mashgiachPhone: '050-1234567',
    } as AdminTeuda;

    expect(teudaToFormValues(teuda)).toEqual({
      hechsher: 'OTHER',
      hechsherOther: 'Rav Cohen',
      kashrutLevel: 'RABBANUT',
      expirationDate: '2027-01-01',
      mashgiachName: 'Dan',
      mashgiachPhone: '050-1234567',
    });
  });
});
