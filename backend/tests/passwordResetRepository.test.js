// NEW (SEC-006): verify the conditional single-document MongoDB write contract.
// חדש (SEC-006): בדיקת חוזה כתיבה מותנית במסמך יחיד.
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('../src/models/User.js', () => ({ User: { findOneAndUpdate: vi.fn() } }));
import { User } from '../src/models/User.js';
import { authorizeResetTokenRepo, resetAuthorizedPasswordRepo } from '../src/repositories/passwordResetRepository.js';
beforeEach(() => vi.resetAllMocks());
describe('account recovery repository', () => {
  it.each([0, 5])('guards issuance with captured epoch %s, without an unconditional fallback', async (tokenVersion) => {
    const expiresAt = new Date('2026-10-13T10:00:00Z');
    await authorizeResetTokenRepo({ userId: 'id', tokenVersion, tokenHash: 'hash', expiresAt });
    const epoch = tokenVersion === 0 ? { $or: [{ tokenVersion: 0 }, { tokenVersion: { $exists: false } }] } : { tokenVersion };
    expect(User.findOneAndUpdate).toHaveBeenCalledExactlyOnceWith(
      { _id: 'id', ...epoch }, { $set: { resetTokenHash: 'hash', resetTokenExpiresAt: expiresAt } },
      { new: true, writeConcern: { w: 'majority' } },
    );
  });
  it('checks authority and server-time expiry in the same write as password, consumption and epoch', async () => {
    await resetAuthorizedPasswordRepo('hash', 'password-hash');
    expect(User.findOneAndUpdate).toHaveBeenCalledExactlyOnceWith(
      { resetTokenHash: 'hash', $expr: { $gt: ['$resetTokenExpiresAt', '$$NOW'] } },
      { $set: { passwordHash: 'password-hash' }, $unset: { resetTokenHash: 1, resetTokenExpiresAt: 1 }, $inc: { tokenVersion: 1 } },
      { new: true, writeConcern: { w: 'majority' } },
    );
  });
  it('returns null for rejected authority without a second write', async () => {
    User.findOneAndUpdate.mockResolvedValue(null);
    expect(await resetAuthorizedPasswordRepo('hash', 'password-hash')).toBeNull();
    expect(User.findOneAndUpdate).toHaveBeenCalledTimes(1);
  });
});
