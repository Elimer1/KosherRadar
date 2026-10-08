import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/config/env.js', () => ({
  env: {
    jwtSecret: 'test-secret-that-is-long-enough-for-jwt-signing',
    jwtExpiresIn: '24h',
    nodeEnv: 'test',
  },
}));

vi.mock('../src/repositories/userRepository.js', () => ({
  createUserRepo: vi.fn(),
  findUserByEmailRepo: vi.fn(),
  findUserByEmailWithPasswordRepo: vi.fn(),
  findUserByIdRepo: vi.fn(),
  setUserRoleRepo: vi.fn(),
}));

import { env } from '../src/config/env.js';
import { findUserByIdRepo } from '../src/repositories/userRepository.js';
import { signTokenService } from '../src/services/authService.js';
import { authMiddleware } from '../src/middleware/authMiddleware.js';
import { adminMiddleware } from '../src/middleware/adminMiddleware.js';
import { validateBody } from '../src/middleware/validate.js';
import { errorMiddleware } from '../src/middleware/errorMiddleware.js';
import { AppError } from '../src/utils/AppError.js';
import { registerSchema } from '../src/schemas/authSchemas.js';
import { getMyProfileService } from '../src/services/userService.js';

const makeRes = () => {
  const res = { headersSent: false };
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('authMiddleware', () => {
  beforeEach(() => vi.clearAllMocks());

  it('passes 401 to next() when there is no Authorization header', async () => {
    const next = vi.fn();
    await authMiddleware({ headers: {} }, makeRes(), next);

    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 401 });
  });

  it('rejects a header that is not a Bearer token', async () => {
    const next = vi.fn();
    await authMiddleware({ headers: { authorization: 'Basic abc' } }, makeRes(), next);

    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 401 });
  });

  it('rejects a garbage token', async () => {
    const next = vi.fn();
    await authMiddleware({ headers: { authorization: 'Bearer not.a.jwt' } }, makeRes(), next);

    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 401, code: 'INVALID_TOKEN' });
  });

  it('attaches the database user to req.user for a valid token', async () => {
    const token = signTokenService({ _id: 'user-1', role: 'USER' });
    findUserByIdRepo.mockResolvedValue({ _id: 'user-1', role: 'USER' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const next = vi.fn();

    await authMiddleware(req, makeRes(), next);

    expect(req.user).toEqual({ _id: 'user-1', role: 'USER' });
    expect(next).toHaveBeenCalledWith();
  });
});

describe('adminMiddleware', () => {
  it('blocks an ordinary USER with 403', () => {
    const next = vi.fn();
    adminMiddleware({ user: { role: 'USER' } }, makeRes(), next);

    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 403 });
  });

  it('blocks a request with no user', () => {
    const next = vi.fn();
    adminMiddleware({}, makeRes(), next);

    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 403 });
  });

  it('lets an ADMIN through', () => {
    const next = vi.fn();
    adminMiddleware({ user: { role: 'ADMIN' } }, makeRes(), next);

    expect(next).toHaveBeenCalledWith();
  });
});

describe('validateBody with registerSchema', () => {
  it('replaces req.body with cleaned data and drops role/points', () => {
    const req = {
      body: { email: '  Person@Example.COM ', password: 'password123', role: 'ADMIN', points: 50 },
    };
    const next = vi.fn();

    validateBody(registerSchema)(req, makeRes(), next);

    expect(req.body).toEqual({ email: 'person@example.com', password: 'password123' });
    expect(next).toHaveBeenCalledWith();
  });

  it('returns a 400 with field errors for a short password', () => {
    const req = { body: { email: 'a@example.com', password: 'short' } };
    const next = vi.fn();

    validateBody(registerSchema)(req, makeRes(), next);

    const error = next.mock.calls[0][0];
    expect(error.statusCode).toBe(400);
    expect(error.errors[0].field).toBe('password');
  });

  it('rejects an object where a string is expected (NoSQL injection attempt)', () => {
    const req = { body: { email: { $ne: '' }, password: 'password123' } };
    const next = vi.fn();

    validateBody(registerSchema)(req, makeRes(), next);

    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 400 });
  });

  it('rejects a password longer than the bcrypt limit of 72 characters', () => {
    const req = { body: { email: 'a@example.com', password: 'a'.repeat(73) } };
    const next = vi.fn();

    validateBody(registerSchema)(req, makeRes(), next);

    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 400 });
  });
});

describe('errorMiddleware', () => {
  beforeEach(() => {
    env.nodeEnv = 'test';
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('formats an AppError with message and code', () => {
    const res = makeRes();
    errorMiddleware(new AppError('Nope', 403, 'SOME_CODE'), {}, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Nope', code: 'SOME_CODE' });
  });

  it('includes validation errors', () => {
    const error = new AppError('Validation failed', 400, 'VALIDATION_ERROR');
    error.errors = [{ field: 'email', message: 'Invalid' }];
    const res = makeRes();

    errorMiddleware(error, {}, res, vi.fn());

    expect(res.json.mock.calls[0][0].errors).toEqual([{ field: 'email', message: 'Invalid' }]);
  });

  it('maps a duplicate key error to 409', () => {
    const res = makeRes();
    errorMiddleware({ code: 11000 }, {}, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('maps an unreachable database to 503', () => {
    const res = makeRes();
    errorMiddleware({ name: 'MongooseServerSelectionError', message: 'x' }, {}, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(503);
  });

  it('hides internal details of unexpected errors in production', () => {
    env.nodeEnv = 'production';
    const res = makeRes();
    errorMiddleware(new Error('secret db detail'), {}, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Something went wrong' });
  });
});

describe('getMyProfileService', () => {
  it('includes private points but never the password hash', () => {
    const profile = getMyProfileService({
      _id: 'user-1',
      email: 'a@example.com',
      role: 'USER',
      points: 5,
      passwordHash: 'should-not-leak',
    });

    expect(profile).toEqual({ id: 'user-1', email: 'a@example.com', role: 'USER', points: 5 });
  });
});
