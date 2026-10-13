// Read-only inspection of the configured database. Does not create or synchronize indexes.
import { connectDb, disconnectDb } from '../src/config/db.js';
try {
  await connectDb();
  console.log('Required unique indexes are present and compatible.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally { await disconnectDb(); }
