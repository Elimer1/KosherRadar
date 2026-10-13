// Diagnostic evidence, not a security fix. All records belong to the disposable runner.
import assert from 'node:assert/strict';
import test, { before, after } from 'node:test';
import mongoose from 'mongoose';
import { User } from '../src/models/User.js';
import { PasswordResetToken } from '../src/models/PasswordResetToken.js';
import { requestPasswordResetService } from '../src/services/passwordResetService.js';
import { consumeResetTokenRepo } from '../src/repositories/passwordResetRepository.js';
import { env } from '../src/config/env.js';

before(async () => {
  const uri = new URL(process.env.AGENT1_ISOLATED_URI);
  assert.equal(uri.hostname, '127.0.0.1');
  assert.equal(uri.pathname, '/agent1_disposable');
  assert.equal(uri.searchParams.get('replicaSet'), process.env.AGENT1_REPLICA_SET);
  uri.pathname = '/agent1_disposable_reset_audit';
  // Explicitly disable mail even if a future runner supplies configuration.
  env.emailUser = ''; env.emailAppPassword = '';
  await mongoose.connect(uri.href);
  await Promise.all([User.init(), PasswordResetToken.init()]);
});
after(async () => mongoose.disconnect());

test('same reset hash can be consumed only once under concurrent MongoDB requests', async () => {
  const user = await User.create({ email: 'single-use@example.invalid', passwordHash: 'fixture' });
  const tokenHash = 'synthetic-single-use-hash';
  await PasswordResetToken.create({ user: user._id, tokenHash, expiresAt: new Date(Date.now() + 60_000) });
  const consumed = await Promise.all(Array.from({ length: 4 }, () => consumeResetTokenRepo(tokenHash, new Date())));
  assert.equal(consumed.filter(Boolean).length, 1);
});

test('SEC-006 diagnostic: concurrent issuance leaves two distinct consumable links (known blocker)', async () => {
  const user = await User.create({ email: 'reset-race@example.invalid', passwordHash: 'fixture' });
  let completedDeletes = 0;
  let release;
  const gate = new Promise((done) => { release = done; });
  const original = PasswordResetToken.collection.deleteMany;
  PasswordResetToken.collection.deleteMany = async function (...args) {
    const result = await original.apply(this, args);
    if (++completedDeletes === 2) release();
    await gate;
    return result;
  };
  try {
    await Promise.all([
      requestPasswordResetService({ email: user.email, language: 'en' }),
      requestPasswordResetService({ email: user.email, language: 'en' }),
    ]);
  } finally {
    release();
    PasswordResetToken.collection.deleteMany = original;
  }
  const tokens = await PasswordResetToken.find({ user: user._id, usedAt: null }).lean();
  assert.equal(tokens.length, 2, 'Evidence of the unresolved latest-link-only issuance race');
  assert.equal(new Set(tokens.map((row) => row.tokenHash)).size, 2);
  const consumed = await Promise.all(tokens.map((row) => consumeResetTokenRepo(row.tokenHash, new Date())));
  assert.equal(consumed.filter(Boolean).length, 2);
});
