// NEW (Backend QA): the connection guard is checked without opening a database.
// חדש (בדיקת שרת): שומר החיבור נבדק בלי לפתוח מסד נתונים.
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AGENT2_MONGODB_URI,
  assertAgent2Session,
  assertSafeAgent2Database,
} from './assertSafeAgent2Database.mjs';

test('accepts only the explicit loopback Agent 2 database', () => {
  assert.deepEqual(assertSafeAgent2Database(AGENT2_MONGODB_URI), {
    host: '127.0.0.1',
    port: '27017',
    database: 'kosherradar_agent2_test',
  });
  assert.deepEqual(assertSafeAgent2Database('mongodb://localhost:27017/kosherradar_agent2_test'), {
    host: 'localhost',
    port: '27017',
    database: 'kosherradar_agent2_test',
  });
});

test('refuses remote, srv, credential, and other-database targets', () => {
  const refused = [
    '',
    'mongodb://example.com:27017/kosherradar_agent2_test',
    'mongodb+srv://cluster.example.net/kosherradar_agent2_test',
    'mongodb://127.0.0.1:27017,10.0.0.2:27017/kosherradar_agent2_test',
    'mongodb://127.0.0.1:27017/kosherradar_qa',
    'mongodb://127.0.0.1:27017/kosherradar',
    'mongodb://127.0.0.1:27018/kosherradar_agent2_test',
    'mongodb://user:secret@127.0.0.1:27017/kosherradar_agent2_test',
    'mongodb://127.0.0.1:27017/kosherradar_agent2_test ',
  ];

  for (const uri of refused) {
    assert.throws(() => assertSafeAgent2Database(uri));
  }
});

test('a mutating session must be opted in explicitly', () => {
  const previous = process.env.AGENT2_DB_TEST;
  delete process.env.AGENT2_DB_TEST;
  assert.throws(() => assertAgent2Session(), /AGENT2_DB_TEST=1/);
  process.env.AGENT2_DB_TEST = '1';
  assert.doesNotThrow(() => assertAgent2Session());

  if (previous === undefined) {
    delete process.env.AGENT2_DB_TEST;
  } else {
    process.env.AGENT2_DB_TEST = previous;
  }
});
