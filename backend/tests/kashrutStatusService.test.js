// NEW (Milestone 3): tests for the shared kashrut status rules.
// חדש (אבן דרך 3): בדיקות לחוקי סטטוס הכשרות המשותפים.
import { describe, it, expect } from 'vitest';
import {
  buildKashrutSummary,
  claimMatchesTeuda,
  findConflictingTeudot,
  getClaim,
  getPublicTeudot,
  toPublicTeuda,
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
  photoUrl: 'https://example.com/photo.jpg',
  cloudinaryPublicId: 'secret-public-id',
  mashgiachName: 'Dan',
  mashgiachPhone: '050-1234567',
  adminNote: 'private note',
  submittedBy: 'user-1',
  ...overrides,
});

const restaurant = (overrides = {}) => ({ _id: 'rest-1', ...overrides });

describe('buildKashrutSummary: status', () => {
  it('is UNKNOWN with no certificate and no claim', () => {
    const summary = buildKashrutSummary(restaurant(), [], TODAY);

    expect(summary.status).toBe('UNKNOWN');
    expect(summary.primary).toBeNull();
    expect(summary.moreCount).toBe(0);
  });

  it('is VERIFIED for an approved certificate that expires today (boundary)', () => {
    const summary = buildKashrutSummary(restaurant(), [teuda('2026-10-11')], TODAY);

    expect(summary.status).toBe('VERIFIED');
    expect(summary.primary.kind).toBe('VERIFIED');
  });

  it('is EXPIRED for a certificate that expired yesterday', () => {
    const summary = buildKashrutSummary(restaurant(), [teuda('2026-10-10')], TODAY);

    expect(summary.status).toBe('EXPIRED');
    expect(summary.primary.expirationDate).toBe('2026-10-10');
  });

  it('keeps a certificate that expired exactly six months ago, but not one day older', () => {
    expect(buildKashrutSummary(restaurant(), [teuda('2026-04-11')], TODAY).status).toBe('EXPIRED');
    expect(buildKashrutSummary(restaurant(), [teuda('2026-04-10')], TODAY).status).toBe('UNKNOWN');
  });

  it('never uses an admin-only certificate, even next to a newer one', () => {
    const summary = buildKashrutSummary(
      restaurant(),
      [teuda('2025-01-01', { kashrutLevel: 'MEHADRIN' }), teuda('2027-01-01')],
      TODAY
    );

    expect(summary.items).toHaveLength(1);
    expect(summary.items[0].kashrutLevel).toBe('RABBANUT');
  });

  it('ignores certificates that are not approved', () => {
    const summary = buildKashrutSummary(
      restaurant(),
      [teuda('2027-01-01', { status: 'PENDING' }), teuda('2027-01-01', { status: 'REJECTED' })],
      TODAY
    );

    expect(summary.status).toBe('UNKNOWN');
  });

  it('is UNVERIFIED for a claim without a matching certificate', () => {
    const summary = buildKashrutSummary(restaurant({ claimedKashrutLevel: 'MEHADRIN' }), [], TODAY);

    expect(summary.status).toBe('UNVERIFIED');
    expect(summary.primary).toMatchObject({ kind: 'UNVERIFIED', kashrutLevel: 'MEHADRIN', teudaId: null });
  });

  it('is UNVERIFIED when the only certificate is admin-only', () => {
    const summary = buildKashrutSummary(
      restaurant({ claimedHechsher: 'LOCAL_RABBANUT' }),
      [teuda('2025-01-01')],
      TODAY
    );

    expect(summary.status).toBe('UNVERIFIED');
  });
});

