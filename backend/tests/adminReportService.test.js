// NEW (Milestone 3): tests for admin handling of reports (apply a correction or not, +1 point, rejection).
// חדש (אבן דרך 3): בדיקות לטיפול מנהל בדיווחים (החלת תיקון או לא, +1 נקודה, דחייה).
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../src/repositories/restaurantRepository.js', () => ({
  findRestaurantByIdRepo: vi.fn(),
}));

vi.mock('../src/repositories/teudaRepository.js', () => ({
  findTeudaByIdRepo: vi.fn(),
}));

vi.mock('../src/repositories/adminRestaurantRepository.js', () => ({
  saveRestaurantChangesRepo: vi.fn(),
}));

vi.mock('../src/repositories/adminTeudaRepository.js', () => ({
  saveTeudaChangesRepo: vi.fn(),
}));

vi.mock('../src/repositories/adminReportRepository.js', () => ({
  findReportByIdRepo: vi.fn(),
  listPendingReportsRepo: vi.fn(),
  rejectPendingReportRepo: vi.fn(),
  reopenResolvedReportRepo: vi.fn(),
  resolvePendingReportRepo: vi.fn(),
}));

vi.mock('../src/repositories/userRepository.js', () => ({
  findUserByIdRepo: vi.fn(),
  awardPointsOnceRepo: vi.fn(),
}));

vi.mock('../src/services/emailService.js', () => ({
  EMAIL_FAILED: 'FAILED',
  sendRejectionEmailService: vi.fn(),
}));

import { findRestaurantByIdRepo } from '../src/repositories/restaurantRepository.js';
import { findTeudaByIdRepo } from '../src/repositories/teudaRepository.js';
import { saveRestaurantChangesRepo } from '../src/repositories/adminRestaurantRepository.js';
import { saveTeudaChangesRepo } from '../src/repositories/adminTeudaRepository.js';
import {
  findReportByIdRepo,
  listPendingReportsRepo,
  rejectPendingReportRepo,
  reopenResolvedReportRepo,
  resolvePendingReportRepo,
} from '../src/repositories/adminReportRepository.js';
import { awardPointsOnceRepo, findUserByIdRepo } from '../src/repositories/userRepository.js';
import { sendRejectionEmailService } from '../src/services/emailService.js';
import {
  buildCorrectionChanges,
  listPendingReportsService,
  rejectReportService,
  resolveReportService,
} from '../src/services/adminReportService.js';

const report = (overrides = {}) => ({
  _id: 'report-1',
  restaurant: 'rest-1',
  teuda: 'teuda-1',
  submittedBy: 'user-1',
  type: 'KASHRUT_UPDATE',
  description: 'It is Mehadrin now',
  proposedKashrutLevel: 'MEHADRIN',
  status: 'PENDING',
  correctionApplied: false,
  ...overrides,
});

// Stands in for the database: resolving returns the report with the new status.
const stubResolve = () => {
  resolvePendingReportRepo.mockImplementation(async (id, { correctionApplied, adminNote }) => ({
    ...report(),
    status: 'RESOLVED',
    correctionApplied,
    adminNote,
  }));
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});

  findUserByIdRepo.mockResolvedValue({ _id: 'user-1', role: 'USER', email: 'user@example.com' });
  awardPointsOnceRepo.mockResolvedValue({ _id: 'user-1' });
  findRestaurantByIdRepo.mockResolvedValue({ _id: 'rest-1', name: 'Pizza Hut', status: 'APPROVED' });
  findTeudaByIdRepo.mockResolvedValue({ _id: 'teuda-1', kashrutLevel: 'RABBANUT' });
  sendRejectionEmailService.mockResolvedValue('SENT');
  stubResolve();
});

afterEach(() => vi.restoreAllMocks());

describe('buildCorrectionChanges', () => {
  it('maps a proposed level and hechsher onto a certificate', () => {
    const changes = buildCorrectionChanges(
      report({ proposedHechsher: 'BADATZ_MACHPUD', proposedKashrutLevel: 'MEHADRIN' }),
      'TEUDA'
    );

    expect(changes).toEqual({ hechsher: 'BADATZ_MACHPUD', hechsherOther: undefined, kashrutLevel: 'MEHADRIN' });
  });

  it('maps onto the unverified claim of a restaurant, and keeps free text for OTHER', () => {
    const changes = buildCorrectionChanges(
      report({ proposedHechsher: 'OTHER', proposedHechsherOther: 'Rav Cohen', proposedKashrutLevel: undefined }),
      'RESTAURANT'
    );

    expect(changes).toEqual({ claimedHechsher: 'OTHER', claimedHechsherOther: 'Rav Cohen' });
  });

  it('changes only what was proposed', () => {
    expect(buildCorrectionChanges(report(), 'TEUDA')).toEqual({ kashrutLevel: 'MEHADRIN' });
  });
});

