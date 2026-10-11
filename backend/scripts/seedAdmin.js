import { env, validateEnv } from '../src/config/env.js';
import { connectDb, disconnectDb } from '../src/config/db.js';
import { seedAdminService } from '../src/services/adminSeedService.js';

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
