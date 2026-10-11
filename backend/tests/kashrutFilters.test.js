// NEW (Milestone 4): tests for the kashrut filters of the public search (spec sections 5.5, 5.7).
// חדש (אבן דרך 4): בדיקות למסנני הכשרות של החיפוש הציבורי (סעיפים 5.5, 5.7).
import { describe, it, expect } from 'vitest';
import {
  applyKashrutFilters,
  buildKashrutSummary,
  withoutExpiredEvidence,
} from '../src/services/kashrutStatusService.js';
import { dateOnlyToDate } from '../src/utils/israelDate.js';

const TODAY = '2026-10-11';

let nextId = 1;

const teuda = (expiration, overrides = {}) => ({
  _id: `teuda-${nextId++}`,
  status: 'APPROVED',
  hechsher: 'LOCAL_RABBANUT',
  kashrutLevel: 'RABBANUT',
  expirationDate: dateOnlyToDate(expiration),
  ...overrides,
});

const NO_FILTERS = { hideExpired: false, includeUnknown: true, level: undefined, hechsherValues: [] };

const summaryOf = (restaurant, teudot) => buildKashrutSummary({ _id: 'r1', ...restaurant }, teudot, TODAY);

describe('withoutExpiredEvidence', () => {
  it('removes expired items and recomputes the primary item and "+N more"', () => {
    const summary = summaryOf({}, [
      teuda('2026-10-01', { kashrutLevel: 'MEHADRIN' }),
      teuda('2027-01-01'),
      teuda('2026-12-01', { hechsher: 'BADATZ_MACHPUD' }),
    ]);

    const view = withoutExpiredEvidence(summary);

    expect(view.items.every((item) => item.kind !== 'EXPIRED')).toBe(true);
    expect(view.items).toHaveLength(2);
    expect(view.moreCount).toBe(1);
    expect(view.status).toBe('VERIFIED');
    expect(view.hasRecentExpired).toBe(false);
  });

  it('keeps an unverified claim', () => {
    const summary = summaryOf({ claimedKashrutLevel: 'MEHADRIN' }, [teuda('2026-10-01')]);

    const view = withoutExpiredEvidence(summary);

    expect(view.status).toBe('UNVERIFIED');
    expect(view.primary.kind).toBe('UNVERIFIED');
  });
});

describe('applyKashrutFilters: unknown restaurants', () => {
  const unknown = () => summaryOf({}, []);

  it('hides UNKNOWN by default and shows it when Include Unknown is on', () => {
    expect(applyKashrutFilters(unknown(), { ...NO_FILTERS, includeUnknown: false })).toBeNull();
    expect(applyKashrutFilters(unknown(), { ...NO_FILTERS, includeUnknown: true })).not.toBeNull();
  });

  it('never matches a level or hechsher filter, even with Include Unknown', () => {
    expect(applyKashrutFilters(unknown(), { ...NO_FILTERS, level: 'MEHADRIN' })).toBeNull();
    expect(applyKashrutFilters(unknown(), { ...NO_FILTERS, hechsherValues: ['LOCAL_RABBANUT'] })).toBeNull();
  });

  it('shows a restaurant with an unverified claim without Include Unknown (it is UNVERIFIED, not UNKNOWN)', () => {
    const claimOnly = summaryOf({ claimedHechsher: 'BADATZ_MACHPUD' }, []);

    expect(applyKashrutFilters(claimOnly, { ...NO_FILTERS, includeUnknown: false })).not.toBeNull();
  });
});

