import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('../src/repositories/userRepository.js', () => ({ findUserByIdRepo: vi.fn() }));
vi.mock('../src/services/emailService.js', () => ({
  EMAIL_FAILED: 'FAILED', sendApprovalEmailService: vi.fn(), sendRejectionEmailService: vi.fn(),
}));
import { findUserByIdRepo } from '../src/repositories/userRepository.js';
import { sendApprovalEmailService, sendRejectionEmailService } from '../src/services/emailService.js';
import { notifyApprovalService, notifyRejectionService } from '../src/services/moderationNotificationService.js';

beforeEach(() => {
  vi.clearAllMocks();
  findUserByIdRepo.mockResolvedValue({ role: 'USER', email: 'user@example.com', preferredLanguage: 'he' });
  sendApprovalEmailService.mockResolvedValue('SENT');
  sendRejectionEmailService.mockResolvedValue('SENT');
});

describe('moderation notifications', () => {
  it('passes only public rejection information and supported user language', async () => {
    await notifyRejectionService({ submitterId: 'u', kind: 'restaurant', subjectName: 'Cafe', reason: 'Public', adminNote: 'PRIVATE' });
    expect(sendRejectionEmailService).toHaveBeenCalledExactlyOnceWith({
      to: 'user@example.com', kind: 'restaurant', subjectName: 'Cafe', reason: 'Public', language: 'he',
    });
  });
  it('skips approval messages for administrators', async () => {
    findUserByIdRepo.mockResolvedValue({ role: 'ADMIN', email: 'admin@example.com' });
    await notifyApprovalService({ submitterId: 'a', kind: 'restaurant', subjectName: 'Cafe' });
    expect(sendApprovalEmailService).not.toHaveBeenCalled();
  });
  it.each([notifyApprovalService, notifyRejectionService])('contains lookup/delivery failures after saved decisions', async (notify) => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    findUserByIdRepo.mockRejectedValue(new Error('sensitive details'));
    await expect(notify({ submitterId: 'u', kind: 'restaurant', subjectName: 'Cafe', reason: 'Public' })).resolves.toBe('FAILED');
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain('sensitive details');
    consoleError.mockRestore();
  });
});
