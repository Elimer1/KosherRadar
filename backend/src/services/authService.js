import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import {
  createUserRepo,
  findUserByEmailRepo,
  findUserByEmailWithPasswordRepo,
  findUserByIdRepo,
} from '../repositories/userRepository.js';

const SALT_ROUNDS = 10;

// Used to spend the same time on bcrypt when the email does not exist,
// so response time does not reveal which emails are registered.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', SALT_ROUNDS);

// Only these fields ever leave the server. passwordHash is never included.
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
    throw new AppError('Invalid or expired token', 401, 'INVALID_TOKEN');
  }
};

export const registerService = async ({ email, password }) => {
  const existingUser = await findUserByEmailRepo(email);

  if (existingUser) {
    throw new AppError('An account with this email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // role and points are NOT taken from the client: the model defaults to USER and 0.
  const user = await createUserRepo({ email, passwordHash });

  return { user: toPublicUser(user), token: signTokenService(user) };
};

export const loginService = async ({ email, password }) => {
  const user = await findUserByEmailWithPasswordRepo(email);

  const hashToCompare = user ? user.passwordHash : DUMMY_HASH;
  const passwordMatches = await bcrypt.compare(password, hashToCompare);

  if (!user || !passwordMatches) {
    throw new AppError('Invalid email or password', 401);
  }

  return { user: toPublicUser(user), token: signTokenService(user) };
};

// Looks the user up again so a deleted user or changed role takes effect immediately.
export const getUserFromTokenService = async (token) => {
  const payload = verifyTokenService(token);
  const user = await findUserByIdRepo(payload.sub);

  if (!user) {
    throw new AppError('Invalid or expired token', 401, 'INVALID_TOKEN');
  }

  return user;
};
