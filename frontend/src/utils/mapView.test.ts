// NEW (Milestone 5): tests for the saved list/map choice and the map helpers.
// חדש (אבן דרך 5): בדיקות לבחירת רשימה/מפה השמורה ולעזרי המפה.
import { beforeEach, describe, expect, it } from 'vitest';
import { boundsCrossDateLine, readSavedView, saveView, zoomForRadius } from './mapView';

describe('readSavedView', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts on the list', () => {
    expect(readSavedView()).toBe('list');
  });

  it('remembers the map, and ignores any other saved word', () => {
    saveView('map');
    expect(readSavedView()).toBe('map');

    localStorage.setItem('kosherradar-view', 'both');
    expect(readSavedView()).toBe('list');
  });
});

describe('zoomForRadius and boundsCrossDateLine', () => {
  it('zooms in more for a smaller radius', () => {
    expect(zoomForRadius(1)).toBeGreaterThan(zoomForRadius(50));
    expect(zoomForRadius(null)).toBe(13);
  });

  it('rejects a box whose east is not to the right of its west', () => {
    expect(boundsCrossDateLine({ north: 32, south: 31, east: 35, west: 34 })).toBe(false);
    expect(boundsCrossDateLine({ north: 32, south: 31, east: 34, west: 35 })).toBe(true);
    expect(boundsCrossDateLine({ north: 31, south: 32, east: 35, west: 34 })).toBe(true);
  });
});
