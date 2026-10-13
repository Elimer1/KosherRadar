// Creates its own empty loopback replica set. Never accepts an application URI.
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { MongoClient } from 'mongodb';

if (!process.argv.includes('--run-isolated')) throw new Error('Pass --run-isolated to create disposable local test resources');
const root = resolve(await mkdtemp(join(tmpdir(), 'kosherradar-agent1-')));
const dbpath = join(root, 'db'); await mkdir(dbpath);
const listener = createServer(); listener.listen(0, '127.0.0.1'); await once(listener, 'listening');
const port = listener.address().port; await new Promise((done) => listener.close(done));
const replicaSet = `agent1_${port}`;
const mongod = spawn(process.env.AGENT1_MONGOD_BINARY || 'C:/Program Files/MongoDB/Server/7.0/bin/mongod.exe',
  ['--dbpath', dbpath, '--port', String(port), '--bind_ip', '127.0.0.1', '--replSet', replicaSet, '--logpath', join(root, 'mongod.log')],
  { windowsHide: true, stdio: 'ignore' });
let spawnError; mongod.on('error', (error) => { spawnError = error; });
const direct = `mongodb://127.0.0.1:${port}/?directConnection=true`;
let client;
try {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (spawnError) throw spawnError;
    if (mongod.exitCode !== null) throw new Error(`Disposable mongod exited ${mongod.exitCode}`);
    client = new MongoClient(direct, { serverSelectionTimeoutMS: 200 });
    try { await client.connect(); break; } catch { await client.close(); client = null; }
    await new Promise((done) => setTimeout(done, 100));
  }
  if (!client) throw new Error('Disposable mongod did not start');
  await client.db('admin').command({ replSetInitiate: { _id: replicaSet, members: [{ _id: 0, host: `127.0.0.1:${port}` }] } });
  let primary = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    const hello = await client.db('admin').command({ hello: 1 });
    if (hello.setName === replicaSet && hello.isWritablePrimary) { primary = true; break; }
    await new Promise((done) => setTimeout(done, 100));
  }
  if (!primary) throw new Error('Disposable replica set did not elect a primary');
  await client.close(); client = null;
  const directory = dirname(fileURLToPath(import.meta.url));
  const files = process.argv.filter((arg) => arg.endsWith('.integration.mjs'));
  if (!files.length) files.push('agent1Authority.integration.mjs');
  const child = spawn(process.execPath, ['--test', '--test-concurrency=1', ...files.map((file) => join(directory, file))], {
    cwd: root, windowsHide: true, stdio: 'inherit',
    env: { PATH: process.env.PATH, SystemRoot: process.env.SystemRoot, TEMP: root, TMP: root, NODE_ENV: 'test',
      AGENT1_ISOLATED_URI: `mongodb://127.0.0.1:${port}/agent1_disposable?replicaSet=${replicaSet}`,
      AGENT1_REPLICA_SET: replicaSet, DOTENV_CONFIG_QUIET: 'true' },
  });
  const [code] = await once(child, 'exit'); process.exitCode = code ?? 1;
} finally {
  if (client) await client.close();
  if (mongod.exitCode === null && !spawnError) { const exited = once(mongod, 'exit'); mongod.kill(); await exited; }
  // Verify the resolved target before recursive removal; it is only this runner's fresh temp directory.
  if (dirname(root) !== resolve(tmpdir()) || !root.startsWith(join(resolve(tmpdir()), 'kosherradar-agent1-'))) {
    throw new Error('Refusing cleanup outside disposable test directory');
  }
  await rm(root, { recursive: true, force: true });
}
