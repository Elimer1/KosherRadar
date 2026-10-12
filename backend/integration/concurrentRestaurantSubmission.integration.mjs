// NEW (Backend QA): live-database regression for two identical pending restaurant submissions.
// חדש (בדיקת שרת): בדיקת רגרסיה מול מסד אמיתי לשתי הגשות ממתינות זהות של מסעדה.
// Run: $env:AGENT2_DB_TEST='1'; node --test integration/concurrentRestaurantSubmission.integration.mjs
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import test, { after, before } from 'node:test';
import { AGENT2_NAME_PREFIX } from './assertSafeAgent2Database.mjs';
import {
  agent2Models,
  connectAgent2,
  deleteAgent2Records,
  disconnectAgent2,
  ensureRestaurantIndexes,
} from './agent2Database.mjs';

const DUPLICATE_MESSAGE = 'You already submitted this restaurant and it is waiting for review';

let models;
let sequence = 0;

before(async () => {
  const target = await connectAgent2();
  assert.equal(target.resolvedHost, '127.0.0.1');
  assert.equal(target.database, 'kosherradar_agent2_test');
  assert.equal(target.port, '27017');
  models = await agent2Models();
  await deleteAgent2Records();
  await ensureRestaurantIndexes();
});

after(async () => {
  await deleteAgent2Records();
  await disconnectAgent2();
});

function nextLabel(label) {
  sequence += 1;
  return `${AGENT2_NAME_PREFIX}${label} ${sequence}`;
}

async function capture(fn) {
  try {
    return { ok: true, value: await fn() };
  } catch (error) {
    return { ok: false, status: error.statusCode, message: error.message, code: error.code };
  }
}

async function makeUser() {
  const passwordHash = await models.bcrypt.hash(randomBytes(18).toString('base64url'), 4);
  sequence += 1;
  return models.User.create({
    email: `agent2+user-${sequence}@example.invalid`,
    passwordHash,
    role: 'USER',
  });
}

function restaurantInput(name, extra = {}) {
  return {
    name,
    address: '1 Agent2 Street',
    city: 'Jerusalem',
    latitude: 31.776,
    longitude: 35.234,
    phone: '0500000001',
    claimedHechsher: 'LOCAL_RABBANUT',
    ...extra,
  };
}

async function pendingCount(userId, name, address) {
  return models.Restaurant.countDocuments({
    submittedBy: userId,
    name,
    address,
    status: 'PENDING',
  });
}

async function pointsOf(userId) {
  const user = await models.User.findById(userId).select('+awardedPointKeys');
  return { points: user.points, awardedPointKeys: user.awardedPointKeys };
}

function assertSinglePendingWinner(results) {
  const winners = results.filter((result) => result.ok);
  const conflicts = results.filter((result) => result.status === 409);
  const summary = results.map((result) => (result.ok ? 'created' : `status ${result.status}`)).join(', ');

  assert.equal(winners.length, 1, `expected one create, saw: ${summary}`);
  assert.equal(conflicts.length, results.length - 1, `expected the rest to conflict, saw: ${summary}`);

  for (const conflict of conflicts) {
    assert.equal(conflict.message, DUPLICATE_MESSAGE);
  }

  assert.equal(winners[0].value.restaurant.status, 'PENDING');
  return winners[0].value;
}

test('the pending identity index exists before concurrent submissions run', async () => {
  const indexes = await models.Restaurant.collection.indexes();
  const pendingIndex = indexes.find((index) => index.name === 'pending_submitter_name_address');

  assert.ok(pendingIndex, 'pending_submitter_name_address was not built');
  assert.equal(pendingIndex.unique, true);
  assert.deepEqual(pendingIndex.key, {
    submittedBy: 1,
    nameNormalized: 1,
    addressNormalized: 1,
  });
  assert.deepEqual(pendingIndex.partialFilterExpression, { status: 'PENDING' });
});

test('two concurrent identical submissions leave one pending restaurant', async () => {
  const runs = [];

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const user = await makeUser();
    const input = restaurantInput(nextLabel('Race Place'));
    const results = await Promise.all([
      capture(() => models.submitRestaurantService({ restaurantData: input, user })),
      capture(() => models.submitRestaurantService({ restaurantData: input, user })),
    ]);

    assertSinglePendingWinner(results);
    assert.equal(await pendingCount(user._id, input.name, input.address), 1);
    assert.deepEqual(await pointsOf(user._id), { points: 0, awardedPointKeys: [] });
    runs.push(results.filter((result) => result.ok).length);
  }

  assert.deepEqual(runs, [1, 1, 1]);
});

test('concurrent submissions that normalize to the same name and address conflict', async () => {
  const user = await makeUser();
  const address = '12 Agent2 Normalization Road';
  const results = await Promise.all([
    capture(() =>
      models.submitRestaurantService({
        restaurantData: restaurantInput(`${AGENT2_NAME_PREFIX}Cafe North`, { address }),
        user,
      })
    ),
    capture(() =>
      models.submitRestaurantService({
        restaurantData: restaurantInput(`  ${AGENT2_NAME_PREFIX}cafe   north `, { address: ` ${address} ` }),
        user,
      })
    ),
  ]);

  assertSinglePendingWinner(results);
  assert.equal(
    await models.Restaurant.countDocuments({
      submittedBy: user._id,
      nameNormalized: 'agent2 cafe north',
      addressNormalized: '12 agent2 normalization road',
      status: 'PENDING',
    }),
    1
  );
});

