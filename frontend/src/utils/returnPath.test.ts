import { describe, expect, it } from 'vitest';
import { safeReturnPath } from './returnPath';

describe('safeReturnPath', () => {
  it('keeps a path inside the site', () => {
    expect(safeReturnPath('/restaurants/abc/add-teuda')).toBe('/restaurants/abc/add-teuda');
    expect(safeReturnPath('/')).toBe('/');
  });

  it('sends anything else to the home page', () => {
    expect(safeReturnPath(undefined)).toBe('/');
    expect(safeReturnPath('')).toBe('/');
    expect(safeReturnPath('https://other.example/phish')).toBe('/');
    expect(safeReturnPath('//other.example')).toBe('/');
    expect(safeReturnPath('/\\other.example')).toBe('/');
    expect(safeReturnPath('javascript:alert(1)')).toBe('/');
  });
});
