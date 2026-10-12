// NEW (Backend QA): live-database regression for two identical pending certificate submissions.
// חדש (בדיקת שרת): בדיקת רגרסיה מול מסד אמיתי לשתי הגשות ממתינות זהות של תעודה.
// Run: $env:AGENT2_DB_TEST='1'; node --test integration/concurrentCertificateSubmission.integration.mjs
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import test, { after, before } from 'node:test';
import { AGENT2_NAME_PREFIX } from './assertSafeAgent2Database.mjs';
import {
  agent2Models,
  connectAgent2,
  deleteAgent2Records,
  disconnectAgent2,
  ensureTeudaIndexes,
} from './agent2Database.mjs';

const DUPLICATE_MESSAGE = 'You already submitted this certificate and it is waiting for review';

let models;
let sequence = 0;

before(async () => {
  const target = await connectAgent2();
  assert.equal(target.database, 'kosherradar_agent2_test');
  assert.equal(target.resolvedHost, '127.0.0.1');
  models = await agent2Models();
  await deleteAgent2Records();
  await ensureTeudaIndexes();
});

after(async () => {
  await deleteAgent2Records();
  await disconnectAgent2();
});

async function capture(fn) {
  try {
    return { ok: true, value: await fn() };
  } catch (error) {
    return { ok: false, status: error.statusCode, message: error.message };
  }
}

async function makeUser() {
  sequence += 1;
  const passwordHash = await models.bcrypt.hash(randomBytes(12).toString('base64url'), 4);
  return models.User.create({
    email: `agent2+certificate-${sequence}@example.invalid`,
    passwordHash,
    role: 'USER',
  });
}

async function makeApprovedRestaurant(user) {
  sequence += 1;
  return models.Restaurant.create({
    name: `${AGENT2_NAME_PREFIX}Certificate Place ${sequence}`,
    address: `${sequence} Agent2 Certificate Street`,
    city: 'Jerusalem',
    latitude: 31.77,
    longitude: 35.23,
    status: 'APPROVED',
    submittedBy: user._id,
    claimedHechsher: 'LOCAL_RABBANUT',
  });
}

function assertOneCertificate(results) {
  const winners = results.filter((result) => result.ok);
  const conflicts = results.filter((result) => result.status === 409);
  const summary = results.map((result) => (result.ok ? 'created' : `status ${result.status}`)).join(', ');

  assert.equal(winners.length, 1, `expected one certificate, saw: ${summary}`);
  assert.equal(conflicts.length, 1, `expected one conflict, saw: ${summary}`);
  assert.equal(conflicts[0].message, DUPLICATE_MESSAGE);
  assert.equal(winners[0].value.status, 'PENDING');
  return winners[0].value;
}

test('the dated certificate index exists before concurrent submissions run', async () => {
  const indexes = await models.Teuda.collection.indexes();
  const datedIndex = indexes.find((index) => index.name === 'pending_dated_certificate_identity');

  assert.ok(datedIndex, 'pending_dated_certificate_identity was not built');
  assert.equal(datedIndex.unique, true);
  assert.equal(datedIndex.key.mashgiachName, undefined);
  assert.deepEqual(datedIndex.partialFilterExpression, {
    status: 'PENDING',
    expirationDate: { $type: 'date' },
  });

  const undatedIndex = indexes.find((index) => index.name === 'pending_undated_certificate_identity');
  assert.ok(undatedIndex, 'pending_undated_certificate_identity was not built');
  assert.equal(undatedIndex.unique, true);
  assert.equal(undatedIndex.key.mashgiachName, 1);
  assert.equal(undatedIndex.key.photoFingerprint, 1);
  assert.deepEqual(undatedIndex.partialFilterExpression, { status: 'PENDING', expirationDate: null });
});