test('a concurrent duplicate with certificate evidence creates one certificate and no points', async () => {
  const user = await makeUser();
  const input = restaurantInput(nextLabel('Race With Certificate'));
  const teudaData = { hechsher: 'LOCAL_RABBANUT', mashgiachName: 'Agent2 Mashgiach', kashrutLevel: 'MEHADRIN' };
  const results = await Promise.all([
    capture(() => models.submitRestaurantService({ restaurantData: input, teudaData, user })),
    capture(() => models.submitRestaurantService({ restaurantData: input, teudaData, user })),
  ]);
  const winner = assertSinglePendingWinner(results);

  assert.equal(winner.teuda.status, 'PENDING');
  assert.equal(await pendingCount(user._id, input.name, input.address), 1);
  assert.equal(await models.Teuda.countDocuments({ submittedBy: user._id, restaurant: winner.restaurant.id }), 1);
  const stored = await models.Teuda.findOne({ submittedBy: user._id });
  assert.equal(stored.kashrutLevel, undefined);
  assert.deepEqual(await pointsOf(user._id), { points: 0, awardedPointKeys: [] });
});

test('a second sequential submission of the same pending restaurant returns 409', async () => {
  const user = await makeUser();
  const input = restaurantInput(nextLabel('Sequential Place'));
  const created = await models.submitRestaurantService({ restaurantData: input, user });
  const duplicate = await capture(() => models.submitRestaurantService({ restaurantData: input, user }));

  assert.equal(created.restaurant.status, 'PENDING');
  assert.equal(duplicate.ok, false);
  assert.equal(duplicate.status, 409);
  assert.equal(duplicate.message, DUPLICATE_MESSAGE);
  assert.equal(await pendingCount(user._id, input.name, input.address), 1);
  assert.deepEqual(await pointsOf(user._id), { points: 0, awardedPointKeys: [] });
});

test('the same user can submit the same name at a different address', async () => {
  const user = await makeUser();
  const name = nextLabel('Branch');
  const first = await models.submitRestaurantService({
    restaurantData: restaurantInput(name, { address: '1 Agent2 Branch Street' }),
    user,
  });
  const second = await models.submitRestaurantService({
    restaurantData: restaurantInput(name, { address: '2 Agent2 Branch Street' }),
    user,
  });

  assert.equal(first.restaurant.status, 'PENDING');
  assert.equal(second.restaurant.status, 'PENDING');
  assert.notEqual(first.restaurant.id, second.restaurant.id);
  assert.equal(await models.Restaurant.countDocuments({ submittedBy: user._id, name, status: 'PENDING' }), 2);
});

test('the same user can submit a different restaurant at the same address', async () => {
  const user = await makeUser();
  const address = '9 Agent2 Shared Building';
  const first = await models.submitRestaurantService({
    restaurantData: restaurantInput(nextLabel('Shared A'), { address }),
    user,
  });
  const second = await models.submitRestaurantService({
    restaurantData: restaurantInput(nextLabel('Shared B'), { address }),
    user,
  });

  assert.notEqual(first.restaurant.id, second.restaurant.id);
  assert.equal(await models.Restaurant.countDocuments({ submittedBy: user._id, address, status: 'PENDING' }), 2);
});

test('a different phone does not make the same pending restaurant distinct', async () => {
  const user = await makeUser();
  const name = nextLabel('Phone Place');
  await models.submitRestaurantService({
    restaurantData: restaurantInput(name, { phone: '0501111111' }),
    user,
  });
  const duplicate = await capture(() =>
    models.submitRestaurantService({
      restaurantData: restaurantInput(name, { phone: '0502222222' }),
      user,
    })
  );

  assert.equal(duplicate.status, 409);
  assert.equal(await models.Restaurant.countDocuments({ submittedBy: user._id, name, status: 'PENDING' }), 1);
});

test('two users may submit the same pending restaurant', async () => {
  const firstUser = await makeUser();
  const secondUser = await makeUser();
  const input = restaurantInput(nextLabel('Shared Submission'));
  const results = await Promise.all([
    models.submitRestaurantService({ restaurantData: input, user: firstUser }),
    models.submitRestaurantService({ restaurantData: input, user: secondUser }),
  ]);

  assert.equal(results.length, 2);
  assert.notEqual(results[0].restaurant.id, results[1].restaurant.id);
  assert.equal(await models.Restaurant.countDocuments({ name: input.name, address: input.address, status: 'PENDING' }), 2);
});

test('the same user can submit again after the first copy is approved or rejected', async () => {
  const user = await makeUser();
  const approvedInput = restaurantInput(nextLabel('After Approval'));
  const approved = await models.submitRestaurantService({ restaurantData: approvedInput, user });
  await models.Restaurant.updateOne({ _id: approved.restaurant.id }, { $set: { status: 'APPROVED' } });
  const submittedAgain = await models.submitRestaurantService({ restaurantData: approvedInput, user });

  assert.equal(submittedAgain.restaurant.status, 'PENDING');
  assert.notEqual(submittedAgain.restaurant.id, approved.restaurant.id);

  const rejectedInput = restaurantInput(nextLabel('After Rejection'));
  const rejected = await models.submitRestaurantService({ restaurantData: rejectedInput, user });
  await models.Restaurant.updateOne(
    { _id: rejected.restaurant.id },
    { $set: { status: 'REJECTED', rejectionReason: 'Not a restaurant' } }
  );
  const resubmitted = await models.submitRestaurantService({ restaurantData: rejectedInput, user });

  assert.equal(resubmitted.restaurant.status, 'PENDING');
  assert.equal(await pendingCount(user._id, rejectedInput.name, rejectedInput.address), 1);
});
