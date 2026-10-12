// NEW (Backend QA): live-database regression for two identical pending reports.
// חדש (בדיקת שרת): בדיקת רגרסיה מול מסד אמיתי לשני דיווחים ממתינים זהים.
// Run: $env:AGENT2_DB_TEST='1'; node --test integration/concurrentReportSubmission.integration.mjs
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import test, { after, before } from 'node:test';
import { AGENT2_NAME_PREFIX } from './assertSafeAgent2Database.mjs';
import {
  agent2Models,
  connectAgent2,
  deleteAgent2Records,
  disconnectAgent2,
  ensureReportIndexes,
} from './agent2Database.mjs';

const DUPLICATE_MESSAGE = 'You already sent this report and it is waiting for review';

let models;
let sequence = 0;

before(async () => {
  const target = await connectAgent2();
  assert.equal(target.database, 'kosherradar_agent2_test');
  assert.equal(target.resolvedHost, '127.0.0.1');
  models = await agent2Models();
  await deleteAgent2Records();
  await ensureReportIndexes();
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
    email: `agent2+report-${sequence}@example.invalid`,
    passwordHash,
    role: 'USER',
  });
}

async function makeApprovedRestaurant(user) {
  sequence += 1;
  return models.Restaurant.create({
    name: `${AGENT2_NAME_PREFIX}Report Place ${sequence}`,
    address: `${sequence} Agent2 Report Street`,
    city: 'Jerusalem',
    latitude: 31.77,
    longitude: 35.23,
    status: 'APPROVED',
    submittedBy: user._id,
    claimedHechsher: 'LOCAL_RABBANUT',
  });
}

async function makePublicTeuda(restaurant, user) {
  return models.Teuda.create({
    restaurant: restaurant._id,
    hechsher: 'LOCAL_RABBANUT',
    kashrutLevel: 'MEHADRIN',
    expirationDate: new Date('2027-12-01T00:00:00.000Z'),
    status: 'APPROVED',
    submittedBy: user._id,
  });
}

function assertOneReport(results) {
  const winners = results.filter((result) => result.ok);
  const conflicts = results.filter((result) => result.status === 409);
  const summary = results.map((result) => (result.ok ? 'created' : `status ${result.status}`)).join(', ');

  assert.equal(winners.length, 1, `expected one report, saw: ${summary}`);
  assert.equal(conflicts.length, 1, `expected one conflict, saw: ${summary}`);
  assert.equal(conflicts[0].message, DUPLICATE_MESSAGE);
  assert.equal(winners[0].value.status, 'PENDING');
  return winners[0].value;
}

async function pointsOf(userId) {
  const user = await models.User.findById(userId).select('+awardedPointKeys');
  return { points: user.points, awardedPointKeys: user.awardedPointKeys };
}

test('two concurrent identical reports leave one pending report and award no points', async () => {
  const user = await makeUser();
  const restaurant = await makeApprovedRestaurant(user);
  const reportData = {
    restaurantId: String(restaurant._id),
    description: 'הכשרות המוצגת לא תואמת את התעודה',
    type: 'GENERAL',
  };
  const results = await Promise.all([
    capture(() => models.submitReportService({ reportData, user })),
    capture(() => models.submitReportService({ reportData, user })),
  ]);
  const winner = assertOneReport(results);

  assert.equal(await models.Report.countDocuments({ restaurant: restaurant._id, status: 'PENDING' }), 1);
  assert.deepEqual(await pointsOf(user._id), { points: 0, awardedPointKeys: [] });

  const resolved = await models.resolveReportService({
    reportId: winner.id,
    resolution: 'CORRECTION_ALREADY_MADE',
  });

  assert.equal(resolved.points.awarded, true);
  assert.equal(resolved.points.points, 1);
  assert.deepEqual(await pointsOf(user._id), { points: 1, awardedPointKeys: [`REPORT:${winner.id}`] });
  assert.equal(await models.Report.countDocuments({ restaurant: restaurant._id }), 1);
});

test('a long identical description still collapses to one pending report', async () => {
  const user = await makeUser();
  const restaurant = await makeApprovedRestaurant(user);
  const reportData = {
    restaurantId: String(restaurant._id),
    description: `Agent2 long report ${'א'.repeat(1500)}`,
  };
  const results = await Promise.all([
    capture(() => models.submitReportService({ reportData, user })),
    capture(() => models.submitReportService({ reportData, user })),
  ]);

  assertOneReport(results);
  assert.equal(await models.Report.countDocuments({ restaurant: restaurant._id }), 1);
});

