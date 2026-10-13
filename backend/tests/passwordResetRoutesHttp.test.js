// NEW (Milestone 3): real HTTP requests to the password reset endpoints (no database): validation errors,
// the identical answer for every email, and the 400 for a bad token. The reset service is mocked.
// חדש (אבן דרך 3): בקשות HTTP אמיתיות לנקודות איפוס הסיסמה: שגיאות ולידציה, תשובה זהה לכל מייל, ו-400 לטוקן לא תקף.
import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import express from 'express';

vi.mock('../src/config/env.js', () => ({
  env: {
    jwtSecret: 'test-secret-that-is-long-enough-for-jwt-signing',
    jwtExpiresIn: '24h',
    nodeEnv: 'test',
  },
}));

vi.mock('../src/repositories/userRepository.js', () => ({
  findUserByIdRepo: vi.fn(),
  createUserRepo: vi.fn(),
  findUserByEmailRepo: vi.fn(),
  findUserByEmailWithPasswordRepo: vi.fn(),
  setUserPasswordHashRepo: vi.fn(),
}));

vi.mock('../src/services/passwordResetService.js', () => ({
  requestPasswordResetService: vi.fn(),
  resetPasswordService: vi.fn(),
}));

import { requestPasswordResetService, resetPasswordService } from '../src/services/passwordResetService.js';
import { appError } from '../src/utils/appError.js';
import authRoutes from '../src/routes/authRoutes.js';
import { passwordResetRateLimiter } from '../src/middleware/rateLimiters.js';
import { ipKeyGenerator } from 'express-rate-limit';
import { errorMiddleware, notFoundMiddleware } from '../src/middleware/errorMiddleware.js';

const VALID_TOKEN = 'b'.repeat(64);

let server;
let baseUrl;
let requestIp;

beforeAll(async () => {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => { requestIp = req.ip; next(); });
  app.use('/api/auth', authRoutes);
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}/api/auth`;
});

afterAll(() => new Promise((resolve) => server.close(resolve)));

const post = (path, body) =>
  fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('POST /forgot-password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (requestIp) passwordResetRateLimiter.resetKey(ipKeyGenerator(requestIp));
    requestPasswordResetService.mockResolvedValue(undefined);
  });

  it('answers 400 for an invalid email and does not call the service', async () => {
    const response = await post('/forgot-password', { email: 'not-an-email' });

    expect(response.status).toBe(400);
    expect(requestPasswordResetService).not.toHaveBeenCalled();
  });

  it('answers 200 with the same message and passes the normalized email on', async () => {
    const response = await post('/forgot-password', { email: '  Someone@Example.COM ' });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toMatch(/If an account exists/);
    expect(requestPasswordResetService).toHaveBeenCalledWith({ email: 'someone@example.com' });
  });

  it('returns identical neutral responses for known, unknown and processing failures', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    requestPasswordResetService.mockResolvedValueOnce(undefined).mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('secret reset token'));
    const bodies = [];
    for (const email of ['known@example.com', 'unknown@example.com', 'failure@example.com']) {
      const response = await post('/forgot-password', { email, language: 'he' });
      expect(response.status).toBe(200);
      expect(response.headers.get('cache-control')).toBe('no-store');
      bodies.push(await response.json());
    }
    expect(bodies[0]).toEqual(bodies[1]);
    expect(bodies[1]).toEqual(bodies[2]);
    expect(bodies[0].message).not.toMatch(/we sent/i);
    expect(JSON.stringify(log.mock.calls)).not.toContain('secret reset token');
    log.mockRestore();
  });

  it('responds without waiting for account lookup/token persistence', async () => {
    let finish;
    requestPasswordResetService.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    try {
      expect((await post('/forgot-password', { email: 'known@example.com' })).status).toBe(200);
    } finally {
      finish();
    }
  });

  it('limits forgot-password to five attempts per IP regardless of account existence', async () => {
    for (let index = 0; index < 5; index += 1) {
      expect((await post('/forgot-password', { email: `unknown${index}@example.com` })).status).toBe(200);
    }
    const response = await post('/forgot-password', { email: 'known@example.com' });
    expect(response.status).toBe(429);
    expect(requestPasswordResetService).toHaveBeenCalledTimes(5);
  });
});

describe('POST /reset-password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('answers 400 for a token that is not 64 hex characters', async () => {
    const response = await post('/reset-password', { token: 'short', password: 'long-enough-pass' });

    expect(response.status).toBe(400);
    expect(resetPasswordService).not.toHaveBeenCalled();
  });

  it('answers 400 for a password that is too short', async () => {
    const response = await post('/reset-password', { token: VALID_TOKEN, password: 'short' });

    expect(response.status).toBe(400);
    expect(resetPasswordService).not.toHaveBeenCalled();
  });

  it('rejects multibyte passwords beyond bcrypt 72-byte limit', async () => {
    const response = await post('/reset-password', { token: VALID_TOKEN, password: 'א'.repeat(40) });
    expect(response.status).toBe(400);
    expect(resetPasswordService).not.toHaveBeenCalled();
  });

  it('answers 200 when the service accepts the token', async () => {
    resetPasswordService.mockResolvedValue(undefined);

    const response = await post('/reset-password', { token: VALID_TOKEN, password: 'long-enough-pass' });

    expect(response.status).toBe(200);
    expect(resetPasswordService).toHaveBeenCalledWith({ token: VALID_TOKEN, password: 'long-enough-pass' });
  });

  it('answers 400 with the service message for a used or expired token', async () => {
    resetPasswordService.mockRejectedValue(appError('This reset link is invalid or has expired.', 400, 'INVALID_RESET_TOKEN'));

    const response = await post('/reset-password', { token: VALID_TOKEN, password: 'long-enough-pass' });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/invalid or has expired/);
  });
});
