import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('../src/models/PasswordResetToken.js', () => ({ PasswordResetToken: { findOneAndUpdate: vi.fn() } }));
import { PasswordResetToken } from '../src/models/PasswordResetToken.js';
import { consumeResetTokenRepo } from '../src/repositories/passwordResetRepository.js';

describe('atomic reset repository contract (mocked MongoDB)', () => {
  beforeEach(() => vi.clearAllMocks());
  it('checks expiration and unused state in the same update that consumes the token', async () => {
    const now = new Date('2026-10-13T10:00:00Z');
    await consumeResetTokenRepo('hashed-token', now);
    expect(PasswordResetToken.findOneAndUpdate).toHaveBeenCalledExactlyOnceWith(
      { tokenHash: 'hashed-token', usedAt: null, expiresAt: { $gt: now } },
      { usedAt: now }, { new: true },
    );
  });
  it.each(['expired', 'already used', 'unknown'])('returns null for a %s link rejected by the atomic filter', async () => {
    PasswordResetToken.findOneAndUpdate.mockResolvedValue(null);
    expect(await consumeResetTokenRepo('hash', new Date())).toBeNull();
  });
});
