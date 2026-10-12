import { describe, it, expect } from 'vitest';
import {
  checkExpirationForSubmission,
  getTeudaVisibility,
  isTeudaPublic,
} from '../src/services/teudaRulesService.js';
import {
  addMonthsToDateOnly,
  dateOnlyToDate,
  isValidDateOnly,
  todayInIsrael,
} from '../src/utils/israelDate.js';

const TODAY = '2026-10-11';

const visibilityOf = (dateOnly) => getTeudaVisibility(dateOnlyToDate(dateOnly), TODAY);

describe('getTeudaVisibility', () => {
  it('is VALID when the teuda expires today', () => {
    expect(visibilityOf('2026-10-11')).toBe('VALID');
  });

  it('is VALID when the teuda expires in the future', () => {
    expect(visibilityOf('2027-03-01')).toBe('VALID');
  });

  it('is RECENT_EXPIRED the day after it expires', () => {
    expect(visibilityOf('2026-10-10')).toBe('RECENT_EXPIRED');
  });

  it('is still RECENT_EXPIRED exactly six calendar months ago', () => {
    expect(visibilityOf('2026-04-11')).toBe('RECENT_EXPIRED');
  });

  it('becomes ADMIN_ONLY one day past six calendar months', () => {
    expect(visibilityOf('2026-04-10')).toBe('ADMIN_ONLY');
  });

  it('is ADMIN_ONLY for a teuda that expired years ago', () => {
    expect(visibilityOf('2020-01-01')).toBe('ADMIN_ONLY');
  });

  it('uses calendar months at the end of a month (Aug 31 minus six months is Feb 28)', () => {
    expect(getTeudaVisibility(dateOnlyToDate('2027-02-28'), '2027-08-31')).toBe('RECENT_EXPIRED');
    expect(getTeudaVisibility(dateOnlyToDate('2027-02-27'), '2027-08-31')).toBe('ADMIN_ONLY');
  });

  it('handles the six month window across a year boundary', () => {
    expect(getTeudaVisibility(dateOnlyToDate('2025-07-15'), '2026-01-15')).toBe('RECENT_EXPIRED');
    expect(getTeudaVisibility(dateOnlyToDate('2025-07-14'), '2026-01-15')).toBe('ADMIN_ONLY');
  });
});

describe('isTeudaPublic', () => {
  const approved = (dateOnly) => ({
    status: 'APPROVED',
    kashrutLevel: 'MEHADRIN',
    expirationDate: dateOnlyToDate(dateOnly),
  });

  it('shows approved valid and recently expired teudot', () => {
    expect(isTeudaPublic(approved('2026-12-01'), TODAY)).toBe(true);
    expect(isTeudaPublic(approved('2026-08-01'), TODAY)).toBe(true);
  });

  it('never shows an approved teuda that expired more than six months ago', () => {
    expect(isTeudaPublic(approved('2026-01-01'), TODAY)).toBe(false);
  });

  it('never shows pending or rejected teudot, even when they are not expired', () => {
    const expirationDate = dateOnlyToDate('2026-12-01');
    expect(isTeudaPublic({ status: 'PENDING', kashrutLevel: 'MEHADRIN', expirationDate }, TODAY)).toBe(false);
    expect(isTeudaPublic({ status: 'REJECTED', kashrutLevel: 'MEHADRIN', expirationDate }, TODAY)).toBe(false);
  });

  it('never shows an approved teuda that has no kashrut level or no expiration date', () => {
    expect(isTeudaPublic({ status: 'APPROVED', expirationDate: dateOnlyToDate('2026-12-01') }, TODAY)).toBe(false);
    expect(isTeudaPublic({ status: 'APPROVED', kashrutLevel: 'MEHADRIN' }, TODAY)).toBe(false);
  });
});

describe('Israel calendar date', () => {
  it('uses winter time (UTC+2): 22:30 UTC on Jan 10 is already Jan 11 in Israel', () => {
    expect(todayInIsrael(new Date('2026-01-10T22:30:00.000Z'))).toBe('2026-01-11');
  });

  it('uses summer time (UTC+3): 21:30 UTC on Jul 10 is already Jul 11 in Israel', () => {
    expect(todayInIsrael(new Date('2026-07-10T21:30:00.000Z'))).toBe('2026-07-11');
  });

  it('stays on the same date when Israel and UTC agree', () => {
    expect(todayInIsrael(new Date('2026-07-10T12:00:00.000Z'))).toBe('2026-07-10');
  });

  it('treats a teuda that expires "today" in Israel as valid after UTC midnight has passed', () => {
    const justAfterIsraelMidnight = new Date('2026-01-10T22:30:00.000Z');
    const today = todayInIsrael(justAfterIsraelMidnight);
    expect(getTeudaVisibility(dateOnlyToDate('2026-01-11'), today)).toBe('VALID');
    expect(getTeudaVisibility(dateOnlyToDate('2026-01-10'), today)).toBe('RECENT_EXPIRED');
  });
});

describe('date helpers', () => {
  it('accepts only real calendar dates', () => {
    expect(isValidDateOnly('2026-02-28')).toBe(true);
    expect(isValidDateOnly('2026-02-30')).toBe(false);
    expect(isValidDateOnly('2026-13-01')).toBe(false);
    expect(isValidDateOnly('11/10/2026')).toBe(false);
    expect(isValidDateOnly(20261011)).toBe(false);
  });

  it('keeps the calendar date when stored as UTC midnight', () => {
    expect(dateOnlyToDate('2026-12-31').toISOString()).toBe('2026-12-31T00:00:00.000Z');
  });

  it('adds and subtracts calendar months without overflowing', () => {
    expect(addMonthsToDateOnly('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonthsToDateOnly('2028-01-31', 1)).toBe('2028-02-29');
    expect(addMonthsToDateOnly('2026-10-11', -6)).toBe('2026-04-11');
    expect(addMonthsToDateOnly('2026-03-15', -6)).toBe('2025-09-15');
  });
});

describe('checkExpirationForSubmission', () => {
  it('accepts today and a normal future date', () => {
    expect(() => checkExpirationForSubmission('2026-10-11', TODAY)).not.toThrow();
    expect(() => checkExpirationForSubmission('2027-06-30', TODAY)).not.toThrow();
  });

  it('rejects a certificate that is already expired', () => {
    expect(() => checkExpirationForSubmission('2026-10-10', TODAY)).toThrow(/already expired/);
  });

  it('rejects a date more than five years away', () => {
    expect(() => checkExpirationForSubmission('2031-10-11', TODAY)).not.toThrow();
    expect(() => checkExpirationForSubmission('2031-10-12', TODAY)).toThrow(/5 years/);
  });
});
