// NEW (SEC-006): separate backend process, restricted to the fresh disposable runner database.
// חדש (SEC-006): תהליך שרת נפרד המוגבל למסד הבדיקה הזמני.
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { resetPasswordService } from '../src/services/passwordResetService.js';
import { env } from '../src/config/env.js';
const uri = new URL(process.env.AGENT1_ISOLATED_URI);
assert.equal(uri.hostname, '127.0.0.1');
assert.equal(uri.pathname, '/agent1_disposable');
assert.equal(uri.searchParams.get('replicaSet'), process.env.AGENT1_REPLICA_SET);
uri.pathname = '/agent1_disposable_sec006';
env.emailUser = ''; env.emailAppPassword = '';
await mongoose.connect(uri.href);
process.send({ ready: true });
process.once('message', async ({ token, password }) => {
  try {
    await resetPasswordService({ token, password });
    process.send({ success: true });
  } catch (error) {
    process.send({ success: false, code: error.code || 'DATABASE_ERROR' });
  } finally {
    await mongoose.disconnect(); process.disconnect();
  }
});
