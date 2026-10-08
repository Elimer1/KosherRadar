import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  seedAdminEmail: process.env.SEED_ADMIN_EMAIL || '',
  seedAdminPassword: process.env.SEED_ADMIN_PASSWORD || '',
};

export const validateEnv = () => {
  const missing = [];

  if (!env.mongodbUri) {
    missing.push('MONGODB_URI');
  }

  if (!env.jwtSecret) {
    missing.push('JWT_SECRET');
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (env.jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
};
