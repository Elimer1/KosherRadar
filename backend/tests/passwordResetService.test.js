// NEW (Milestone 3): tests for password reset: random single-use tokens that are stored only as a hash,
// the same answer for known and unknown emails, expiry and reuse, and the new password being hashed.
// Repositories and email are mocked (no database, no real email).
// חדש (אבן דרך 3): בדיקות לאיפוס סיסמה: טוקנים אקראיים חד-פעמיים שנשמרים רק כ-hash, אותה תשובה למייל מוכר ולא מוכר,
// תפוגה ושימוש חוזר, והסיסמה החדשה נשמרת כ-hash. מאגרי הנתונים והמייל הם דמה.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';

vi.mock('../src/config/env.js', () => ({
  env: { clientUrl: 'http://localhost:5173/', nodeEnv: 'test' },
}));

vi.mock('../src/repositories/userRepository.js', () => ({
  findUserByEmailRepo: vi.fn(),
  setUserPasswordHashRepo: vi.fn(),
}));

vi.mock('../src/repositories/passwordResetRepository.js', () => ({
  consumeResetTokenRepo: vi.fn(),
  createResetTokenRepo: vi.fn(),
  deleteUnusedResetTokensRepo: vi.fn(),
  releaseResetTokenRepo: vi.fn(),
}));

vi.mock('../src/services/emailService.js', () => ({
  sendPasswordResetEmailService: vi.fn(),
  sendPasswordChangedEmailService: vi.fn(),
}));

import { findUserByEmailRepo, setUserPasswordHashRepo } from '../src/repositories/userRepository.js';
import {
  consumeResetTokenRepo,
  createResetTokenRepo,
  deleteUnusedResetTokensRepo,
  releaseResetTokenRepo,
} from '../src/repositories/passwordResetRepository.js';
import { sendPasswordChangedEmailService, sendPasswordResetEmailService } from '../src/services/emailService.js';
import {
  RESET_TOKEN_VALID_MINUTES,
  buildResetLink,
  hashResetToken,
  requestPasswordResetService,
  resetPasswordService,
} from '../src/services/passwordResetService.js';

const TOKEN = 'a'.repeat(64);

