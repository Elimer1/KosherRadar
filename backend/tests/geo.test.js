// NEW (Milestone 4): tests for the distance helpers.
// חדש (אבן דרך 4): בדיקות לפונקציות המרחק.
import { describe, it, expect } from 'vitest';
import { distanceInKm, kmToRadians } from '../src/utils/geo.js';

describe('distanceInKm', () => {
  it('is 0 for the same point', () => {
    expect(distanceInKm(31.78, 35.22, 31.78, 35.22)).toBe(0);
  });

  it('is about 54 km between Jerusalem and Tel Aviv', () => {
    const distance = distanceInKm(31.7683, 35.2137, 32.0853, 34.7818);

    expect(distance).toBeGreaterThan(52);
    expect(distance).toBeLessThan(56);
  });

  it('is the same in both directions', () => {
    expect(distanceInKm(31.7, 35.2, 32.0, 34.8)).toBeCloseTo(distanceInKm(32.0, 34.8, 31.7, 35.2), 8);
  });
});

describe('kmToRadians', () => {
  it('converts a quarter of the Earth circumference to pi / 2', () => {
    expect(kmToRadians((2 * Math.PI * 6371) / 4)).toBeCloseTo(Math.PI / 2, 8);
  });
});
