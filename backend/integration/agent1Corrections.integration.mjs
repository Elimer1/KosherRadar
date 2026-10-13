import assert from 'node:assert/strict';
import test, { before, after } from 'node:test';
import mongoose from 'mongoose';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { Restaurant } from '../src/models/Restaurant.js';
import { Teuda } from '../src/models/Teuda.js';
import { Report } from '../src/models/Report.js';
import { User } from '../src/models/User.js';
import { resolveReportService } from '../src/services/adminReportService.js';
before(async () => {
  const uri = new URL(process.env.AGENT1_ISOLATED_URI);
  assert.equal(uri.hostname, '127.0.0.1'); assert.equal(uri.pathname, '/agent1_disposable');
  assert.equal(uri.searchParams.get('replicaSet'), process.env.AGENT1_REPLICA_SET);
  await mongoose.connect(uri.href); await Promise.all([Restaurant.init(), Teuda.init(), Report.init(), User.init()]);
});
after(async () => mongoose.disconnect());
let sequence = 0;
async function fixture(role = 'USER') {
  const user = await User.create({ email: `correction${++sequence}@example.invalid`, passwordHash: 'fixture', role });
  const restaurant = await Restaurant.create({ name: `Correction fixture ${sequence}`, address: 'Fixture', submittedBy: user._id, status: 'APPROVED' });
  const teuda = await Teuda.create({ restaurant: restaurant._id, submittedBy: user._id, status: 'APPROVED',
    hechsher: 'LOCAL_RABBANUT', kashrutLevel: 'RABBANUT', expirationDate: new Date('2027-01-01') });
  const report = await Report.create({ restaurant: restaurant._id, teuda: teuda._id, submittedBy: user._id,
    description: 'Correction fixture', type: 'KASHRUT_UPDATE', proposedKashrutLevel: 'MEHADRIN' });
  return { user, restaurant, teuda, report };
}
test('concurrent retry cannot award while a correction is in flight and then fails', async () => {
  const { user, teuda, report } = await fixture();
  let entered, release;
  const waiting = new Promise((done) => { entered = done; });
  const gate = new Promise((done) => { release = done; });
  const update = Teuda.collection.updateOne;
  Teuda.collection.updateOne = async function (...args) {
    if (String(args[0]._id) === String(teuda._id)) { entered(); await gate; throw new Error('injected correction failure'); }
    return update.apply(this, args);
  };
  const first = resolveReportService({ reportId: report._id, resolution: 'APPLY_PROPOSED' }).catch((error) => error);
  let second;
  try {
    await waiting;
    second = resolveReportService({ reportId: report._id, resolution: 'NO_CORRECTION' }).catch((error) => error);
    await new Promise((done) => setTimeout(done, 150));
    assert.equal((await User.findById(user._id)).points, 0);
    assert.equal((await Report.findById(report._id)).status, 'PENDING');
  } finally {
    release(); await first; if (second) await second; Teuda.collection.updateOne = update;
  }
  assert.equal((await Teuda.findById(teuda._id)).kashrutLevel, 'RABBANUT');
  assert.equal((await User.findById(user._id)).points, 0);
});
test('successful concurrent corrections commit once and never award to administrators', async () => {
  for (const role of ['USER', 'ADMIN']) {
    const { user, teuda, report } = await fixture(role);
    const calls = await Promise.allSettled(Array.from({ length: 3 }, () => resolveReportService({ reportId: report._id, resolution: 'APPLY_PROPOSED' })));
    assert.ok(calls.some((call) => call.status === 'fulfilled'));
    assert.equal((await Teuda.findById(teuda._id)).kashrutLevel, 'MEHADRIN');
    assert.equal((await Report.findById(report._id)).status, 'RESOLVED');
    assert.equal((await User.findById(user._id)).points, role === 'USER' ? 1 : 0);
    await resolveReportService({ reportId: report._id, resolution: 'APPLY_PROPOSED' });
    assert.equal((await User.findById(user._id)).points, role === 'USER' ? 1 : 0);
  }
});
test('award failure cannot leave correction and resolution committed', async () => {
  const { user, teuda, report } = await fixture();
  const update = User.collection.findOneAndUpdate;
  User.collection.findOneAndUpdate = async () => { throw new Error('injected award failure'); };
  try {
    await assert.rejects(resolveReportService({ reportId: report._id, resolution: 'APPLY_PROPOSED' }), /injected award failure/);
  } finally { User.collection.findOneAndUpdate = update; }
  assert.equal((await Report.findById(report._id)).status, 'PENDING');
  assert.equal((await Teuda.findById(teuda._id)).kashrutLevel, 'RABBANUT');
  assert.equal((await User.findById(user._id)).points, 0);
  await resolveReportService({ reportId: report._id, resolution: 'APPLY_PROPOSED' });
  assert.equal((await User.findById(user._id)).points, 1);
});

test('process interruption before correction completion leaves no resolution or points and supports retry', { timeout: 45000 }, async () => {
  const { user, teuda, report } = await fixture();
  const source = `
    import mongoose from ${JSON.stringify(new URL('../node_modules/mongoose/index.js', import.meta.url).href)};
    import { Teuda } from ${JSON.stringify(new URL('../src/models/Teuda.js', import.meta.url).href)};
    import { resolveReportService } from ${JSON.stringify(new URL('../src/services/adminReportService.js', import.meta.url).href)};
    await mongoose.connect(process.env.AGENT1_ISOLATED_URI);
    Teuda.collection.updateOne = async () => { process.send('paused'); await new Promise(() => {}); };
    await resolveReportService({ reportId: ${JSON.stringify(String(report._id))}, resolution: 'APPLY_PROPOSED' });
  `;
  const child = spawn(process.execPath, ['--input-type=module', '-e', source], {
    windowsHide: true, stdio: ['ignore', 'ignore', 'inherit', 'ipc'], env: process.env,
  });
  try {
    await Promise.race([once(child, 'message'), once(child, 'exit').then(() => { throw new Error('Worker exited before pause'); })]);
    const exited = once(child, 'exit'); child.kill(); await exited;
    assert.equal((await Report.findById(report._id)).status, 'PENDING');
    assert.equal((await Teuda.findById(teuda._id)).kashrutLevel, 'RABBANUT');
    assert.equal((await User.findById(user._id)).points, 0);
    await resolveReportService({ reportId: report._id, resolution: 'APPLY_PROPOSED' });
    assert.equal((await User.findById(user._id)).points, 1);
  } finally { if (child.exitCode === null && child.signalCode === null) child.kill(); }
});
