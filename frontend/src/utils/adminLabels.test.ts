// NEW (Milestone 3): tests for the admin dashboard text helpers.
// חדש (אבן דרך 3): בדיקות לפונקציות הטקסט של לוח הניהול.
import { describe, expect, it } from 'vitest';
import { buildAdminTeudaPayload, buildExtrasPayload } from '../api/adminApi';
import { emptyRestaurantExtras } from '../types/admin';
import { emptyTeudaForm } from '../types/submissions';
import {
  describeDaysLeft,
  describeEmailStatus,
  describePoints,
  describePreviewItem,
  getDuplicateReasonLabel,
  getVisibilityLabel,
} from './adminLabels';

describe('describeEmailStatus', () => {
  it('is a success only when the email was sent', () => {
    expect(describeEmailStatus('SENT').kind).toBe('success');
  });

  it('warns the admin that the user was not told when the email failed, and says the rejection is saved', () => {
    for (const status of ['FAILED', 'NOT_CONFIGURED'] as const) {
      const result = describeEmailStatus(status);
      expect(result.kind).toBe('warning');
      expect(result.message).toContain('rejection is saved');
      expect(result.message).toContain('not told');
    }
  });
});

describe('describePoints', () => {
  it('names the points that were given', () => {
    expect(describePoints({ awarded: true, points: 3, reason: 'AWARDED' })).toContain('+3 points');
    expect(describePoints({ awarded: true, points: 1, reason: 'AWARDED' })).toContain('+1 point.');
  });

  it('explains why nothing was given', () => {
    expect(describePoints({ awarded: false, points: 0, reason: 'ALREADY_AWARDED' })).toContain('already given');
    expect(describePoints({ awarded: false, points: 0, reason: 'SOMETHING_NEW' })).toBe('No points were given.');
  });
});

describe('labels', () => {
  it('turns raw reasons and visibility values into readable text', () => {
    expect(getDuplicateReasonLabel('SAME_PHONE')).toBe('Same phone number');
    expect(getDuplicateReasonLabel('UNKNOWN_REASON')).toBe('UNKNOWN_REASON');
    expect(getVisibilityLabel('ADMIN_ONLY')).toContain('admin only');
  });

  it('describes days left', () => {
    expect(describeDaysLeft(0)).toBe('Expires today');
    expect(describeDaysLeft(1)).toBe('Expires tomorrow');
    expect(describeDaysLeft(12)).toBe('Expires in 12 days');
  });
});

describe('describePreviewItem', () => {
  const options = [{ value: 'BADATZ_MACHPUD', labelEn: 'Badatz Machpud', labelHe: 'בד"ץ מחפוד' }];

  it('spells out verified, expired and unverified in words', () => {
    const verified = describePreviewItem(
      { kind: 'VERIFIED', hechsher: 'BADATZ_MACHPUD', hechsherOther: null, kashrutLevel: 'MEHADRIN', expirationDate: '2027-01-01' },
      options
    );
    const expired = describePreviewItem(
      { kind: 'EXPIRED', hechsher: 'BADATZ_MACHPUD', hechsherOther: null, kashrutLevel: 'RABBANUT', expirationDate: '2026-09-01' },
      options
    );
    const claim = describePreviewItem(
      { kind: 'UNVERIFIED', hechsher: null, hechsherOther: null, kashrutLevel: 'MEHADRIN', expirationDate: null },
      options
    );

    expect(verified).toBe('Verified certificate: Badatz Machpud, Mehadrin, valid until 2027-01-01');
    expect(expired).toContain('EXPIRED certificate');
    expect(expired).toContain('expired on 2026-09-01');
    expect(claim).toBe('Unverified claim (no certificate): no hechsher named, Mehadrin');
  });
});

describe('admin payload builders', () => {
  it('sends empty extras as empty text so the server clears them', () => {
    expect(buildExtrasPayload(emptyRestaurantExtras)).toEqual({
      nameHe: '',
      nameEn: '',
      addressHe: '',
      addressEn: '',
      adminNote: '',
      kosharotUrl: '',
    });
  });

  it('adds the private note to the certificate payload without sending a status', () => {
    const payload = buildAdminTeudaPayload({ ...emptyTeudaForm, hechsher: 'LOCAL_RABBANUT' }, 'Seen in person');

    expect(payload.adminNote).toBe('Seen in person');
    expect(payload.hechsher).toBe('LOCAL_RABBANUT');
    expect(Object.keys(payload)).not.toContain('status');
  });
});
