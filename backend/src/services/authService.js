import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { appError } from '../utils/appError.js';
import {
  createUserRepo,
  findUserByEmailRepo,
  findUserByEmailWithPasswordRepo,
  findUserByIdRepo,
} from '../repositories/userRepository.js';

const SALT_ROUNDS = 10;

const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', SALT_ROUNDS);

export const toPublicUser = (user) => {
  return {
    id: String(user._id),
    email: user.email,
    role: user.role,
  };
};

export const signTokenService = (user) => {
  return jwt.sign({ sub: String(user._id), role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
};

export const verifyTokenService = (token) => {
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch (error) {
    throw appError('Invalid or expired token', 401, 'INVALID_TOKEN');
  }
};

export const registerService = async ({ email, password }) => {
  const existingUser = await findUserByEmailRepo(email);

  if (existingUser) {
    throw appError('An account with this email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await createUserRepo({ email, passwordHash });

  return { user: toPublicUser(user), token: signTokenService(user) };
};

export const loginService = async ({ email, password }) => {
  const user = await findUserByEmailWithPasswordRepo(email);

  const hashToCompare = user ? user.passwordHash : DUMMY_HASH;
  const passwordMatches = await bcrypt.compare(password, hashToCompare);

  if (!user || !passwordMatches) {
    throw appError('Invalid email or password', 401);
  }

  return { user: toPublicUser(user), token: signTokenService(user) };
};

export const getUserFromTokenService = async (token) => {
  const payload = verifyTokenService(token);
  const user = await findUserByIdRepo(payload.sub);

  if (!user) {
    throw appError('Invalid or expired token', 401, 'INVALID_TOKEN');
  }

  return user;
};
