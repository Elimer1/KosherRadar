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
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
  // NEW (Milestone 3): Resend email settings (rejection emails and password reset)
  // חדש (אבן דרך 3): הגדרות שליחת מייל ב-Resend (מיילי דחייה ואיפוס סיסמה)
  resendApiKey: process.env.RESEND_API_KEY || '',
  emailFrom: process.env.EMAIL_FROM || '',
  // NEW (Milestone 4): Atlas Search is OFF until the index from ATLAS_SEARCH_SETUP.md exists and was checked.
  // חדש (אבן דרך 4): Atlas Search כבוי עד שהאינדקס מ-ATLAS_SEARCH_SETUP.md קיים ונבדק.
  atlasSearchEnabled: process.env.ATLAS_SEARCH_ENABLED === 'true',
  atlasSearchIndex: process.env.ATLAS_SEARCH_INDEX || 'restaurant_search',
  // Address search. The key stays on the server. Without it, people type the address by hand.
  geoapifyApiKey: process.env.GEOAPIFY_API_KEY || '',
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
