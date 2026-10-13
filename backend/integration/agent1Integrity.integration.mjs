import assert from 'node:assert/strict';
import test, { before, after } from 'node:test';
import mongoose from 'mongoose';
import { Restaurant } from '../src/models/Restaurant.js';
import { Teuda } from '../src/models/Teuda.js';
import { Report } from '../src/models/Report.js';
import { User } from '../src/models/User.js';
import { ImageCleanup } from '../src/models/ImageCleanup.js';
import { env } from '../src/config/env.js';
import { v2 as cloudinary } from 'cloudinary';
import { retryImageCleanupService } from '../src/services/imageCleanupService.js';
import { createRestaurantByAdminService, deleteRestaurantService } from '../src/services/adminRestaurantService.js';
import { deleteTeudaService } from '../src/services/adminTeudaService.js';
import { submitRestaurantService } from '../src/services/restaurantSubmissionService.js';
import { submitTeudaService } from '../src/services/teudaSubmissionService.js';
import { submitReportService } from '../src/services/reportSubmissionService.js';
before(async () => {
  const uri = new URL(process.env.AGENT1_ISOLATED_URI);
  assert.equal(uri.hostname, '127.0.0.1'); assert.equal(uri.pathname, '/agent1_disposable');
  assert.equal(uri.searchParams.get('replicaSet'), process.env.AGENT1_REPLICA_SET);
  await mongoose.connect(uri.href); await Promise.all([Restaurant.init(), Teuda.init(), Report.init(), User.init(), ImageCleanup.init()]);
});

test('final cascade failure also rolls back cleanup jobs; committed cleanup survives failures and retries', async () => {
  const { restaurant, teuda, report } = await fixture();
  const publicId = 'synthetic-fixture-only';
  await Teuda.updateOne({ _id: teuda._id }, { $set: { cloudinaryPublicId: publicId } });
  const original = Restaurant.collection.findOneAndDelete;
  Restaurant.collection.findOneAndDelete = async () => { throw new Error('injected final deletion failure'); };
  try { await assert.rejects(deleteRestaurantService({ restaurantId: restaurant._id }), /injected final deletion failure/); }
  finally { Restaurant.collection.findOneAndDelete = original; }
  assert.ok(await Teuda.findById(teuda._id)); assert.ok(await Report.findById(report._id));
  assert.equal(await ImageCleanup.countDocuments({ publicId }), 0);
  await deleteRestaurantService({ restaurantId: restaurant._id });
  const deferred = await ImageCleanup.findOne({ publicId });
  assert.ok(deferred); assert.equal(deferred.lastFailure, 'NOT_CONFIGURED');
  const destroy = cloudinary.uploader.destroy;
  cloudinary.uploader.destroy = async (id) => { assert.equal(id, publicId); throw new Error('injected external failure'); };
  Object.assign(env, { cloudinaryCloudName: 'synthetic', cloudinaryApiKey: 'synthetic', cloudinaryApiSecret: 'synthetic' });
  try {
    await retryImageCleanupService([publicId]);
    assert.equal((await ImageCleanup.findOne({ publicId })).lastFailure, 'CLEANUP_FAILED');
    // Simulate destroy succeeding but process/DB acknowledgement failing. The job remains retryable.
    cloudinary.uploader.destroy = async () => ({ result: 'ok' });
    const ack = ImageCleanup.collection.deleteOne;
    ImageCleanup.collection.deleteOne = async () => { throw new Error('injected cleanup acknowledgement failure'); };
    try { await retryImageCleanupService([publicId]); } finally { ImageCleanup.collection.deleteOne = ack; }
    assert.ok(await ImageCleanup.findOne({ publicId }));
    cloudinary.uploader.destroy = async () => ({ result: 'not found' });
    await retryImageCleanupService([publicId]);
    assert.equal(await ImageCleanup.findOne({ publicId }), null);
  } finally {
    cloudinary.uploader.destroy = destroy;
    Object.assign(env, { cloudinaryCloudName: '', cloudinaryApiKey: '', cloudinaryApiSecret: '' });
  }
});

test('restaurant deletion races with new certificates and reports without leaving orphan children', async () => {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { restaurant, user } = await fixture();
    const results = await Promise.allSettled([
      deleteRestaurantService({ restaurantId: restaurant._id }),
      submitTeudaService({ restaurantId: restaurant._id, user,
        teudaData: { hechsher: 'LOCAL_RABBANUT', mashgiachName: 'Concurrent fixture' } }),
      submitReportService({ user, reportData: { restaurantId: restaurant._id, description: 'Concurrent report' } }),
    ]);
    assert.equal(results[0].status, 'fulfilled');
    assert.equal(await Restaurant.findById(restaurant._id), null);
    assert.equal(await Teuda.countDocuments({ restaurant: restaurant._id }), 0);
    assert.equal(await Report.countDocuments({ restaurant: restaurant._id }), 0);
  }
});