test('two concurrent dated certificates for the same restaurant collapse to one', async () => {
  const user = await makeUser();
  const restaurant = await makeApprovedRestaurant(user);
  const teudaData = {
    hechsher: 'LOCAL_RABBANUT',
    expirationDate: '2027-12-01',
    mashgiachName: 'Agent2 Mashgiach',
    kashrutLevel: 'MEHADRIN',
  };
  const results = await Promise.all([
    capture(() => models.submitTeudaService({ restaurantId: restaurant._id, teudaData, user })),
    capture(() => models.submitTeudaService({ restaurantId: restaurant._id, teudaData, user })),
  ]);
  const winner = assertOneCertificate(results);
  const stored = await models.Teuda.find({ restaurant: restaurant._id, status: 'PENDING' });

  assert.equal(stored.length, 1);
  assert.equal(String(stored[0]._id), winner.id);
  assert.equal(stored[0].kashrutLevel, undefined);
  const account = await models.User.findById(user._id).select('+awardedPointKeys');
  assert.equal(account.points, 0);
  assert.deepEqual(account.awardedPointKeys, []);
});

test('a dated certificate with a different mashgiach is still the same pending certificate', async () => {
  const user = await makeUser();
  const restaurant = await makeApprovedRestaurant(user);
  const results = await Promise.all([
    capture(() =>
      models.submitTeudaService({
        restaurantId: restaurant._id,
        teudaData: { hechsher: 'LOCAL_RABBANUT', expirationDate: '2027-08-01', mashgiachName: 'Avi Cohen' },
        user,
      })
    ),
    capture(() =>
      models.submitTeudaService({
        restaurantId: restaurant._id,
        teudaData: { hechsher: 'LOCAL_RABBANUT', expirationDate: '2027-08-01', mashgiachName: 'Dana Levi' },
        user,
      })
    ),
  ]);

  assertOneCertificate(results);
  assert.equal(await models.Teuda.countDocuments({ restaurant: restaurant._id, status: 'PENDING' }), 1);
});

test('two concurrent identical undated certificates collapse to one', async () => {
  const user = await makeUser();
  const restaurant = await makeApprovedRestaurant(user);
  const teudaData = { hechsher: 'LOCAL_RABBANUT', mashgiachName: 'Same Mashgiach', mashgiachPhone: '0501234567' };
  const results = await Promise.all([
    capture(() => models.submitTeudaService({ restaurantId: restaurant._id, teudaData, user })),
    capture(() => models.submitTeudaService({ restaurantId: restaurant._id, teudaData, user })),
  ]);

  assertOneCertificate(results);
  assert.equal(await models.Teuda.countDocuments({ restaurant: restaurant._id, status: 'PENDING' }), 1);
});

test('undated certificates with the same mashgiach and a different phone both stay pending', async () => {
  const user = await makeUser();
  const restaurant = await makeApprovedRestaurant(user);
  const first = await models.submitTeudaService({
    restaurantId: restaurant._id,
    teudaData: { hechsher: 'LOCAL_RABBANUT', mashgiachName: 'Avi Cohen', mashgiachPhone: '0501111111' },
    user,
  });
  const second = await models.submitTeudaService({
    restaurantId: restaurant._id,
    teudaData: { hechsher: 'LOCAL_RABBANUT', mashgiachName: 'Avi Cohen', mashgiachPhone: '0502222222' },
    user,
  });

  assert.notEqual(first.id, second.id);
  assert.equal(await models.Teuda.countDocuments({ restaurant: restaurant._id, status: 'PENDING' }), 2);
});

test('a legacy undated certificate without a fingerprint still blocks a later no-photo submission', async () => {
  const user = await makeUser();
  const restaurant = await makeApprovedRestaurant(user);
  await models.Teuda.create({
    restaurant: restaurant._id,
    hechsher: 'LOCAL_RABBANUT',
    mashgiachName: 'Legacy Mashgiach',
    status: 'PENDING',
    submittedBy: user._id,
  });
  const duplicate = await capture(() =>
    models.submitTeudaService({
      restaurantId: restaurant._id,
      teudaData: { hechsher: 'LOCAL_RABBANUT', mashgiachName: 'Legacy Mashgiach' },
      user,
    })
  );

  assert.equal(duplicate.status, 409);
  assert.equal(duplicate.message, DUPLICATE_MESSAGE);
  assert.equal(await models.Teuda.countDocuments({ restaurant: restaurant._id }), 1);
});

