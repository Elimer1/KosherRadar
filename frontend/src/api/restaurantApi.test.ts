import { describe, expect, it } from 'vitest';
import { buildRestaurantPayload } from './restaurantApi';
import { emptyRestaurantForm } from '../types/submissions';

const filledForm = () => ({
  ...emptyRestaurantForm,
  name: 'Pizza Hut',
  address: '1 Main St',
  foodType: 'DAIRY',
  categories: ['RESTAURANT'],
});

describe('buildRestaurantPayload', () => {
  it('leaves out empty optional inputs so the server sees them as missing', () => {
    const payload = buildRestaurantPayload(filledForm());

    expect(payload.city).toBeUndefined();
    expect(payload.phone).toBeUndefined();
    expect(payload.website).toBeUndefined();
    expect(payload.latitude).toBeUndefined();
    expect(payload.claimedHechsher).toBeUndefined();
    expect(payload.foodKeywords).toEqual([]);
  });

  it('sends coordinates as numbers', () => {
    const payload = buildRestaurantPayload({ ...filledForm(), latitude: '31.7683', longitude: '35.2137' });

    expect(payload.latitude).toBe(31.7683);
    expect(payload.longitude).toBe(35.2137);
  });

  it('turns the keyword text into a clean list', () => {
    const payload = buildRestaurantPayload({ ...filledForm(), foodKeywords: ' pizza, pasta ,, salads ' });

    expect(payload.foodKeywords).toEqual(['pizza', 'pasta', 'salads']);
  });

  it('does not send role, status or any other server-controlled field', () => {
    const payload = buildRestaurantPayload(filledForm());

    expect(Object.keys(payload)).not.toContain('status');
    expect(Object.keys(payload)).not.toContain('submittedBy');
  });
});
