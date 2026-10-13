// NEW (SEC-006): service security and email contracts; database behavior is tested separately.
// חדש (SEC-006): בדיקות שירות ודואר; התנהגות המסד נבדקת בנפרד.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
vi.mock('../src/config/env.js', () => ({ env: { clientUrl: 'http://localhost:5173/', nodeEnv: 'test' } }));
vi.mock('../src/repositories/userRepository.js', () => ({ findUserByEmailRepo: vi.fn() }));
vi.mock('../src/repositories/passwordResetRepository.js', () => ({ authorizeResetTokenRepo: vi.fn(), resetAuthorizedPasswordRepo: vi.fn() }));
vi.mock('../src/services/emailService.js', () => ({ sendPasswordResetEmailService: vi.fn(), sendPasswordChangedEmailService: vi.fn() }));
import { findUserByEmailRepo } from '../src/repositories/userRepository.js';
import { authorizeResetTokenRepo, resetAuthorizedPasswordRepo } from '../src/repositories/passwordResetRepository.js';
import { sendPasswordChangedEmailService, sendPasswordResetEmailService } from '../src/services/emailService.js';
import { RESET_TOKEN_VALID_MINUTES, buildResetLink, hashResetToken, requestPasswordResetService, resetPasswordService } from '../src/services/passwordResetService.js';
const TOKEN = 'a'.repeat(64);
const user = { _id: 'user-1', email: 'user@example.com', tokenVersion: 3 };
beforeEach(() => {
  vi.resetAllMocks();
  findUserByEmailRepo.mockResolvedValue(user);
  authorizeResetTokenRepo.mockResolvedValue(user);
  resetAuthorizedPasswordRepo.mockResolvedValue(user);
  sendPasswordResetEmailService.mockResolvedValue('SENT');
  sendPasswordChangedEmailService.mockResolvedValue('SENT');
});
describe('requestPasswordResetService', () => {
  it('does nothing and sends no email for an unknown account', async () => {
    findUserByEmailRepo.mockResolvedValue(null);
    await expect(requestPasswordResetService({ email: 'unknown@example.com' })).resolves.toBeUndefined();
    expect(authorizeResetTokenRepo).not.toHaveBeenCalled();
    expect(sendPasswordResetEmailService).not.toHaveBeenCalled();
  });
  it('stores only a random hash, expiry and captured credential epoch; mails a fragment link', async () => {
    const before = Date.now();
    await requestPasswordResetService({ email: user.email, language: 'he' });
    const stored = authorizeResetTokenRepo.mock.calls[0][0];
    const email = sendPasswordResetEmailService.mock.calls[0][0];
    const raw = new URLSearchParams(new URL(email.resetLink).hash.slice(1)).get('token');
    expect(raw).toMatch(/^[a-f0-9]{64}$/);
    expect(stored).toMatchObject({ userId: user._id, tokenVersion: 3, tokenHash: hashResetToken(raw) });
    expect(stored.tokenHash).not.toBe(raw);
    expect(stored.expiresAt.getTime()).toBeGreaterThanOrEqual(before + RESET_TOKEN_VALID_MINUTES * 60_000);
    expect(stored.expiresAt.getTime()).toBeLessThanOrEqual(Date.now() + RESET_TOKEN_VALID_MINUTES * 60_000);
    expect(email).toMatchObject({ to: user.email, language: 'he', validMinutes: 60 });
    expect(email.resetLink).toBe(buildResetLink(raw));
  });
  it('treats a legacy missing epoch as zero and creates different tokens on successive requests', async () => {
    findUserByEmailRepo.mockResolvedValue({ ...user, tokenVersion: undefined });
    await requestPasswordResetService({ email: user.email });
    await requestPasswordResetService({ email: user.email });
    const calls = authorizeResetTokenRepo.mock.calls.map(([arg]) => arg);
    expect(calls[0].tokenVersion).toBe(0);
    expect(calls[0].tokenHash).not.toBe(calls[1].tokenHash);
  });
  it('does not mail an issuance rejected by the credential epoch guard', async () => {
    authorizeResetTokenRepo.mockResolvedValue(null);
    await expect(requestPasswordResetService({ email: user.email })).resolves.toBeUndefined();
    expect(sendPasswordResetEmailService).not.toHaveBeenCalled();
  });
  it('waits for authority acknowledgement before sending mail', async () => {
    let release;
    authorizeResetTokenRepo.mockReturnValue(new Promise((resolve) => { release = resolve; }));
    const pending = requestPasswordResetService({ email: user.email });
    await vi.waitFor(() => expect(authorizeResetTokenRepo).toHaveBeenCalled());
    expect(sendPasswordResetEmailService).not.toHaveBeenCalled();
    release(user); await pending;
    expect(sendPasswordResetEmailService).toHaveBeenCalledTimes(1);
  });
  it('does not mail or retry an uncertain authority write', async () => {
    authorizeResetTokenRepo.mockRejectedValue(new Error('uncertain write'));
    await expect(requestPasswordResetService({ email: user.email })).rejects.toThrow('uncertain write');
    expect(authorizeResetTokenRepo).toHaveBeenCalledTimes(1);
    expect(sendPasswordResetEmailService).not.toHaveBeenCalled();
  });
  it.each(['FAILED', 'NOT_CONFIGURED'])('preserves neutral completion on %s mail status', async (status) => {
    sendPasswordResetEmailService.mockResolvedValue(status);
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      await expect(requestPasswordResetService({ email: user.email })).resolves.toBeUndefined();
      expect(log).toHaveBeenCalled();
      expect(authorizeResetTokenRepo).toHaveBeenCalledTimes(1);
    } finally { log.mockRestore(); }
  });
  it('respects stored language preference', async () => {
    findUserByEmailRepo.mockResolvedValue({ ...user, preferredLanguage: 'he' });
    await requestPasswordResetService({ email: user.email, language: 'en' });
    expect(sendPasswordResetEmailService.mock.calls[0][0].language).toBe('he');
  });
});
it('buildResetLink trims the base URL and keeps tokens out of the query', () => {
  expect(buildResetLink(TOKEN)).toBe(`http://localhost:5173/reset-password#token=${TOKEN}`);
});
describe('resetPasswordService', () => {
  it('hashes the new password and asks for one conditional password/authority write', async () => {
    await resetPasswordService({ token: TOKEN, password: 'brand-new-pass', language: 'he' });
    const [hash, passwordHash] = resetAuthorizedPasswordRepo.mock.calls[0];
    expect(hash).toBe(hashResetToken(TOKEN));
    expect(await bcrypt.compare('brand-new-pass', passwordHash)).toBe(true);
    expect(resetAuthorizedPasswordRepo).toHaveBeenCalledTimes(1);
    expect(sendPasswordChangedEmailService).toHaveBeenCalledExactlyOnceWith({ to: user.email, language: 'he' });
  });
  it.each(['unknown', 'consumed', 'expired', 'superseded', 'deleted account'])('rejects %s without a confirmation', async () => {
    resetAuthorizedPasswordRepo.mockResolvedValue(null);
    await expect(resetPasswordService({ token: TOKEN, password: 'brand-new-pass' })).rejects.toMatchObject({ statusCode: 400, code: 'INVALID_RESET_TOKEN' });
    expect(sendPasswordChangedEmailService).not.toHaveBeenCalled();
  });
  it('bcrypt failure makes no database write', async () => {
    const hash = vi.spyOn(bcrypt, 'hash').mockRejectedValueOnce(new Error('hash failure'));
    try {
      await expect(resetPasswordService({ token: TOKEN, password: 'brand-new-pass' })).rejects.toThrow('hash failure');
      expect(resetAuthorizedPasswordRepo).not.toHaveBeenCalled();
    } finally { hash.mockRestore(); }
  });
  it('propagates database uncertainty without a retry or notification', async () => {
    resetAuthorizedPasswordRepo.mockRejectedValue(new Error('uncertain write'));
    await expect(resetPasswordService({ token: TOKEN, password: 'brand-new-pass' })).rejects.toThrow('uncertain write');
    expect(resetAuthorizedPasswordRepo).toHaveBeenCalledTimes(1);
    expect(sendPasswordChangedEmailService).not.toHaveBeenCalled();
  });
  it('confirmation failure cannot reverse success or log the token', async () => {
    sendPasswordChangedEmailService.mockRejectedValue(new Error(TOKEN));
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      await expect(resetPasswordService({ token: TOKEN, password: 'brand-new-pass' })).resolves.toBeUndefined();
      expect(resetAuthorizedPasswordRepo).toHaveBeenCalledTimes(1);
      expect(JSON.stringify(log.mock.calls)).not.toContain(TOKEN);
    } finally { log.mockRestore(); }
  });
});