test('certificate deletion races with a new report without leaving its removed certificate linked', async () => {
  const { restaurant, teuda, user } = await fixture();
  await Teuda.updateOne({ _id: teuda._id }, { $set: { status: 'APPROVED' } });
  const results = await Promise.allSettled([
    deleteTeudaService({ teudaId: teuda._id }),
    submitReportService({ user, reportData: { restaurantId: restaurant._id, teudaId: teuda._id, description: 'Concurrent certificate report' } }),
  ]);
  assert.equal(results[0].status, 'fulfilled');
  assert.equal(await Teuda.findById(teuda._id), null);
  assert.equal(await Report.countDocuments({ teuda: teuda._id }), 0);
});
after(async () => mongoose.disconnect());
let sequence = 0;
async function fixture() {
  const user = await User.create({ email: `integrity${++sequence}@example.invalid`, passwordHash: 'fixture', role: 'USER' });
  const restaurant = await Restaurant.create({ name: `Integrity fixture ${sequence}`, address: 'Fixture', submittedBy: user._id, status: 'APPROVED' });
  const teuda = await Teuda.create({ restaurant: restaurant._id, submittedBy: user._id,
    hechsher: 'LOCAL_RABBANUT', kashrutLevel: 'RABBANUT', expirationDate: new Date('2027-01-01') });
  const report = await Report.create({ restaurant: restaurant._id, teuda: teuda._id, submittedBy: user._id, description: 'Integrity fixture' });
  return { user, restaurant, teuda, report };
}
test('failure between cascade deletes preserves all database evidence and retry succeeds', async () => {
  const { restaurant, teuda, report } = await fixture();
  const original = Report.collection.deleteMany;
  Report.collection.deleteMany = async () => { throw new Error('injected cascade failure'); };
  try { await assert.rejects(deleteRestaurantService({ restaurantId: restaurant._id }), /injected cascade failure/); }
  finally { Report.collection.deleteMany = original; }
  assert.ok(await Restaurant.findById(restaurant._id));
  assert.ok(await Teuda.findById(teuda._id));
  assert.ok(await Report.findById(report._id));
  await deleteRestaurantService({ restaurantId: restaurant._id });
  assert.equal(await Restaurant.findById(restaurant._id), null);
  assert.equal(await Teuda.findById(teuda._id), null);
  assert.equal(await Report.findById(report._id), null);
});
test('failure unlinking certificate reports cannot leave a dangling reference', async () => {
  const { teuda, report } = await fixture();
  const original = Report.collection.updateMany;
  Report.collection.updateMany = async () => { throw new Error('injected unlink failure'); };
  try { await assert.rejects(deleteTeudaService({ teudaId: teuda._id }), /injected unlink failure/); }
  finally { Report.collection.updateMany = original; }
  assert.ok(await Teuda.findById(teuda._id));
  assert.equal(String((await Report.findById(report._id)).teuda), String(teuda._id));
  await deleteTeudaService({ teudaId: teuda._id });
  assert.equal(await Teuda.findById(teuda._id), null);
  assert.equal((await Report.findById(report._id)).teuda, undefined);
});
test('failed restaurant-plus-certificate creation needs no compensating database delete', async () => {
  const { user } = await fixture();
  const insert = Teuda.collection.insertOne, remove = Restaurant.collection.findOneAndDelete;
  Teuda.collection.insertOne = async () => { throw new Error('injected certificate insert failure'); };
  Restaurant.collection.findOneAndDelete = async () => { throw new Error('injected compensation failure'); };
  try {
    await assert.rejects(submitRestaurantService({ user,
      restaurantData: { name: 'Atomic creation fixture', address: 'Atomic fixture', latitude: 31.77, longitude: 35.21 },
      teudaData: { hechsher: 'LOCAL_RABBANUT', mashgiachName: 'Fixture' } }), /injected certificate insert failure/);
  } finally { Teuda.collection.insertOne = insert; Restaurant.collection.findOneAndDelete = remove; }
  assert.equal(await Restaurant.countDocuments({ name: 'Atomic creation fixture' }), 0);
});

test('administrator certificate insert failure rolls back its authoritative restaurant and queues failed upload cleanup', async () => {
  const { user: admin } = await fixture(); await User.updateOne({ _id: admin._id }, { $set: { role: 'ADMIN' } });
  const insert = Teuda.collection.insertOne, stream = cloudinary.uploader.upload_stream, destroy = cloudinary.uploader.destroy;
  const publicId = 'synthetic-admin-upload';
  // Mock only the external SDK; service validation and all persistence use real implementations.
  cloudinary.uploader.upload_stream = (options, callback) => ({ end: () => callback(null, { secure_url: 'https://example.invalid/photo.jpg', public_id: publicId }) });
  cloudinary.uploader.destroy = async () => { throw new Error('injected failed upload cleanup'); };
  Object.assign(env, { cloudinaryCloudName: 'synthetic', cloudinaryApiKey: 'synthetic', cloudinaryApiSecret: 'synthetic' });
  Teuda.collection.insertOne = async () => { throw new Error('injected admin insert failure'); };
  const buffer = Buffer.alloc(16); buffer.set([0xff, 0xd8, 0xff]);
  try {
    await assert.rejects(createRestaurantByAdminService({ admin, extras: {},
      restaurantData: { name: 'Atomic admin fixture', address: 'Fixture', foodType: 'DAIRY', categories: ['RESTAURANT'] },
      teudaData: { hechsher: 'LOCAL_RABBANUT', kashrutLevel: 'RABBANUT', expirationDate: '2027-01-01' },
      file: { buffer, size: buffer.length } }), /injected admin insert failure/);
    assert.equal(await Restaurant.countDocuments({ name: 'Atomic admin fixture' }), 0);
    assert.ok(await ImageCleanup.findOne({ publicId }));
  } finally {
    Teuda.collection.insertOne = insert; cloudinary.uploader.upload_stream = stream; cloudinary.uploader.destroy = destroy;
    Object.assign(env, { cloudinaryCloudName: '', cloudinaryApiKey: '', cloudinaryApiSecret: '' });
  }
});
