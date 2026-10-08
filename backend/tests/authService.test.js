import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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

import {
  createUserRepo,
  findUserByEmailRepo,
  findUserByEmailWithPasswordRepo,
  findUserByIdRepo,
} from '../src/repositories/userRepository.js';
import {
  registerService,
  loginService,
  getUserFromTokenService,
  verifyTokenService,
  signTokenService,
} from '../src/services/authService.js';

const SECRET = 'test-secret-that-is-long-enough-for-jwt-signing';

describe('registerService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createUserRepo.mockImplementation(async (data) => ({
      _id: 'user-1',
      role: 'USER',
      points: 0,
      ...data,
    }));
  });

  it('creates a USER, hashes the password and returns a token without the hash', async () => {
    findUserByEmailRepo.mockResolvedValue(null);

    const result = await registerService({ email: 'a@example.com', password: 'password123' });

    const savedData = createUserRepo.mock.calls[0][0];
    expect(savedData.passwordHash).not.toBe('password123');
    expect(await bcrypt.compare('password123', savedData.passwordHash)).toBe(true);

    expect(result.user).toEqual({ id: 'user-1', email: 'a@example.com', role: 'USER' });
    expect(result.user.passwordHash).toBeUndefined();
    expect(result.token).toEqual(expect.any(String));
  });

  it('never passes role or points from the client to the database', async () => {
    findUserByEmailRepo.mockResolvedValue(null);

    await registerService({
      email: 'a@example.com',
      password: 'password123',
      role: 'ADMIN',
      points: 999,
    });

    const savedData = createUserRepo.mock.calls[0][0];
    expect(Object.keys(savedData).sort()).toEqual(['email', 'passwordHash']);
  });

  it('rejects a duplicate email with 409', async () => {
    findUserByEmailRepo.mockResolvedValue({ _id: 'existing' });

    await expect(
      registerService({ email: 'a@example.com', password: 'password123' })
    ).rejects.toMatchObject({ statusCode: 409 });
    expect(createUserRepo).not.toHaveBeenCalled();
  });
});

describe('loginService', () => {
  let storedUser;

  beforeEach(async () => {
    vi.clearAllMocks();
    storedUser = {
      _id: 'user-1',
      email: 'a@example.com',
      role: 'USER',
      passwordHash: await bcrypt.hash('password123', 4),
    };
  });

  it('returns user and token for correct credentials', async () => {
    findUserByEmailWithPasswordRepo.mockResolvedValue(storedUser);

    const result = await loginService({ email: 'a@example.com', password: 'password123' });

    expect(result.user).toEqual({ id: 'user-1', email: 'a@example.com', role: 'USER' });
    expect(result.user.passwordHash).toBeUndefined();
    expect(verifyTokenService(result.token).sub).toBe('user-1');
  });

  it('rejects a wrong password with 401', async () => {
    findUserByEmailWithPasswordRepo.mockResolvedValue(storedUser);

    await expect(
      loginService({ email: 'a@example.com', password: 'wrong-password' })
    ).rejects.toMatchObject({ statusCode: 401, message: 'Invalid email or password' });
  });

  it('gives the same 401 message for an unknown email', async () => {
    findUserByEmailWithPasswordRepo.mockResolvedValue(null);

    await expect(
      loginService({ email: 'nobody@example.com', password: 'password123' })
    ).rejects.toMatchObject({ statusCode: 401, message: 'Invalid email or password' });
  });
});

describe('JWT tokens', () => {
  it('expire after 24 hours and carry the user id and role', () => {
    const token = signTokenService({ _id: 'user-1', role: 'ADMIN' });
    const payload = jwt.verify(token, SECRET);

    expect(payload.sub).toBe('user-1');
    expect(payload.role).toBe('ADMIN');
    expect(payload.exp - payload.iat).toBe(24 * 60 * 60);
  });

  it('rejects a token signed with a different secret', () => {
    const forged = jwt.sign({ sub: 'user-1', role: 'ADMIN' }, 'some-other-secret');

    expect(() => verifyTokenService(forged)).toThrowError(/Invalid or expired token/);
  });

  it('rejects an expired token with 401 INVALID_TOKEN', () => {
    const expired = jwt.sign({ sub: 'user-1' }, SECRET, { expiresIn: -10 });

    try {
      verifyTokenService(expired);
      throw new Error('should have thrown');
    } catch (error) {
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('INVALID_TOKEN');
    }
  });
});

describe('getUserFromTokenService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the user from the database, so the stored role is trusted', async () => {
    const token = signTokenService({ _id: 'user-1', role: 'ADMIN' });
    findUserByIdRepo.mockResolvedValue({ _id: 'user-1', role: 'USER' });

    const user = await getUserFromTokenService(token);

    expect(user.role).toBe('USER');
  });

  it('rejects a valid token whose user no longer exists', async () => {
    const token = signTokenService({ _id: 'deleted-user', role: 'USER' });
    findUserByIdRepo.mockResolvedValue(null);

    await expect(getUserFromTokenService(token)).rejects.toMatchObject({ statusCode: 401 });
  });
});
