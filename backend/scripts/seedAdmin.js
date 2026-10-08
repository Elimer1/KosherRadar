import { env, validateEnv } from '../src/config/env.js';
import { connectDb, disconnectDb } from '../src/config/db.js';
import { seedAdminService } from '../src/services/adminSeedService.js';

// Usage: npm run seed:admin   (reads SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD from backend/.env)
const runSeed = async () => {
  try {
    validateEnv();
    await connectDb();

    const result = await seedAdminService({
      email: env.seedAdminEmail,
      password: env.seedAdminPassword,
    });

    console.log(`Admin account ${env.seedAdminEmail.trim().toLowerCase()}: ${result}`);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDb();
  }
};

runSeed();