describe('applyKashrutFilters: Hide Expired', () => {
  it('hides a restaurant that has nothing but expired evidence, even with Include Unknown', () => {
    const onlyExpired = summaryOf({}, [teuda('2026-10-01')]);

    expect(applyKashrutFilters(onlyExpired, { ...NO_FILTERS, hideExpired: true })).toBeNull();
  });

  it('shows the same restaurant when Hide Expired is off, as EXPIRED', () => {
    const onlyExpired = summaryOf({}, [teuda('2026-10-01')]);

    expect(applyKashrutFilters(onlyExpired, NO_FILTERS).status).toBe('EXPIRED');
  });

  it('keeps a restaurant that also has a valid certificate, and removes the expired one from its view', () => {
    const both = summaryOf({}, [teuda('2026-10-01', { kashrutLevel: 'MEHADRIN' }), teuda('2027-01-01')]);

    const view = applyKashrutFilters(both, { ...NO_FILTERS, hideExpired: true });

    expect(view.status).toBe('VERIFIED');
    expect(view.items).toHaveLength(1);
  });

  it('keeps a restaurant that also has an unverified claim', () => {
    const expiredPlusClaim = summaryOf({ claimedKashrutLevel: 'MEHADRIN' }, [teuda('2026-10-01')]);

    const view = applyKashrutFilters(expiredPlusClaim, { ...NO_FILTERS, hideExpired: true });

    expect(view.status).toBe('UNVERIFIED');
  });

  it('does not make an UNKNOWN restaurant visible', () => {
    const unknown = summaryOf({}, []);

    expect(applyKashrutFilters(unknown, { hideExpired: true, includeUnknown: false, hechsherValues: [] })).toBeNull();
  });
});

describe('applyKashrutFilters: level and hechsher', () => {
  it('matches verified evidence', () => {
    const verified = summaryOf({}, [teuda('2027-01-01', { kashrutLevel: 'MEHADRIN' })]);

    expect(applyKashrutFilters(verified, { ...NO_FILTERS, level: 'MEHADRIN' })).not.toBeNull();
    expect(applyKashrutFilters(verified, { ...NO_FILTERS, level: 'RABBANUT' })).toBeNull();
  });

  it('matches recent expired evidence unless Hide Expired is on', () => {
    const expired = summaryOf({}, [teuda('2026-10-01', { kashrutLevel: 'MEHADRIN' })]);

    expect(applyKashrutFilters(expired, { ...NO_FILTERS, level: 'MEHADRIN' })).not.toBeNull();
    expect(applyKashrutFilters(expired, { ...NO_FILTERS, level: 'MEHADRIN', hideExpired: true })).toBeNull();
  });

  it('matches an explicitly unverified claim', () => {
    const claim = summaryOf({ claimedKashrutLevel: 'MEHADRIN', claimedHechsher: 'BADATZ_MACHPUD' }, []);

    expect(applyKashrutFilters(claim, { ...NO_FILTERS, level: 'MEHADRIN' })).not.toBeNull();
    expect(applyKashrutFilters(claim, { ...NO_FILTERS, hechsherValues: ['BADATZ_MACHPUD'] })).not.toBeNull();
  });

  it('a claim that names no level does not match a level filter', () => {
    const claim = summaryOf({ claimedHechsher: 'BADATZ_MACHPUD' }, []);

    expect(applyKashrutFilters(claim, { ...NO_FILTERS, level: 'RABBANUT' })).toBeNull();
  });

  it('matches any of several selected hechsher values', () => {
    const verified = summaryOf({}, [teuda('2027-01-01', { hechsher: 'BADATZ_MACHPUD' })]);

    expect(
      applyKashrutFilters(verified, { ...NO_FILTERS, hechsherValues: ['LOCAL_RABBANUT', 'BADATZ_MACHPUD'] })
    ).not.toBeNull();
    expect(applyKashrutFilters(verified, { ...NO_FILTERS, hechsherValues: ['LOCAL_RABBANUT'] })).toBeNull();
  });

  it('needs ONE piece of evidence to match both the level and the hechsher', () => {
    const split = summaryOf({}, [
      teuda('2027-01-01', { hechsher: 'BADATZ_MACHPUD', kashrutLevel: 'RABBANUT' }),
      teuda('2027-02-01', { hechsher: 'LOCAL_RABBANUT', kashrutLevel: 'MEHADRIN' }),
    ]);

    expect(
      applyKashrutFilters(split, { ...NO_FILTERS, level: 'MEHADRIN', hechsherValues: ['BADATZ_MACHPUD'] })
    ).toBeNull();
    expect(
      applyKashrutFilters(split, { ...NO_FILTERS, level: 'MEHADRIN', hechsherValues: ['LOCAL_RABBANUT'] })
    ).not.toBeNull();
  });

  it('never matches with an admin-only (older than six months) certificate', () => {
    const old = summaryOf({}, [teuda('2025-01-01', { kashrutLevel: 'MEHADRIN' })]);

    expect(applyKashrutFilters(old, { ...NO_FILTERS, level: 'MEHADRIN' })).toBeNull();
  });
});
