// Operator command: uses configured database and Cloudinary. Do not run against real resources without approval.
import { connectDb, disconnectDb } from '../src/config/db.js';
import { retryImageCleanupService } from '../src/services/imageCleanupService.js';
try {
  await connectDb();
  const result = await retryImageCleanupService();
  console.log('Image cleanup batch:', result);
  if (result.pending) process.exitCode = 1;
} finally { await disconnectDb(); }
