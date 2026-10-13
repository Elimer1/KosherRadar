// NEW (SEC-006): real MongoDB regression on the runner's fresh disposable database only.
// חדש (SEC-006): בדיקת מקביליות במסד זמני ומבודד בלבד.
import assert from 'node:assert/strict';
import test, { before, after } from 'node:test';
import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import { fork } from 'node:child_process';
import { once } from 'node:events';
import mongoose from 'mongoose';
import { User } from '../src/models/User.js';
import { PasswordResetToken } from '../src/models/PasswordResetToken.js';
import { requestPasswordResetService, resetPasswordService } from '../src/services/passwordResetService.js';
import { env } from '../src/config/env.js';
import { hashResetToken } from '../src/services/passwordResetService.js';
import { authorizeResetTokenRepo } from '../src/repositories/passwordResetRepository.js';
import { loginService, getUserFromTokenService } from '../src/services/authService.js';

before(async () => {
  const uri = new URL(process.env.AGENT1_ISOLATED_URI);
  assert.equal(uri.hostname, '127.0.0.1');
  assert.equal(uri.pathname, '/agent1_disposable');
  assert.equal(uri.searchParams.get('replicaSet'), process.env.AGENT1_REPLICA_SET);
  uri.pathname = '/agent1_disposable_sec006';
  env.emailUser = ''; env.emailAppPassword = '';
  await mongoose.connect(uri.href);
  await Promise.all([User.init(), PasswordResetToken.init()]);
});
after(async () => mongoose.disconnect());

// NEW (SEC-006): capture synthetic raw links without logging or sending email.
// חדש (SEC-006): לכידת קישורי בדיקה בלי רישום או שליחת דואר.
let sequence = 0;
const account = () => User.create({ email: `fixture-${++sequence}@example.invalid`, passwordHash: 'original' });
const issue = async (user) => {
  const random = crypto.randomBytes;
  let token;
  crypto.randomBytes = function (size, ...args) {
    const result = random.call(this, size, ...args);
    if (size === 32 && !args.length) token = result.toString('hex');
    return result;
  };
  try { await requestPasswordResetService({ email: user.email }); }
  finally { crypto.randomBytes = random; }
  assert.ok(token);
  return token;
};
const invalid = (token) => assert.rejects(resetPasswordService({ token, password: 'must-not-save' }), { code: 'INVALID_RESET_TOKEN' });
const state = (user) => User.findById(user._id).select('+passwordHash +resetTokenHash +resetTokenExpiresAt').lean();
const deferred = () => {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
};

test('concurrent forgot-password links have at most one successful account reset', async () => {
  const user = await User.create({ email: 'race@example.invalid', passwordHash: 'fixture' });
  const tokens = [];
  const random = crypto.randomBytes;
  const remove = PasswordResetToken.collection.deleteMany;
  let count = 0, release;
  const gate = new Promise((done) => { release = done; });
  // Force the original delete/delete/create/create interleaving. The fixed design never uses cleanup.
  PasswordResetToken.collection.deleteMany = async function (...args) {
    const result = await remove.apply(this, args);
    if (++count === 2) release();
    await gate;
    return result;
  };
  crypto.randomBytes = function (size, ...args) {
    const result = random.call(this, size, ...args);
    if (size === 32 && !args.length) tokens.push(result.toString('hex'));
    return result;
  };
  try {
    await Promise.all([requestPasswordResetService({ email: user.email }), requestPasswordResetService({ email: user.email })]);
  } finally {
    release(); crypto.randomBytes = random; PasswordResetToken.collection.deleteMany = remove;
  }
  assert.equal(tokens.length, 2);
  const results = await Promise.allSettled(tokens.map((token, index) => resetPasswordService({ token, password: `new-password-${index}` })));
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
  assert.equal(results.find((result) => result.status === 'rejected').reason.code, 'INVALID_RESET_TOKEN');
  assert.equal((await User.findById(user._id)).tokenVersion, 1);
});

test('four concurrent same-token attempts have one winner and one credential bump', async () => {
  const user = await account(), token = await issue(user);
  const passwords = Array.from({ length: 4 }, (_, index) => `same-token-password-${index}`);
  const results = await Promise.allSettled(passwords.map((password) => resetPasswordService({ token, password })));
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
  for (const result of results.filter((result) => result.status === 'rejected')) assert.equal(result.reason.code, 'INVALID_RESET_TOKEN');
  const saved = await state(user);
  assert.equal(saved.tokenVersion, 1);
  assert.equal(saved.resetTokenHash, undefined);
  assert.ok(await bcrypt.compare(passwords[results.findIndex((result) => result.status === 'fulfilled')], saved.passwordHash));
  await invalid(token);
});

