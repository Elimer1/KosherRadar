import assert from 'node:assert/strict';
import test, { before, after } from 'node:test';
import mongoose from 'mongoose';
import { Restaurant } from '../src/models/Restaurant.js';
import { Teuda } from '../src/models/Teuda.js';
import { User } from '../src/models/User.js';
import { rejectRestaurantService, approveRestaurantService } from '../src/services/adminRestaurantService.js';
before(async () => {
  const uri = new URL(process.env.AGENT1_ISOLATED_URI);
  assert.equal(uri.hostname, '127.0.0.1'); assert.equal(uri.pathname, '/agent1_disposable');
  assert.equal(uri.searchParams.get('replicaSet'), process.env.AGENT1_REPLICA_SET);
  await mongoose.connect(uri.href); await Promise.all([Restaurant.init(), Teuda.init(), User.init()]);
});
after(async () => mongoose.disconnect());
let sequence = 0;
async function fixture() {
  const user = await User.create({ email: `reject${++sequence}@example.invalid`, passwordHash: 'fixture', role: 'USER' });
  const restaurant = await Restaurant.create({ name: `Rejection fixture ${sequence}`, address: 'Fixture', submittedBy: user._id });
  const teuda = await Teuda.create({ restaurant: restaurant._id, submittedBy: user._id, hechsher: 'LOCAL_RABBANUT' });
  return { user, restaurant, teuda };
}
test('certificate rejection failure aborts restaurant rejection and a retry closes both', async () => {
  const { restaurant, teuda, user } = await fixture();
  const update = Teuda.collection.updateMany;
  Teuda.collection.updateMany = async () => { throw new Error('injected certificate rejection failure'); };
  try { await assert.rejects(rejectRestaurantService({ restaurantId: restaurant._id, reason: 'Fixture reason' }), /injected certificate rejection failure/); }
  finally { Teuda.collection.updateMany = update; }
  assert.equal((await Restaurant.findById(restaurant._id)).status, 'PENDING');
  assert.equal((await Teuda.findById(teuda._id)).status, 'PENDING');
  await rejectRestaurantService({ restaurantId: restaurant._id, reason: 'Fixture reason' });
  assert.equal((await Restaurant.findById(restaurant._id)).status, 'REJECTED');
  assert.equal((await Teuda.findById(teuda._id)).status, 'REJECTED');
  assert.equal((await User.findById(user._id)).points, 0);
});
test('concurrent approval/rejection preserves a consistent moderation outcome', async () => {
  const { restaurant, teuda } = await fixture();
  const results = await Promise.allSettled([
    rejectRestaurantService({ restaurantId: restaurant._id, reason: 'Fixture reason' }),
    approveRestaurantService({ restaurantId: restaurant._id }),
  ]);
  assert.ok(results.some((result) => result.status === 'fulfilled'));
  const current = await Restaurant.findById(restaurant._id), certificate = await Teuda.findById(teuda._id);
  assert.ok(['APPROVED', 'REJECTED'].includes(current.status));
  assert.equal(certificate.status, current.status === 'REJECTED' ? 'REJECTED' : 'PENDING');
});
