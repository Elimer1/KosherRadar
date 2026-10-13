// Explicit operator operation. No drops, syncIndexes or automatic duplicate repair.
// Includes the declared reset-token TTL index: operator approval must cover expiry of old tokens.
import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import { integrityModels, assertUniqueIndexesRepo } from '../src/repositories/indexIntegrityRepository.js';

if (!process.argv.includes('--allow-index-creation')) {
  throw new Error('Index creation requires operator approval for the configured database, including reset-token TTL expiry. After approval, pass --allow-index-creation.');
}
try {
  await mongoose.connect(env.mongodbUri, { serverSelectionTimeoutMS: 5000, autoIndex: false, autoCreate: false });
  for (const model of integrityModels) {
    await model.createCollection();
    // Preserve normal query/geospatial and TTL setup as well as uniqueness on a fresh database.
    await model.createIndexes();
  }
  await assertUniqueIndexesRepo();
  console.log('Required unique indexes provisioned and verified.');
} catch (error) {
  // Index errors can contain existing document values; leave detailed diagnostics to an authorized DB operator.
  console.error(`Index provisioning failed (${error.code || 'UNKNOWN'}). Review conflicts/duplicates before retrying. No indexes were dropped or duplicates repaired; completed index builds remain, including any TTL expiry behavior.`);
  process.exitCode = 1;
} finally { await mongoose.disconnect(); }
