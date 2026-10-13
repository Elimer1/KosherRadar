import assert from 'node:assert/strict';
import test, { before, after } from 'node:test';
import mongoose from 'mongoose';
import { Restaurant } from '../src/models/Restaurant.js';
import { Teuda } from '../src/models/Teuda.js';
import { User } from '../src/models/User.js';
import { submitRestaurantService } from '../src/services/restaurantSubmissionService.js';
import { submitTeudaService } from '../src/services/teudaSubmissionService.js';
import { createRestaurantByAdminService } from '../src/services/adminRestaurantService.js';
before(async () => {
  const uri = new URL(process.env.AGENT1_ISOLATED_URI);
  assert.equal(uri.hostname, '127.0.0.1'); assert.equal(uri.pathname, '/agent1_disposable');
  assert.equal(uri.searchParams.get('replicaSet'), process.env.AGENT1_REPLICA_SET);
  await mongoose.connect(uri.href); await Promise.all([Restaurant.init(), Teuda.init(), User.init()]);
});
after(async () => mongoose.disconnect());
test('real persistence separates authoritative administrators from moderated users with zero admin points', async () => {
  const admin = await User.create({ email: 'admin@example.invalid', passwordHash: 'fixture', role: 'ADMIN' });
  const user = await User.create({ email: 'user@example.invalid', passwordHash: 'fixture', role: 'USER' });
  const restaurantData = { name: 'Authority fixture', address: '1 Fixture street', city: 'Jerusalem', latitude: 31.77,
    longitude: 35.21, foodType: 'DAIRY', categories: ['RESTAURANT'], claimedHechsher: 'LOCAL_RABBANUT' };
  await assert.rejects(submitRestaurantService({ restaurantData, user: admin }), { statusCode: 403 });
  assert.equal(await Restaurant.countDocuments(), 0);
  const authoritative = await createRestaurantByAdminService({ restaurantData, extras: {}, admin });
  assert.equal(authoritative.restaurant.status, 'APPROVED');
  await assert.rejects(submitTeudaService({ restaurantId: authoritative.restaurant.id,
    teudaData: { hechsher: 'LOCAL_RABBANUT', mashgiachName: 'Fixture' }, user: admin }), { statusCode: 403 });
  assert.equal(await Teuda.countDocuments(), 0);
  const pending = await submitRestaurantService({ restaurantData, user });
  assert.equal(pending.restaurant.status, 'PENDING');
  const certificate = await submitTeudaService({ restaurantId: authoritative.restaurant.id,
    teudaData: { hechsher: 'LOCAL_RABBANUT', mashgiachName: 'Fixture' }, user });
  assert.equal(certificate.status, 'PENDING');
  assert.equal((await User.findById(admin._id)).points, 0);
});
