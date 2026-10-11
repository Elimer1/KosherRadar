import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';

vi.mock('../src/repositories/userRepository.js', () => ({
  createUserRepo: vi.fn(),
  findUserByEmailRepo: vi.fn(),
  setUserRoleRepo: vi.fn(),
}));

import {
  createUserRepo,
  findUserByEmailRepo,
  setUserRoleRepo,
} from '../src/repositories/userRepository.js';
import { seedAdminService } from '../src/services/adminSeedService.js';

describe('seedAdminService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates a new ADMIN with a hashed password and normalized email', async () => {
    findUserByEmailRepo.mockResolvedValue(null);

    const result = await seedAdminService({ email: ' Admin@Example.com ', password: 'password123' });

    expect(result).toBe('created');
    const saved = createUserRepo.mock.calls[0][0];
    expect(saved.email).toBe('admin@example.com');
    expect(saved.role).toBe('ADMIN');
    expect(await bcrypt.compare('password123', saved.passwordHash)).toBe(true);
  });

  it('promotes an existing USER without touching the password', async () => {
    findUserByEmailRepo.mockResolvedValue({ _id: 'u1', role: 'USER' });

    const result = await seedAdminService({ email: 'admin@example.com', password: 'password123' });

    expect(result).toBe('promoted');
    expect(setUserRoleRepo).toHaveBeenCalledWith('u1', 'ADMIN');
    expect(createUserRepo).not.toHaveBeenCalled();
  });

  it('does nothing when the admin already exists (safe to run twice)', async () => {
    findUserByEmailRepo.mockResolvedValue({ _id: 'u1', role: 'ADMIN' });

    const result = await seedAdminService({ email: 'admin@example.com', password: 'password123' });

    expect(result).toBe('unchanged');
    expect(createUserRepo).not.toHaveBeenCalled();
    expect(setUserRoleRepo).not.toHaveBeenCalled();
  });

  it('refuses to run without credentials from the environment', async () => {
    await expect(seedAdminService({ email: '', password: '' })).rejects.toThrow(/must be set/);
  });

  it('refuses a short password', async () => {
    await expect(
      seedAdminService({ email: 'admin@example.com', password: 'short' })
    ).rejects.toThrow(/at least 8/);
  });
});
