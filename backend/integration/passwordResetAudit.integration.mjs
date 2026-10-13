// NEW (SEC-006): preserve the audit entry point as fixed-design compatibility regressions.
// חדש (SEC-006): שימור נקודת הביקורת כבדיקות תאימות לתיקון.
import assert from 'node:assert/strict';
import test, { before, after } from 'node:test';
import mongoose from 'mongoose';
import { User } from '../src/models/User.js';
import { PasswordResetToken } from '../src/models/PasswordResetToken.js';
import { resetPasswordService, hashResetToken } from '../src/services/passwordResetService.js';
import { authorizeResetTokenRepo } from '../src/repositories/passwordResetRepository.js';
import { env } from '../src/config/env.js';
before(async () => {
  const uri = new URL(process.env.AGENT1_ISOLATED_URI);
  assert.equal(uri.hostname, '127.0.0.1');
  assert.equal(uri.pathname, '/agent1_disposable');
  assert.equal(uri.searchParams.get('replicaSet'), process.env.AGENT1_REPLICA_SET);
  uri.pathname = '/agent1_disposable_reset_audit';
  env.emailUser = ''; env.emailAppPassword = '';
  await mongoose.connect(uri.href);
  await Promise.all([User.init(), PasswordResetToken.init()]);
});
after(async () => mongoose.disconnect());
test('unexpired unused legacy token rows grant no recovery authority', async () => {
  const user = await User.create({ email: 'legacy-row@example.invalid', passwordHash: 'fixture' });
  const token = 'a'.repeat(64);
  await PasswordResetToken.create({ user: user._id, tokenHash: hashResetToken(token), expiresAt: new Date(Date.now() + 60_000) });
  await assert.rejects(resetPasswordService({ token, password: 'must-not-save' }), { code: 'INVALID_RESET_TOKEN' });
  const saved = await User.findById(user._id).select('+passwordHash');
  assert.equal(saved.passwordHash, 'fixture'); assert.equal(saved.tokenVersion, 0);
  assert.equal(await PasswordResetToken.countDocuments({ user: user._id, usedAt: null }), 1);
});
test('recovery hash and expiry are hidden on normal account queries', async () => {
  const user = await User.create({ email: 'hidden-authority@example.invalid', passwordHash: 'fixture' });
  await authorizeResetTokenRepo({ userId: user._id, tokenVersion: 0, tokenHash: 'synthetic-hash', expiresAt: new Date(Date.now() + 60_000) });
  for (const saved of [await User.findById(user._id).lean(), await User.findOne({ email: user.email }).lean()]) {
    assert.equal(saved.resetTokenHash, undefined); assert.equal(saved.resetTokenExpiresAt, undefined);
  }
  assert.equal((await User.findById(user._id).select('+resetTokenHash')).resetTokenHash, 'synthetic-hash');
});