describe('buildKashrutSummary: priority and +N more', () => {
  it('ranks verified MEHADRIN, verified RABBANUT, unverified MEHADRIN, unverified RABBANUT, recent expired', () => {
    const summary = buildKashrutSummary(
      restaurant({ claimedHechsher: 'BADATZ_MACHPUD', claimedKashrutLevel: 'MEHADRIN' }),
      [
        teuda('2026-09-01', { kashrutLevel: 'MEHADRIN' }),
        teuda('2027-01-01', { kashrutLevel: 'RABBANUT' }),
        teuda('2027-03-01', { kashrutLevel: 'MEHADRIN' }),
      ],
      TODAY
    );

    expect(summary.items.map((item) => [item.kind, item.kashrutLevel])).toEqual([
      ['VERIFIED', 'MEHADRIN'],
      ['VERIFIED', 'RABBANUT'],
      ['UNVERIFIED', 'MEHADRIN'],
      ['EXPIRED', 'MEHADRIN'],
    ]);
    expect(summary.primary.expirationDate).toBe('2027-03-01');
    expect(summary.moreCount).toBe(3);
  });

  it('puts an unverified MEHADRIN claim above an unverified RABBANUT claim', () => {
    const mehadrin = buildKashrutSummary(restaurant({ claimedKashrutLevel: 'MEHADRIN' }), [], TODAY);
    const rabbanut = buildKashrutSummary(restaurant({ claimedKashrutLevel: 'RABBANUT' }), [], TODAY);

    expect(mehadrin.primary.rank).toBeLessThan(rabbanut.primary.rank);
  });

  it('shows an unverified claim above a recent expired certificate and says an expired one exists', () => {
    const summary = buildKashrutSummary(
      restaurant({ claimedKashrutLevel: 'MEHADRIN' }),
      [teuda('2026-09-01', { kashrutLevel: 'RABBANUT' })],
      TODAY
    );

    expect(summary.status).toBe('UNVERIFIED');
    expect(summary.hasRecentExpired).toBe(true);
    expect(summary.moreCount).toBe(1);
  });

  it('lets verified RABBANUT and verified MEHADRIN coexist', () => {
    const summary = buildKashrutSummary(
      restaurant(),
      [teuda('2027-01-01', { kashrutLevel: 'RABBANUT' }), teuda('2027-01-01', { kashrutLevel: 'MEHADRIN' })],
      TODAY
    );

    expect(summary.primary.kashrutLevel).toBe('MEHADRIN');
    expect(summary.moreCount).toBe(1);
  });
});

describe('unverified claims next to verified evidence', () => {
  it('hides a claim that repeats a verified certificate', () => {
    const summary = buildKashrutSummary(
      restaurant({ claimedHechsher: 'LOCAL_RABBANUT', claimedKashrutLevel: 'RABBANUT' }),
      [teuda('2027-01-01')],
      TODAY
    );

    expect(summary.items).toHaveLength(1);
    expect(summary.status).toBe('VERIFIED');
  });

  it('hides a claim that a recently expired certificate already repeats', () => {
    const summary = buildKashrutSummary(
      restaurant({ claimedKashrutLevel: 'RABBANUT' }),
      [teuda('2026-09-01')],
      TODAY
    );

    expect(summary.status).toBe('EXPIRED');
    expect(summary.items).toHaveLength(1);
  });

  it('keeps a claim about a different (higher) level, labeled UNVERIFIED', () => {
    const summary = buildKashrutSummary(
      restaurant({ claimedKashrutLevel: 'MEHADRIN' }),
      [teuda('2027-01-01', { kashrutLevel: 'RABBANUT' })],
      TODAY
    );

    // Verified RABBANUT still ranks above an unverified MEHADRIN claim (spec 5.6), but the claim stays listed.
    expect(summary.items.map((item) => item.kind)).toEqual(['VERIFIED', 'UNVERIFIED']);
    expect(summary.moreCount).toBe(1);
  });

  it('keeps a claim about a different hechsher', () => {
    const summary = buildKashrutSummary(
      restaurant({ claimedHechsher: 'BADATZ_MACHPUD' }),
      [teuda('2027-01-01', { hechsher: 'LOCAL_RABBANUT' })],
      TODAY
    );

    expect(summary.items.some((item) => item.kind === 'UNVERIFIED')).toBe(true);
  });

  it('compares OTHER hechsher names ignoring case and spaces at the ends', () => {
    const claim = { hechsher: 'OTHER', hechsherOther: ' Rav Cohen ', kashrutLevel: null };

    expect(claimMatchesTeuda(claim, { hechsher: 'OTHER', hechsherOther: 'rav cohen', kashrutLevel: 'RABBANUT' })).toBe(
      true
    );
    expect(claimMatchesTeuda(claim, { hechsher: 'OTHER', hechsherOther: 'Rav Levi', kashrutLevel: 'RABBANUT' })).toBe(
      false
    );
  });

  it('getClaim returns null when nothing was claimed', () => {
    expect(getClaim(restaurant())).toBeNull();
    expect(getClaim(restaurant({ claimedKashrutLevel: 'MEHADRIN' }))).toMatchObject({ kashrutLevel: 'MEHADRIN' });
  });
});

