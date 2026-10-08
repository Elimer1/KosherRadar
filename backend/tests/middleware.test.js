import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ZodError } from 'zod';

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
import { appError } from '../src/utils/appError.js';
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

  it('throws 401 when there is no Authorization header', async () => {
    await expect(authMiddleware({ headers: {} }, makeRes(), vi.fn())).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it('rejects a header that is not a Bearer token', async () => {
    await expect(
      authMiddleware({ headers: { authorization: 'Basic abc' } }, makeRes(), vi.fn()),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it('rejects a garbage token', async () => {
    await expect(
      authMiddleware({ headers: { authorization: 'Bearer not.a.jwt' } }, makeRes(), vi.fn()),
    ).rejects.toMatchObject({ statusCode: 401, code: 'INVALID_TOKEN' });
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
    expect(() => adminMiddleware({ user: { role: 'USER' } }, makeRes(), vi.fn())).toThrow(
      expect.objectContaining({ statusCode: 403 }),
    );
  });

  it('blocks a request with no user', () => {
    expect(() => adminMiddleware({}, makeRes(), vi.fn())).toThrow(
      expect.objectContaining({ statusCode: 403 }),
    );
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

  it('throws a ZodError with a field issue for a short password', () => {
    const req = { body: { email: 'a@example.com', password: 'short' } };

    let thrown;
    try {
      validateBody(registerSchema)(req, makeRes(), vi.fn());
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(ZodError);
    expect(thrown.issues[0].path).toEqual(['password']);
  });

  it('rejects an object where a string is expected (NoSQL injection attempt)', () => {
    const req = { body: { email: { $ne: '' }, password: 'password123' } };

    expect(() => validateBody(registerSchema)(req, makeRes(), vi.fn())).toThrow(ZodError);
  });

  it('rejects a password longer than the bcrypt limit of 72 characters', () => {
    const req = { body: { email: 'a@example.com', password: 'a'.repeat(73) } };

    expect(() => validateBody(registerSchema)(req, makeRes(), vi.fn())).toThrow(ZodError);
  });
});

describe('errorMiddleware', () => {
  beforeEach(() => {
    env.nodeEnv = 'test';
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('formats an appError with message and code', () => {
    const res = makeRes();
    errorMiddleware(appError('Nope', 403, 'SOME_CODE'), {}, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Nope', code: 'SOME_CODE' });
  });

  it('formats a ZodError as a 400 with field errors', () => {
    const res = makeRes();
    const result = registerSchema.safeParse({ email: 'a@example.com', password: 'short' });

    errorMiddleware(result.error, {}, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: [{ field: 'password', message: 'Password must be at least 8 characters' }],
    });
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