describe('resolveReportService', () => {
  it('APPLY_PROPOSED changes the certificate named in the report and gives +1', async () => {
    findReportByIdRepo.mockResolvedValue(report());

    const result = await resolveReportService({ reportId: 'report-1', resolution: 'APPLY_PROPOSED' });

    expect(saveTeudaChangesRepo).toHaveBeenCalledTimes(1);
    expect(saveTeudaChangesRepo.mock.calls[0][1]).toEqual({ kashrutLevel: 'MEHADRIN' });
    expect(resolvePendingReportRepo).toHaveBeenCalledWith('report-1', { correctionApplied: true, adminNote: undefined });
    expect(resolvePendingReportRepo.mock.invocationCallOrder[0]).toBeLessThan(
      saveTeudaChangesRepo.mock.invocationCallOrder[0]
    );
    expect(result.report).toMatchObject({ status: 'RESOLVED', correctionApplied: true });
    expect(result.points).toMatchObject({ awarded: true, points: 1 });
    expect(awardPointsOnceRepo).toHaveBeenCalledWith('user-1', 'REPORT:report-1', 1);
  });

  it('APPLY_PROPOSED changes the restaurant claim when the report names no certificate', async () => {
    findReportByIdRepo.mockResolvedValue(report({ teuda: undefined }));

    await resolveReportService({ reportId: 'report-1', resolution: 'APPLY_PROPOSED' });

    expect(saveTeudaChangesRepo).not.toHaveBeenCalled();
    expect(saveRestaurantChangesRepo.mock.calls[0][1]).toEqual({ claimedKashrutLevel: 'MEHADRIN' });
  });

  it('APPLY_PROPOSED is refused for a general report with nothing to apply, and nothing is saved', async () => {
    findReportByIdRepo.mockResolvedValue(report({ type: 'GENERAL', proposedKashrutLevel: undefined }));

    await expect(
      resolveReportService({ reportId: 'report-1', resolution: 'APPLY_PROPOSED' })
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(resolvePendingReportRepo).not.toHaveBeenCalled();
    expect(awardPointsOnceRepo).not.toHaveBeenCalled();
  });

  it('reopens the report when the correction write fails after the claim', async () => {
    findReportByIdRepo.mockResolvedValue(report());
    saveTeudaChangesRepo.mockRejectedValue(new Error('database down'));

    await expect(resolveReportService({ reportId: 'report-1', resolution: 'APPLY_PROPOSED' })).rejects.toThrow(
      'database down'
    );
    expect(resolvePendingReportRepo).toHaveBeenCalled();
    expect(reopenResolvedReportRepo).toHaveBeenCalledWith('report-1');
    expect(awardPointsOnceRepo).not.toHaveBeenCalled();
  });

  it('does not write the certificate when another admin already claimed the report', async () => {
    findReportByIdRepo.mockResolvedValue(report());
    resolvePendingReportRepo.mockResolvedValue(null);

    await expect(resolveReportService({ reportId: 'report-1', resolution: 'APPLY_PROPOSED' })).rejects.toMatchObject({
      statusCode: 409,
    });
    expect(saveTeudaChangesRepo).not.toHaveBeenCalled();
    expect(saveRestaurantChangesRepo).not.toHaveBeenCalled();
    expect(reopenResolvedReportRepo).not.toHaveBeenCalled();
    expect(awardPointsOnceRepo).not.toHaveBeenCalled();
  });

  it('CORRECTION_ALREADY_MADE counts as an applied correction without changing records itself', async () => {
    findReportByIdRepo.mockResolvedValue(report({ type: 'GENERAL', proposedKashrutLevel: undefined }));

    const result = await resolveReportService({
      reportId: 'report-1',
      resolution: 'CORRECTION_ALREADY_MADE',
      adminNote: 'Phone number updated',
    });

    expect(saveTeudaChangesRepo).not.toHaveBeenCalled();
    expect(saveRestaurantChangesRepo).not.toHaveBeenCalled();
    expect(result.report.correctionApplied).toBe(true);
    expect(result.points).toMatchObject({ awarded: true, points: 1 });
  });

  it('NO_CORRECTION resolves an informational report with 0 points', async () => {
    findReportByIdRepo.mockResolvedValue(report());

    const result = await resolveReportService({ reportId: 'report-1', resolution: 'NO_CORRECTION' });

    expect(result.report).toMatchObject({ status: 'RESOLVED', correctionApplied: false });
    expect(result.points).toMatchObject({ awarded: false, points: 0 });
    expect(saveTeudaChangesRepo).not.toHaveBeenCalled();
    expect(awardPointsOnceRepo).not.toHaveBeenCalled();
  });

  it('does not award a second point when the same report is resolved again', async () => {
    findReportByIdRepo.mockResolvedValue(report({ status: 'RESOLVED', correctionApplied: true }));
    awardPointsOnceRepo.mockResolvedValue(null);

    const result = await resolveReportService({ reportId: 'report-1', resolution: 'APPLY_PROPOSED' });

    expect(result.alreadyResolved).toBe(true);
    expect(saveTeudaChangesRepo).not.toHaveBeenCalled();
    expect(resolvePendingReportRepo).not.toHaveBeenCalled();
    expect(result.points).toMatchObject({ awarded: false, reason: 'ALREADY_AWARDED' });
  });

  it('keeps the original outcome when an informational report is resolved again as a correction', async () => {
    findReportByIdRepo.mockResolvedValue(report({ status: 'RESOLVED', correctionApplied: false }));

    const result = await resolveReportService({ reportId: 'report-1', resolution: 'CORRECTION_ALREADY_MADE' });

    expect(result.report.correctionApplied).toBe(false);
    expect(result.points.awarded).toBe(false);
  });

  it('gives nothing to an admin who submitted the report', async () => {
    findReportByIdRepo.mockResolvedValue(report({ submittedBy: 'admin-1' }));
    findUserByIdRepo.mockResolvedValue({ _id: 'admin-1', role: 'ADMIN' });
    resolvePendingReportRepo.mockResolvedValue(report({ submittedBy: 'admin-1', status: 'RESOLVED', correctionApplied: true }));

    const result = await resolveReportService({ reportId: 'report-1', resolution: 'CORRECTION_ALREADY_MADE' });

    expect(result.points.awarded).toBe(false);
  });

  it('refuses to resolve a rejected report and answers 404 for an unknown one', async () => {
    findReportByIdRepo.mockResolvedValue(report({ status: 'REJECTED' }));
    await expect(
      resolveReportService({ reportId: 'report-1', resolution: 'NO_CORRECTION' })
    ).rejects.toMatchObject({ statusCode: 409 });

    findReportByIdRepo.mockResolvedValue(null);
    await expect(
      resolveReportService({ reportId: 'missing', resolution: 'NO_CORRECTION' })
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('rejectReportService', () => {
  it('saves the reason, gives no points and emails the submitter', async () => {
    findReportByIdRepo.mockResolvedValue(report());
    rejectPendingReportRepo.mockResolvedValue(report({ status: 'REJECTED', rejectionReason: 'Not accurate' }));

    const result = await rejectReportService({ reportId: 'report-1', reason: 'Not accurate' });

    expect(rejectPendingReportRepo).toHaveBeenCalledWith('report-1', 'Not accurate');
    expect(result.report).toMatchObject({ status: 'REJECTED', rejectionReason: 'Not accurate', correctionApplied: false });
    expect(result.emailStatus).toBe('SENT');
    expect(sendRejectionEmailService).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'report', subjectName: 'Pizza Hut', reason: 'Not accurate' })
    );
    expect(awardPointsOnceRepo).not.toHaveBeenCalled();
  });

  it('keeps the rejection when the email fails', async () => {
    findReportByIdRepo.mockResolvedValue(report());
    rejectPendingReportRepo.mockResolvedValue(report({ status: 'REJECTED', rejectionReason: 'Not accurate' }));
    sendRejectionEmailService.mockResolvedValue('FAILED');

    const result = await rejectReportService({ reportId: 'report-1', reason: 'Not accurate' });

    expect(result.report.status).toBe('REJECTED');
    expect(result.emailStatus).toBe('FAILED');
  });

  it('only rejects a report that is waiting for review', async () => {
    findReportByIdRepo.mockResolvedValue(report({ status: 'RESOLVED' }));

    await expect(rejectReportService({ reportId: 'report-1', reason: 'Late' })).rejects.toMatchObject({
      statusCode: 409,
    });
    expect(rejectPendingReportRepo).not.toHaveBeenCalled();
  });
});

describe('listPendingReportsService', () => {
  it('returns the report with restaurant, certificate and submitter email for the admin', async () => {
    listPendingReportsRepo.mockResolvedValue({
      total: 1,
      items: [
        report({
          restaurant: { _id: 'rest-1', name: 'Pizza Hut', address: '1 Main St' },
          teuda: {
            _id: 'teuda-1',
            hechsher: 'LOCAL_RABBANUT',
            kashrutLevel: 'RABBANUT',
            expirationDate: new Date('2027-01-01T00:00:00.000Z'),
          },
          submittedBy: { _id: 'user-1', email: 'user@example.com' },
        }),
      ],
    });

    const result = await listPendingReportsService({ page: 1, limit: 20 });

    expect(result.items[0].restaurant.name).toBe('Pizza Hut');
    expect(result.items[0].teuda).toMatchObject({ id: 'teuda-1', expirationDate: '2027-01-01' });
    expect(result.items[0].submittedBy.email).toBe('user@example.com');
  });
});