test('a reset already hashing an old token loses to a newer authorized token', async () => {
  const user = await account(), old = await issue(user);
  const reached = deferred(), release = deferred();
  const original = User.collection.findOneAndUpdate;
  User.collection.findOneAndUpdate = async function (filter, ...args) {
    if (filter.resetTokenHash === hashResetToken(old)) { reached.resolve(); await release.promise; }
    return original.call(this, filter, ...args);
  };
  let pending;
  try {
    pending = resetPasswordService({ token: old, password: 'obsolete-password' });
    // Attach rejection handler before releasing the competing operation.
    const rejected = assert.rejects(pending, { code: 'INVALID_RESET_TOKEN' });
    await reached.promise;
    const current = await issue(user);
    await resetPasswordService({ token: current, password: 'winning-password' });
    release.resolve(); await rejected;
    const saved = await state(user);
    assert.equal(saved.tokenVersion, 1);
    assert.ok(await bcrypt.compare('winning-password', saved.passwordHash));
  } finally { release.resolve(); User.collection.findOneAndUpdate = original; }
});

test('late forgot-password authority write after successful reset cannot reactivate recovery', async () => {
  const user = await account(), token = await issue(user);
  const reached = deferred(), release = deferred();
  const original = User.collection.findOneAndUpdate;
  User.collection.findOneAndUpdate = async function (filter, update, ...args) {
    if (update.$set?.resetTokenHash) { reached.resolve(); await release.promise; }
    return original.call(this, filter, update, ...args);
  };
  try {
    const pending = issue(user);
    await reached.promise;
    await resetPasswordService({ token, password: 'completed-recovery' });
    release.resolve(); const late = await pending;
    assert.equal((await state(user)).resetTokenHash, undefined);
    await invalid(late); await invalid(token);
  } finally { release.resolve(); User.collection.findOneAndUpdate = original; }
});

test('cleanup and release infrastructure failures cannot affect reset authority', async () => {
  const user = await account(), old = await issue(user), current = await issue(user);
  const remove = PasswordResetToken.collection.deleteMany, compensate = PasswordResetToken.collection.findOneAndUpdate;
  let obsoleteCalls = 0;
  const fail = async () => { obsoleteCalls++; throw new Error('obsolete token operation failed'); };
  PasswordResetToken.collection.deleteMany = fail;
  PasswordResetToken.collection.findOneAndUpdate = fail;
  try {
    await resetPasswordService({ token: current, password: 'cleanup-independent' });
    await invalid(old); await invalid(current);
    assert.equal(obsoleteCalls, 0);
    assert.equal((await state(user)).tokenVersion, 1);
  } finally {
    PasswordResetToken.collection.deleteMany = remove;
    PasswordResetToken.collection.findOneAndUpdate = compensate;
  }
});

test('expired, unknown and superseded links fail; sequential new recovery still works', async () => {
  const user = await account(), old = await issue(user), current = await issue(user);
  await invalid(old); await invalid('f'.repeat(64));
  await User.updateOne({ _id: user._id }, { $set: { resetTokenExpiresAt: new Date(0) } });
  await invalid(current);
  assert.equal((await state(user)).passwordHash, 'original');
  const first = await issue(user);
  await resetPasswordService({ token: first, password: 'first-recovery' });
  const second = await issue(user);
  await resetPasswordService({ token: second, password: 'second-recovery' });
  await invalid(first); await invalid(second);
  const saved = await state(user);
  assert.equal(saved.tokenVersion, 2);
  assert.ok(await bcrypt.compare('second-recovery', saved.passwordHash));
});

test('expiry is enforced at the database write even if reset started while valid', async () => {
  const user = await account(), token = await issue(user);
  const original = User.collection.findOneAndUpdate;
  User.collection.findOneAndUpdate = async function (filter, ...args) {
    if (filter.resetTokenHash) await User.updateOne({ _id: user._id }, { $set: { resetTokenExpiresAt: new Date(0) } });
    return original.call(this, filter, ...args);
  };
  try { await invalid(token); assert.equal((await state(user)).passwordHash, 'original'); }
  finally { User.collection.findOneAndUpdate = original; }
});

test('lost acknowledgement after committed reset does not restore links or change password on retry', async () => {
  const user = await account(), old = await issue(user), token = await issue(user);
  const original = User.collection.findOneAndUpdate;
  User.collection.findOneAndUpdate = async function (...args) {
    const result = await original.apply(this, args);
    throw new Error('simulated lost acknowledgement');
  };
  try {
    await assert.rejects(resetPasswordService({ token, password: 'committed-password' }), /lost acknowledgement/);
  } finally { User.collection.findOneAndUpdate = original; }
  await invalid(old); await invalid(token);
  const saved = await state(user);
  assert.equal(saved.tokenVersion, 1);
  assert.ok(await bcrypt.compare('committed-password', saved.passwordHash));
});

