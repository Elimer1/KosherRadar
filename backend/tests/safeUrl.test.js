// NEW (Milestone 4): tests for the check that only http and https links reach the public.
// חדש (אבן דרך 4): בדיקות לבדיקה שרק קישורי http ו-https מגיעים לציבור.
import { describe, it, expect } from 'vitest';
import { toSafeHttpUrl } from '../src/utils/safeUrl.js';

describe('toSafeHttpUrl', () => {
  it('lets http and https links through', () => {
    expect(toSafeHttpUrl('https://example.com/menu')).toBe('https://example.com/menu');
    expect(toSafeHttpUrl('http://example.com')).toBe('http://example.com/');
    expect(toSafeHttpUrl('  https://example.com  ')).toBe('https://example.com/');
  });

  it('blocks every other kind of link', () => {
    for (const unsafe of [
      'javascript:alert(1)',
      'JaVaScRiPt:alert(1)',
      'data:text/html,<script>1</script>',
      'vbscript:msgbox(1)',
      'file:///etc/passwd',
      'ftp://example.com',
      '//example.com',
      'example.com',
      '',
      'not a url',
    ]) {
      expect(toSafeHttpUrl(unsafe), unsafe).toBeNull();
    }
  });

  it('blocks values that are not text', () => {
    for (const value of [null, undefined, 5, {}, ['https://example.com']]) {
      expect(toSafeHttpUrl(value)).toBeNull();
    }
  });
});