describe('public data sanitization', () => {
  it('toPublicTeuda never contains admin or internal fields', () => {
    const result = toPublicTeuda(teuda('2027-01-01'), TODAY);

    expect(Object.keys(result).sort()).toEqual(
      [
        'expirationDate',
        'hechsher',
        'hechsherOther',
        'id',
        'kashrutLevel',
        'mashgiachName',
        'mashgiachPhone',
        'photoUrl',
        'visibility',
      ].sort()
    );
    expect(JSON.stringify(result)).not.toContain('private note');
    expect(JSON.stringify(result)).not.toContain('secret-public-id');
  });

  it('getPublicTeudot removes admin-only and unapproved certificates and lists valid ones first', () => {
    const result = getPublicTeudot(
      [
        teuda('2026-09-01', { _id: 'recent' }),
        teuda('2025-01-01', { _id: 'old' }),
        teuda('2027-01-01', { _id: 'valid' }),
        teuda('2027-02-01', { _id: 'pending', status: 'PENDING' }),
      ],
      TODAY
    );

    expect(result.map((item) => item.id)).toEqual(['valid', 'recent']);
    expect(result.map((item) => item.visibility)).toEqual(['VALID', 'RECENT_EXPIRED']);
  });
});

describe('findConflictingTeudot', () => {
  it('warns when another valid approved certificate has the same level', () => {
    const proposed = teuda('2027-06-01', { _id: 'new', status: 'PENDING', kashrutLevel: 'MEHADRIN' });
    const existing = teuda('2027-01-01', { _id: 'old', kashrutLevel: 'MEHADRIN' });

    const result = findConflictingTeudot(proposed, [existing], TODAY);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: 'old', kashrutLevel: 'MEHADRIN' });
  });

  it('does not warn for a different level, an expired certificate or a pending one', () => {
    const proposed = teuda('2027-06-01', { _id: 'new', status: 'PENDING', kashrutLevel: 'MEHADRIN' });

    const others = [
      teuda('2027-01-01', { kashrutLevel: 'RABBANUT' }),
      teuda('2026-09-01', { kashrutLevel: 'MEHADRIN' }),
      teuda('2027-01-01', { kashrutLevel: 'MEHADRIN', status: 'PENDING' }),
    ];

    expect(findConflictingTeudot(proposed, others, TODAY)).toEqual([]);
  });

  it('does not compare a certificate with itself', () => {
    const approved = teuda('2027-01-01', { _id: 'same', kashrutLevel: 'MEHADRIN' });

    expect(findConflictingTeudot(approved, [approved], TODAY)).toEqual([]);
  });

  it('gives no warning for a proposed certificate that is already expired', () => {
    const proposed = teuda('2026-09-01', { _id: 'new', status: 'PENDING', kashrutLevel: 'MEHADRIN' });
    const existing = teuda('2027-01-01', { kashrutLevel: 'MEHADRIN' });

    expect(findConflictingTeudot(proposed, [existing], TODAY)).toEqual([]);
  });
});