test('known pre-write failure leaves only existing current authority usable without compensation', async () => {
  const user = await account(), old = await issue(user), token = await issue(user);
  const original = User.collection.findOneAndUpdate;
  User.collection.findOneAndUpdate = async () => { throw new Error('simulated pre-write failure'); };
  try { await assert.rejects(resetPasswordService({ token, password: 'failed-password' }), /pre-write failure/); }
  finally { User.collection.findOneAndUpdate = original; }
  assert.equal((await state(user)).passwordHash, 'original');
  await invalid(old);
  await resetPasswordService({ token, password: 'retry-current-password' });
  assert.equal((await state(user)).tokenVersion, 1);
});

test('lost issuance acknowledgement and delayed retry cannot restore an obsolete authority', async () => {
  const user = await account();
  const token = 'b'.repeat(64);
  const args = { userId: user._id, tokenVersion: 0, tokenHash: hashResetToken(token), expiresAt: new Date(Date.now() + 60_000) };
  const original = User.collection.findOneAndUpdate;
  User.collection.findOneAndUpdate = async function (...query) {
    await original.apply(this, query); throw new Error('simulated lost issuance acknowledgement');
  };
  try { await assert.rejects(authorizeResetTokenRepo(args), /lost issuance acknowledgement/); }
  finally { User.collection.findOneAndUpdate = original; }
  await resetPasswordService({ token, password: 'completed-before-retry' });
  assert.equal(await authorizeResetTokenRepo(args), null);
  await invalid(token);
  assert.equal((await state(user)).resetTokenHash, undefined);
});

test('legacy account missing credential epoch recovers without a backfill', async () => {
  const email = 'legacy@example.invalid';
  const { insertedId } = await User.collection.insertOne({ email, passwordHash: 'original', role: 'USER' });
  const user = { _id: insertedId, email }, token = await issue(user);
  await resetPasswordService({ token, password: 'legacy-recovered' });
  assert.equal((await state(user)).tokenVersion, 1);
  await invalid(token);
});

test('a failed obsolete reset cannot compensate after another reset completes', async () => {
  const user = await account(), old = await issue(user);
  const reached = deferred(), release = deferred();
  const original = User.collection.findOneAndUpdate;
  User.collection.findOneAndUpdate = async function (filter, ...args) {
    if (filter.resetTokenHash === hashResetToken(old)) {
      reached.resolve(); await release.promise; throw new Error('obsolete operation failed');
    }
    return original.call(this, filter, ...args);
  };
  try {
    const pending = assert.rejects(resetPasswordService({ token: old, password: 'failed-old-password' }), /obsolete operation failed/);
    await reached.promise;
    const current = await issue(user);
    await resetPasswordService({ token: current, password: 'completed-current-password' });
    release.resolve(); await pending;
  } finally { release.resolve(); User.collection.findOneAndUpdate = original; }
  await invalid(old);
  assert.equal((await state(user)).resetTokenHash, undefined);
  assert.equal((await state(user)).tokenVersion, 1);
});

test('separate backend processes redeeming the same token have one winner', async () => {
  const user = await account(), token = await issue(user);
  const workers = Array.from({ length: 2 }, () => fork(new URL('./sec006ResetWorker.mjs', import.meta.url), [], {
    windowsHide: true, stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
  }));
  const exits = workers.map((worker) => once(worker, 'exit'));
  try {
    const ready = await Promise.all(workers.map((worker) => once(worker, 'message')));
    assert.ok(ready.every(([message]) => message.ready));
    const results = workers.map((worker) => once(worker, 'message'));
    workers.forEach((worker, index) => worker.send({ token, password: `process-password-${index}` }));
    const messages = (await Promise.all(results)).map(([message]) => message);
    assert.equal(messages.filter((message) => message.success).length, 1);
    assert.equal(messages.find((message) => !message.success).code, 'INVALID_RESET_TOKEN');
    assert.equal((await state(user)).tokenVersion, 1);
    assert.ok((await Promise.all(exits)).every(([code]) => code === 0));
  } finally {
    for (const worker of workers) if (worker.exitCode === null) worker.kill();
  }
});

test('successful recovery preserves login and invalidates previously issued JWTs', async () => {
  env.jwtSecret = 'synthetic-sec006-jwt-signing-key-for-disposable-test';
  const user = await User.create({ email: 'auth-compatibility@example.invalid', passwordHash: await bcrypt.hash('original-password', 10) });
  const before = await loginService({ email: user.email, password: 'original-password' });
  assert.equal(String((await getUserFromTokenService(before.token))._id), String(user._id));
  const token = await issue(user);
  await resetPasswordService({ token, password: 'new-login-password' });
  await assert.rejects(getUserFromTokenService(before.token), { code: 'INVALID_TOKEN' });
  await assert.rejects(loginService({ email: user.email, password: 'original-password' }), { statusCode: 401 });
  const after = await loginService({ email: user.email, password: 'new-login-password' });
  assert.equal(String((await getUserFromTokenService(after.token))._id), String(user._id));
});