test('undated certificates with different mashgichim both stay pending', async () => {
  const user = await makeUser();
  const restaurant = await makeApprovedRestaurant(user);
  const results = await Promise.all([
    models.submitTeudaService({
      restaurantId: restaurant._id,
      teudaData: { hechsher: 'LOCAL_RABBANUT', mashgiachName: 'Avi Cohen' },
      user,
    }),
    models.submitTeudaService({
      restaurantId: restaurant._id,
      teudaData: { hechsher: 'LOCAL_RABBANUT', mashgiachName: 'Dana Levi' },
      user,
    }),
  ]);

  assert.equal(new Set(results.map((result) => result.id)).size, 2);
  assert.equal(await models.Teuda.countDocuments({ restaurant: restaurant._id, status: 'PENDING' }), 2);
});

test('different expiration dates are different certificates', async () => {
  const user = await makeUser();
  const restaurant = await makeApprovedRestaurant(user);
  const first = await models.submitTeudaService({
    restaurantId: restaurant._id,
    teudaData: { hechsher: 'LOCAL_RABBANUT', expirationDate: '2027-03-01' },
    user,
  });
  const second = await models.submitTeudaService({
    restaurantId: restaurant._id,
    teudaData: { hechsher: 'LOCAL_RABBANUT', expirationDate: '2027-09-01' },
    user,
  });

  assert.notEqual(first.id, second.id);
  assert.equal(await models.Teuda.countDocuments({ restaurant: restaurant._id, status: 'PENDING' }), 2);
});

test('two users may submit the same dated certificate', async () => {
  const firstUser = await makeUser();
  const secondUser = await makeUser();
  const restaurant = await makeApprovedRestaurant(firstUser);
  const teudaData = { hechsher: 'BADATZ_BEIT_YOSEF', expirationDate: '2027-05-01' };
  const results = await Promise.all([
    models.submitTeudaService({ restaurantId: restaurant._id, teudaData, user: firstUser }),
    models.submitTeudaService({ restaurantId: restaurant._id, teudaData, user: secondUser }),
  ]);

  assert.equal(new Set(results.map((result) => result.id)).size, 2);
});

test('different free-text hechshers on the same date both stay pending', async () => {
  const user = await makeUser();
  const restaurant = await makeApprovedRestaurant(user);
  const first = await models.submitTeudaService({
    restaurantId: restaurant._id,
    teudaData: { hechsher: 'OTHER', hechsherOther: 'Rabbi Aleph', expirationDate: '2027-06-01' },
    user,
  });
  const second = await models.submitTeudaService({
    restaurantId: restaurant._id,
    teudaData: { hechsher: 'OTHER', hechsherOther: 'Rabbi Bet', expirationDate: '2027-06-01' },
    user,
  });

  assert.notEqual(first.id, second.id);
  assert.equal(await models.Teuda.countDocuments({ restaurant: restaurant._id, status: 'PENDING' }), 2);
});

test('the same user can submit a dated certificate again after it is rejected', async () => {
  const user = await makeUser();
  const restaurant = await makeApprovedRestaurant(user);
  const teudaData = { hechsher: 'LOCAL_RABBANUT', expirationDate: '2027-07-01' };
  const created = await models.submitTeudaService({ restaurantId: restaurant._id, teudaData, user });
  await models.Teuda.updateOne(
    { _id: created.id },
    { $set: { status: 'REJECTED', rejectionReason: 'Unreadable photo' } }
  );
  const again = await models.submitTeudaService({ restaurantId: restaurant._id, teudaData, user });

  assert.notEqual(again.id, created.id);
  assert.equal(again.status, 'PENDING');
  assert.equal(await models.Teuda.countDocuments({ restaurant: restaurant._id, status: 'PENDING' }), 1);
});

test('a second sequential dated certificate returns 409', async () => {
  const user = await makeUser();
  const restaurant = await makeApprovedRestaurant(user);
  const teudaData = { hechsher: 'LOCAL_RABBANUT', expirationDate: '2027-04-01' };
  await models.submitTeudaService({ restaurantId: restaurant._id, teudaData, user });
  const duplicate = await capture(() => models.submitTeudaService({ restaurantId: restaurant._id, teudaData, user }));

  assert.equal(duplicate.status, 409);
  assert.equal(duplicate.message, DUPLICATE_MESSAGE);
  assert.equal(await models.Teuda.countDocuments({ restaurant: restaurant._id }), 1);
});