describe('requestPasswordResetService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sendPasswordResetEmailService.mockResolvedValue('SENT');
    sendPasswordChangedEmailService.mockResolvedValue('SENT');
    createResetTokenRepo.mockResolvedValue({});
    deleteUnusedResetTokensRepo.mockResolvedValue({});
  });

  it('does nothing and sends no email when the email has no account', async () => {
    findUserByEmailRepo.mockResolvedValue(null);

    await expect(requestPasswordResetService({ email: 'nobody@example.com' })).resolves.toBeUndefined();

    expect(createResetTokenRepo).not.toHaveBeenCalled();
    expect(sendPasswordResetEmailService).not.toHaveBeenCalled();
  });

  it('stores only the hash of a random token and emails the link with the raw token', async () => {
    findUserByEmailRepo.mockResolvedValue({ _id: 'user-1', email: 'a@b.com' });
    const before = Date.now();

    await expect(requestPasswordResetService({ email: 'a@b.com' })).resolves.toBeUndefined();

    const stored = createResetTokenRepo.mock.calls[0][0];
    const email = sendPasswordResetEmailService.mock.calls[0][0];
    const rawToken = new URLSearchParams(new URL(email.resetLink).hash.slice(1)).get('token');

    expect(rawToken).toMatch(/^[a-f0-9]{64}$/);
    expect(stored.tokenHash).toBe(hashResetToken(rawToken));
    expect(stored.tokenHash).not.toBe(rawToken);
    expect(stored.userId).toBe('user-1');
    expect(stored.expiresAt.getTime()).toBeGreaterThanOrEqual(before + RESET_TOKEN_VALID_MINUTES * 60 * 1000 - 1000);
    expect(stored.expiresAt.getTime()).toBeLessThanOrEqual(Date.now() + RESET_TOKEN_VALID_MINUTES * 60 * 1000);
    expect(email.to).toBe('a@b.com');
    expect(email.resetLink.startsWith('http://localhost:5173/reset-password#token=')).toBe(true);
  });

  it('cancels older unused links before creating the new one', async () => {
    findUserByEmailRepo.mockResolvedValue({ _id: 'user-1', email: 'a@b.com' });
    const order = [];
    deleteUnusedResetTokensRepo.mockImplementation(async () => order.push('delete'));
    createResetTokenRepo.mockImplementation(async () => order.push('create'));

    await requestPasswordResetService({ email: 'a@b.com' });

    expect(deleteUnusedResetTokensRepo).toHaveBeenCalledWith('user-1');
    expect(order).toEqual(['delete', 'create']);
  });

  it('creates a different token every time', async () => {
    findUserByEmailRepo.mockResolvedValue({ _id: 'user-1', email: 'a@b.com' });

    await requestPasswordResetService({ email: 'a@b.com' });
    await requestPasswordResetService({ email: 'a@b.com' });

    const [first, second] = createResetTokenRepo.mock.calls.map((call) => call[0].tokenHash);
    expect(first).not.toBe(second);
  });

  it('still resolves the same way when the email could not be sent', async () => {
    findUserByEmailRepo.mockResolvedValue({ _id: 'user-1', email: 'a@b.com' });
    sendPasswordResetEmailService.mockResolvedValue('FAILED');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(requestPasswordResetService({ email: 'a@b.com' })).resolves.toBeUndefined();
    await new Promise((resolve) => setImmediate(resolve));

    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

describe('buildResetLink', () => {
  it('joins the client URL and the token without a double slash', () => {
    expect(buildResetLink(TOKEN)).toBe(`http://localhost:5173/reset-password#token=${TOKEN}`);
  });
});

describe('resetPasswordService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sendPasswordChangedEmailService.mockResolvedValue('SENT');
    deleteUnusedResetTokensRepo.mockResolvedValue({});
  });

  it('looks the token up by its hash, hashes the new password and saves it', async () => {
    consumeResetTokenRepo.mockResolvedValue({ user: 'user-1' });
    setUserPasswordHashRepo.mockResolvedValue({ _id: 'user-1' });

    await resetPasswordService({ token: TOKEN, password: 'brand-new-pass' });

    expect(consumeResetTokenRepo.mock.calls[0][0]).toBe(hashResetToken(TOKEN));
    const [userId, savedHash] = setUserPasswordHashRepo.mock.calls[0];
    expect(userId).toBe('user-1');
    expect(savedHash).not.toBe('brand-new-pass');
    expect(await bcrypt.compare('brand-new-pass', savedHash)).toBe(true);
    expect(deleteUnusedResetTokensRepo).toHaveBeenCalledWith('user-1');
    expect(releaseResetTokenRepo).not.toHaveBeenCalled();
  });

  it('answers 400 and changes nothing for an unknown, used or expired token', async () => {
    consumeResetTokenRepo.mockResolvedValue(null);

    await expect(resetPasswordService({ token: TOKEN, password: 'brand-new-pass' })).rejects.toMatchObject({
      statusCode: 400,
      code: 'INVALID_RESET_TOKEN',
    });

    expect(setUserPasswordHashRepo).not.toHaveBeenCalled();
  });

  it('answers 400 when the account no longer exists and releases the link', async () => {
    consumeResetTokenRepo.mockResolvedValue({ _id: 'token-1', user: 'gone' });
    setUserPasswordHashRepo.mockResolvedValue(null);

    await expect(resetPasswordService({ token: TOKEN, password: 'brand-new-pass' })).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(releaseResetTokenRepo).toHaveBeenCalledWith('token-1');
    expect(deleteUnusedResetTokensRepo).not.toHaveBeenCalled();
  });

  it('releases the link when saving the password throws, and keeps it used after a later cleanup failure', async () => {
    consumeResetTokenRepo.mockResolvedValue({ _id: 'token-1', user: 'user-1' });
    setUserPasswordHashRepo.mockRejectedValueOnce(new Error('database down'));

    await expect(resetPasswordService({ token: TOKEN, password: 'brand-new-pass' })).rejects.toThrow('database down');
    expect(releaseResetTokenRepo).toHaveBeenCalledWith('token-1');

    releaseResetTokenRepo.mockClear();
    setUserPasswordHashRepo.mockResolvedValue({ _id: 'user-1' });
    deleteUnusedResetTokensRepo.mockRejectedValue(new Error('cleanup failed'));

    // A saved password must report success even when cancellation of other links fails.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(resetPasswordService({ token: TOKEN, password: 'brand-new-pass' })).resolves.toBeUndefined();
    consoleError.mockRestore();
    expect(releaseResetTokenRepo).not.toHaveBeenCalled();
  });

  it('works only once: the second use of the same token is refused', async () => {
    consumeResetTokenRepo.mockResolvedValueOnce({ user: 'user-1' }).mockResolvedValueOnce(null);
    setUserPasswordHashRepo.mockResolvedValue({ _id: 'user-1' });

    await resetPasswordService({ token: TOKEN, password: 'brand-new-pass' });
    await expect(resetPasswordService({ token: TOKEN, password: 'another-pass-1' })).rejects.toMatchObject({
      statusCode: 400,
    });

    expect(setUserPasswordHashRepo).toHaveBeenCalledTimes(1);
  });

  it('allows only one concurrent consumer and sends one confirmation', async () => {
    let used = false;
    consumeResetTokenRepo.mockImplementation(async () => {
      if (used) return null;
      used = true;
      return { _id: 'token-1', user: 'user-1' };
    });
    setUserPasswordHashRepo.mockResolvedValue({ _id: 'user-1', email: 'user@example.com' });
    const results = await Promise.allSettled([
      resetPasswordService({ token: TOKEN, password: 'brand-new-pass', language: 'he' }),
      resetPasswordService({ token: TOKEN, password: 'another-pass-1', language: 'he' }),
    ]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.find((result) => result.status === 'rejected').reason.code).toBe('INVALID_RESET_TOKEN');
    expect(setUserPasswordHashRepo).toHaveBeenCalledTimes(1);
    expect(sendPasswordChangedEmailService).toHaveBeenCalledExactlyOnceWith({ to: 'user@example.com', language: 'he' });
  });

  it('confirmation failure cannot reverse a saved password and does not leak error details', async () => {
    consumeResetTokenRepo.mockResolvedValue({ _id: 'token-1', user: 'user-1' });
    setUserPasswordHashRepo.mockResolvedValue({ _id: 'user-1', email: 'user@example.com' });
    sendPasswordChangedEmailService.mockRejectedValue(new Error(TOKEN));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(resetPasswordService({ token: TOKEN, password: 'brand-new-pass' })).resolves.toBeUndefined();
    expect(releaseResetTokenRepo).not.toHaveBeenCalled();
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain(TOKEN);
    consoleError.mockRestore();
  });
});
