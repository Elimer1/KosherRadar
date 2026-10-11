// NEW (Milestone 4): `npm run search:rebuild` - rebuilds the search fields of every restaurant (safe to run again).
// חדש (אבן דרך 4): בונה מחדש את שדות החיפוש של כל המסעדות (בטוח להרצה חוזרת).
import { validateEnv } from '../src/config/env.js';
import { connectDb, disconnectDb } from '../src/config/db.js';
import { rebuildSearchFieldsService } from '../src/services/searchFieldsRebuildService.js';

const runRebuild = async () => {
  try {
    validateEnv();
    await connectDb();

    const result = await rebuildSearchFieldsService();

    console.log(`Search fields rebuilt for ${result.restaurantCount} restaurant(s).`);
  } catch (error) {
    console.error('Rebuild failed:', error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDb();
  }
};

runRebuild();
