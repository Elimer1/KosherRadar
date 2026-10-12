import { describe, expect, it } from 'vitest';
import { adminTabFromState, adminTabPath, parseAdminTab } from './adminTab';

describe('admin tabs', () => {
  it('keeps a known tab and ignores anything else', () => {
    expect(parseAdminTab('reports')).toBe('reports');
    expect(parseAdminTab('nope')).toBe('restaurants');
    expect(parseAdminTab(null)).toBe('restaurants');
    expect(adminTabFromState({ adminTab: 'expiring' })).toBe('expiring');
    expect(adminTabFromState({ adminTab: 'https://other.example' })).toBe('restaurants');
  });

  it('omits the default tab from the address', () => {
    expect(adminTabPath('restaurants')).toBe('/admin');
    expect(adminTabPath('reports')).toBe('/admin?tab=reports');
  });
});
