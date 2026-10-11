// NEW (Milestone 4): tests for the browser-side check of links sent by the server.
// חדש (אבן דרך 4): בדיקות לבדיקה בדפדפן של קישורים שנשלחו מהשרת.
import { describe, expect, it } from 'vitest';
import { isSafeHttpUrl } from './safeUrl';

describe('isSafeHttpUrl', () => {
  it('accepts http and https links', () => {
    expect(isSafeHttpUrl('https://example.com/a')).toBe(true);
    expect(isSafeHttpUrl('http://example.com')).toBe(true);
  });

  it('rejects scripts, data links, relative links and empty values', () => {
    for (const value of ['javascript:alert(1)', 'data:text/html,x', 'file:///x', '/path', 'example.com', '', null, undefined]) {
      expect(isSafeHttpUrl(value), String(value)).toBe(false);
    }
  });
});
