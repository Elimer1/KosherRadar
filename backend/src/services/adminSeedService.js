import bcrypt from 'bcrypt';
import {
  createUserRepo,
  findUserByEmailRepo,
  setUserRoleRepo,
} from '../repositories/userRepository.js';

const SALT_ROUNDS = 10;

// Safe to run many times. An existing account keeps its password; it is only promoted to ADMIN.
export const seedAdminService = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set');
  }

  if (password.length < 8) {
    throw new Error('SEED_ADMIN_PASSWORD must be at least 8 characters');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await findUserByEmailRepo(normalizedEmail);

  if (!existingUser) {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    await createUserRepo({ email: normalizedEmail, passwordHash, role: 'ADMIN' });
    return 'created';
  }

  if (existingUser.role === 'ADMIN') {
    return 'unchanged';
  }

  await setUserRoleRepo(existingUser._id, 'ADMIN');
  return 'promoted';
};
