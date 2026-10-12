import { afterEach, describe, expect, it } from 'vitest';
import {
  forgetSearchScroll,
  readSearchScroll,
  rememberSearchReturnPath,
  rememberSearchScroll,
  resolveSearchReturnPath,
  safeSearchReturnPath,
  SEARCH_RETURN_STORAGE_KEY,
  SEARCH_SCROLL_STORAGE_KEY,
} from './searchReturn';

afterEach(() => {
  sessionStorage.clear();
});

describe('safeSearchReturnPath', () => {
  it('keeps a canonical home search and strips coordinates', () => {
    expect(safeSearchReturnPath('/?q=pizza&foodType=MEAT&lat=31.7&lng=35.2')).toBe('/?q=pizza&foodType=MEAT');
    expect(safeSearchReturnPath('/')).toBe('/');
    expect(safeSearchReturnPath(`/?q=${encodeURIComponent('פיצה')}`)).toBe('/?q=%D7%A4%D7%99%D7%A6%D7%94');
  });

  it('rejects external, protocol-relative, and non-search routes', () => {
    expect(safeSearchReturnPath('https://other.example/phish')).toBe(null);
    expect(safeSearchReturnPath('//other.example')).toBe(null);
    expect(safeSearchReturnPath('/%2F%2Fother.example')).toBe(null);
    expect(safeSearchReturnPath('/%252F%252Fother.example')).toBe(null);
    expect(safeSearchReturnPath('/restaurants/abc')).toBe(null);
    expect(safeSearchReturnPath('javascript:alert(1)')).toBe(null);
    expect(safeSearchReturnPath(undefined)).toBe(null);
  });
});

describe('resolveSearchReturnPath', () => {
  it('prefers router state, then the same-tab path, then home', () => {
    rememberSearchReturnPath('/?q=stored');

    expect(resolveSearchReturnPath({ from: '/?q=from-state&lat=1&lng=2' })).toBe('/?q=from-state');
    expect(resolveSearchReturnPath({ from: 'https://other.example' })).toBe('/?q=stored');
    expect(resolveSearchReturnPath(null)).toBe('/?q=stored');

    sessionStorage.setItem(SEARCH_RETURN_STORAGE_KEY, 'https://other.example');
    expect(resolveSearchReturnPath(undefined)).toBe('/');
  });

  it('remembers a scroll position without coordinates', () => {
    rememberSearchScroll('/?q=pizza&lat=31.7&lng=35.2', '6acc84e0953576757dad2141', 240.4);

    expect(readSearchScroll()).toEqual({
      path: '/?q=pizza',
      scrollY: 240,
      restaurantId: '6acc84e0953576757dad2141',
    });
    expect(sessionStorage.getItem(SEARCH_SCROLL_STORAGE_KEY)).not.toContain('31.7');

    forgetSearchScroll();
    expect(readSearchScroll()).toBe(null);
  });

  it('ignores a scroll memory that is not a restaurant return', () => {
    rememberSearchScroll('/restaurants/abc', '6acc84e0953576757dad2141', 10);
    rememberSearchScroll('/?q=pizza', 'not-an-id', 10);

    expect(sessionStorage.getItem(SEARCH_SCROLL_STORAGE_KEY)).toBe(null);
    expect(readSearchScroll()).toBe(null);
  });

  it('does not store a path that is not a search route', () => {
    rememberSearchReturnPath('/restaurants/abc?lat=31');
    expect(sessionStorage.getItem(SEARCH_RETURN_STORAGE_KEY)).toBe(null);
    expect(resolveSearchReturnPath(null)).toBe('/');
  });
});
