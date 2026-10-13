import assert from 'node:assert/strict';
import test, { before, after } from 'node:test';
import mongoose from 'mongoose';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { assertUniqueIndexesRepo } from '../src/repositories/indexIntegrityRepository.js';
import { User } from '../src/models/User.js';
import { Restaurant } from '../src/models/Restaurant.js';
import { Teuda } from '../src/models/Teuda.js';
import { Report } from '../src/models/Report.js';
import { PasswordResetToken } from '../src/models/PasswordResetToken.js';
import { ImageCleanup } from '../src/models/ImageCleanup.js';
import { env } from '../src/config/env.js';
import { connectDb } from '../src/config/db.js';
before(async () => {
  const uri = new URL(process.env.AGENT1_ISOLATED_URI);
  assert.equal(uri.hostname, '127.0.0.1'); assert.equal(uri.pathname, '/agent1_disposable');
  assert.equal(uri.searchParams.get('replicaSet'), process.env.AGENT1_REPLICA_SET);
  // A separate empty database in this runner-owned mongod, so other integration files stay independent.
  uri.pathname = '/agent1_disposable_indexes'; env.mongodbUri = uri.href;
  await mongoose.connect(uri.href, { autoIndex: false, autoCreate: false });
});
after(async () => mongoose.disconnect());
async function operatorScript(name, args = []) {
  const child = spawn(process.execPath, [fileURLToPath(new URL(`../scripts/${name}`, import.meta.url)), ...args], {
    windowsHide: true, stdio: ['ignore', 'ignore', 'ignore'], env: { ...process.env, MONGODB_URI: env.mongodbUri },
  });
  return (await once(child, 'exit'))[0];
}
test('startup rejects missing indexes without creating any collection or index', async () => {
  assert.deepEqual(await mongoose.connection.db.listCollections().toArray(), []);
  await assert.rejects(assertUniqueIndexesRepo(), /Required unique indexes/);
  assert.deepEqual(await mongoose.connection.db.listCollections().toArray(), []);
  await mongoose.disconnect();
  await assert.rejects(connectDb(), /Required unique indexes/);
  assert.equal(mongoose.connection.readyState, 0);
  await mongoose.connect(env.mongodbUri, { autoIndex: false, autoCreate: false });
  assert.deepEqual(await mongoose.connection.db.listCollections().toArray(), []);
  assert.equal(await operatorScript('verifyIntegrityIndexes.js'), 1);
  assert.equal(await operatorScript('provisionIntegrityIndexes.js'), 1);
  assert.deepEqual(await mongoose.connection.db.listCollections().toArray(), []);
  // Explicitly provision ONLY this disposable test database, never an application target.
  assert.equal(await operatorScript('provisionIntegrityIndexes.js', ['--allow-index-creation']), 0);
  await assertUniqueIndexesRepo();
  assert.equal(await operatorScript('verifyIntegrityIndexes.js'), 0);
  const queryIndexes = await Restaurant.collection.listIndexes().toArray();
  assert.ok(queryIndexes.some((index) => index.key.location === '2dsphere'));
  const tokenIndexes = await PasswordResetToken.collection.listIndexes().toArray();
  assert.ok(tokenIndexes.some((index) => index.key.expiresAt === 1 && index.expireAfterSeconds === 0));
});
test('MongoDB enforces user/token/cleanup uniqueness and all pending identities', async () => {
  const user = await User.create({ email: 'indexes@example.invalid', passwordHash: 'fixture' });
  await assert.rejects(User.create({ email: user.email, passwordHash: 'fixture' }), { code: 11000 });
  const restaurantInput = { name: 'Index fixture', address: 'Fixture', submittedBy: user._id };
  const attempts = await Promise.allSettled([Restaurant.create(restaurantInput), Restaurant.create(restaurantInput)]);
  assert.equal(attempts.filter((attempt) => attempt.status === 'fulfilled').length, 1);
  assert.equal(attempts.find((attempt) => attempt.status === 'rejected').reason.code, 11000);
  const restaurant = attempts.find((attempt) => attempt.status === 'fulfilled').value;
  for (const details of [{ expirationDate: new Date('2027-01-01') }, { mashgiachName: 'Fixture' }]) {
    const data = { restaurant: restaurant._id, submittedBy: user._id, hechsher: 'LOCAL_RABBANUT', ...details };
    await Teuda.create(data); await assert.rejects(Teuda.create(data), { code: 11000 });
  }
  const report = { restaurant: restaurant._id, submittedBy: user._id, description: 'Index report' };
  await Report.create(report); await assert.rejects(Report.create(report), { code: 11000 });
  const token = { user: user._id, tokenHash: 'synthetic', expiresAt: new Date('2027-01-01') };
  await PasswordResetToken.create(token); await assert.rejects(PasswordResetToken.create(token), { code: 11000 });
  await ImageCleanup.create({ publicId: 'synthetic' }); await assert.rejects(ImageCleanup.create({ publicId: 'synthetic' }), { code: 11000 });
  // Moderated rows leave the partial index and ordinary users can resubmit.
  await Restaurant.updateOne({ _id: restaurant._id }, { $set: { status: 'APPROVED' } });
  await Restaurant.create(restaurantInput);
});
test('startup rejects a same-name index with weakened uniqueness and never repairs it implicitly', async () => {
  await Restaurant.collection.dropIndex('pending_submitter_name_address');
  await Restaurant.collection.createIndex({ submittedBy: 1, nameNormalized: 1, addressNormalized: 1 }, {
    name: 'pending_submitter_name_address', partialFilterExpression: { status: 'PENDING' },
  });
  await assert.rejects(assertUniqueIndexesRepo(), /restaurants:pending_submitter_name_address/);
  const index = (await Restaurant.collection.listIndexes().toArray()).find((index) => index.name === 'pending_submitter_name_address');
  assert.equal(index.unique, undefined);
});
test('a unique index with the wrong moderation filter is insufficient enforcement', async () => {
  await Restaurant.collection.dropIndex('pending_submitter_name_address');
  await Restaurant.collection.createIndex({ submittedBy: 1, nameNormalized: 1, addressNormalized: 1 }, {
    name: 'pending_submitter_name_address', unique: true, partialFilterExpression: { status: 'APPROVED' },
  });
  await assert.rejects(assertUniqueIndexesRepo(), /restaurants:pending_submitter_name_address/);
  const count = await Restaurant.countDocuments();
  assert.equal(await operatorScript('provisionIntegrityIndexes.js', ['--allow-index-creation']), 1);
  assert.equal(await Restaurant.countDocuments(), count);
});
