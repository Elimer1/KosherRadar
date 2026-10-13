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
test('startup rejects a leftover broader pending identity without changing its catalog or records', async () => {
  await Restaurant.collection.createIndex({ submittedBy: 1, nameNormalized: 1, addressNormalized: 1 }, {
    name: 'pending_submitter_name_address', unique: true, partialFilterExpression: { status: 'PENDING' },
  });
  try {
    const before = await Restaurant.collection.listIndexes().toArray();
    const count = await Restaurant.countDocuments();
    await assert.rejects(assertUniqueIndexesRepo(), /obsolete.*pending_submitter_name_address/i);
    assert.deepEqual(await Restaurant.collection.listIndexes().toArray(), before);
    assert.equal(await Restaurant.countDocuments(), count);
  } finally {
    // This database belongs only to the disposable test runner.
    await Restaurant.collection.dropIndex('pending_submitter_name_address');
  }
});
test('city-aware identity admits cross-city branches and serializes normalized same-city inserts', async () => {
  const user = await User.create({ email: 'city-index@example.invalid', passwordHash: 'fixture' });
  const input = { name: 'City branch', address: 'Main 1', city: 'Jerusalem', submittedBy: user._id };
  const first = await Restaurant.create(input);
  await Restaurant.create({ ...input, city: 'Haifa' });
  const concurrent = await Promise.allSettled([
    Restaurant.create({ ...input, city: ' Tel Aviv! ' }),
    Restaurant.create({ ...input, city: 'TEL AVIV' }),
  ]);
  assert.equal(concurrent.filter((r) => r.status === 'fulfilled').length, 1);
  assert.equal(concurrent.find((r) => r.status === 'rejected').reason.code, 11000);
  assert.equal((await Restaurant.findById(first._id)).cityNormalized, 'jerusalem');
});
test('legacy pending locality is detected without a backfill and gains identity on save', async () => {
  const { findPendingRestaurantBySubmitterRepo } = await import('../src/repositories/restaurantRepository.js');
  const user = await User.create({ email: 'legacy-city@example.invalid', passwordHash: 'fixture' });
  const input = { name: 'Legacy branch', address: 'Main 1', city: '  JERUSALEM!  ', submittedBy: user._id,
    nameNormalized: 'legacy branch', addressNormalized: 'main 1', status: 'PENDING' };
  const { insertedId } = await Restaurant.collection.insertOne(input);
  const lookup = { submittedBy: user._id, nameNormalized: input.nameNormalized, addressNormalized: input.addressNormalized };
  assert.equal(String((await findPendingRestaurantBySubmitterRepo({ ...lookup, cityNormalized: 'jerusalem' }))._id), String(insertedId));
  assert.equal(await findPendingRestaurantBySubmitterRepo({ ...lookup, cityNormalized: 'haifa' }), null);
  assert.equal((await Restaurant.collection.findOne({ _id: insertedId })).cityNormalized, undefined);
  const legacy = await Restaurant.findById(insertedId); await legacy.save();
  assert.equal((await Restaurant.collection.findOne({ _id: insertedId })).cityNormalized, 'jerusalem');
  await assert.rejects(Restaurant.create(input), { code: 11000 });
});
test('startup rejects a same-name index with weakened uniqueness and never repairs it implicitly', async () => {
  await Restaurant.collection.dropIndex('pending_submitter_name_address_city');
  await Restaurant.collection.createIndex({ submittedBy: 1, nameNormalized: 1, addressNormalized: 1, cityNormalized: 1 }, {
    name: 'pending_submitter_name_address_city', partialFilterExpression: { status: 'PENDING', cityNormalized: { $type: 'string' } },
  });
  await assert.rejects(assertUniqueIndexesRepo(), /restaurants:pending_submitter_name_address_city/);
  const index = (await Restaurant.collection.listIndexes().toArray()).find((index) => index.name === 'pending_submitter_name_address_city');
  assert.equal(index.unique, undefined);
});
test('a unique index with the wrong moderation filter is insufficient enforcement', async () => {
  await Restaurant.collection.dropIndex('pending_submitter_name_address_city');
  await Restaurant.collection.createIndex({ submittedBy: 1, nameNormalized: 1, addressNormalized: 1, cityNormalized: 1 }, {
    name: 'pending_submitter_name_address_city', unique: true, partialFilterExpression: { status: 'APPROVED' },
  });
  await assert.rejects(assertUniqueIndexesRepo(), /restaurants:pending_submitter_name_address_city/);
  const count = await Restaurant.countDocuments();
  assert.equal(await operatorScript('provisionIntegrityIndexes.js', ['--allow-index-creation']), 1);
  assert.equal(await Restaurant.countDocuments(), count);
});