test('a second sequential report with the same text returns 409', async () => {
  const user = await makeUser();
  const restaurant = await makeApprovedRestaurant(user);
  const reportData = { restaurantId: String(restaurant._id), description: 'The phone number on the door is old' };
  const created = await models.submitReportService({ reportData, user });
  const duplicate = await capture(() => models.submitReportService({ reportData, user }));

  assert.equal(created.status, 'PENDING');
  assert.equal(duplicate.status, 409);
  assert.equal(duplicate.message, DUPLICATE_MESSAGE);
  assert.equal(await models.Report.countDocuments({ restaurant: restaurant._id }), 1);
});

test('spacing around the same text is still the same pending report', async () => {
  const user = await makeUser();
  const restaurant = await makeApprovedRestaurant(user);
  await models.submitReportService({
    reportData: { restaurantId: String(restaurant._id), description: 'The hours are wrong' },
    user,
  });
  const duplicate = await capture(() =>
    models.submitReportService({
      reportData: { restaurantId: String(restaurant._id), description: '  The hours are wrong  ' },
      user,
    })
  );

  assert.equal(duplicate.status, 409);
  assert.equal(await models.Report.countDocuments({ restaurant: restaurant._id }), 1);
});

test('a different description, a different user, and different letter case are not the same report', async () => {
  const user = await makeUser();
  const otherUser = await makeUser();
  const restaurant = await makeApprovedRestaurant(user);
  const restaurantId = String(restaurant._id);
  const first = await models.submitReportService({
    reportData: { restaurantId, description: 'Closed on Sundays' },
    user,
  });
  const differentText = await models.submitReportService({
    reportData: { restaurantId, description: 'The menu link is broken' },
    user,
  });
  const differentCase = await models.submitReportService({
    reportData: { restaurantId, description: 'closed on sundays' },
    user,
  });
  const other = await models.submitReportService({
    reportData: { restaurantId, description: 'Closed on Sundays' },
    user: otherUser,
  });

  assert.equal(new Set([first.id, differentText.id, differentCase.id, other.id]).size, 4);
  assert.equal(await models.Report.countDocuments({ restaurant: restaurant._id, status: 'PENDING' }), 4);
});

test('report type and proposed correction do not make the same text a different report', async () => {
  const user = await makeUser();
  const restaurant = await makeApprovedRestaurant(user);
  const restaurantId = String(restaurant._id);
  await models.submitReportService({
    reportData: { restaurantId, description: 'This should be Mehadrin', type: 'GENERAL' },
    user,
  });
  const duplicate = await capture(() =>
    models.submitReportService({
      reportData: {
        restaurantId,
        description: 'This should be Mehadrin',
        type: 'KASHRUT_UPDATE',
        proposedKashrutLevel: 'MEHADRIN',
      },
      user,
    })
  );

  assert.equal(duplicate.status, 409);
  assert.equal(await models.Report.countDocuments({ restaurant: restaurant._id }), 1);
});

test('the same text about a different certificate is a different report', async () => {
  const user = await makeUser();
  const restaurant = await makeApprovedRestaurant(user);
  const firstTeuda = await makePublicTeuda(restaurant, user);
  const secondTeuda = await makePublicTeuda(restaurant, user);
  const restaurantId = String(restaurant._id);
  const description = 'The expiration date on this certificate is wrong';
  const aboutFirst = await models.submitReportService({
    reportData: { restaurantId, teudaId: String(firstTeuda._id), description },
    user,
  });
  const aboutSecond = await models.submitReportService({
    reportData: { restaurantId, teudaId: String(secondTeuda._id), description },
    user,
  });
  const aboutRestaurant = await models.submitReportService({
    reportData: { restaurantId, description },
    user,
  });

  assert.equal(new Set([aboutFirst.id, aboutSecond.id, aboutRestaurant.id]).size, 3);
});

test('a resolved or rejected report can be sent again', async () => {
  const user = await makeUser();
  const restaurant = await makeApprovedRestaurant(user);
  const reportData = { restaurantId: String(restaurant._id), description: 'Please check this again' };
  const resolved = await models.submitReportService({ reportData, user });
  await models.Report.updateOne(
    { _id: resolved.id },
    { $set: { status: 'RESOLVED', correctionApplied: false } }
  );
  const again = await models.submitReportService({ reportData, user });

  assert.notEqual(again.id, resolved.id);
  assert.equal(again.status, 'PENDING');

  await models.Report.updateOne(
    { _id: again.id },
    { $set: { status: 'REJECTED', rejectionReason: 'Not a kashrut problem', correctionApplied: false } }
  );
  const afterRejection = await models.submitReportService({ reportData, user });

  assert.equal(afterRejection.status, 'PENDING');
  assert.equal(await models.Report.countDocuments({ restaurant: restaurant._id, status: 'PENDING' }), 1);
});
