import { describe, expect, it } from 'vitest';
import { loginReasonKey } from './loginReason';

describe('loginReasonKey', () => {
  it('names the contribution page that required an account', () => {
    expect(loginReasonKey('/submit-restaurant')).toBe('auth.needRestaurant');
    expect(loginReasonKey('/restaurants/6acc84e0953576757dad2141/add-teuda')).toBe('auth.needCertificate');
    expect(loginReasonKey('/restaurants/6acc84e0953576757dad2141/report')).toBe('auth.needReport');
    expect(loginReasonKey('/admin?tab=reports')).toBe('auth.needAdmin');
    expect(loginReasonKey('/account')).toBe('auth.needAccount');
  });

  it('stays quiet on the home page and uses a general sentence for other internal pages', () => {
    expect(loginReasonKey('/')).toBe(null);
    expect(loginReasonKey('/restaurants/6acc84e0953576757dad2141')).toBe('auth.needContinue');
  });
});
