// NEW (Backend QA): refuses every MongoDB target except this agent's isolated local database.
// חדש (בדיקת שרת): דוחה כל יעד MongoDB מלבד מסד הנתונים המקומי המבודד של סוכן זה.
// Does not read .env files and does not log the connection string.

export const AGENT2_DATABASE_NAME = 'kosherradar_agent2_test';
export const AGENT2_MONGODB_URI = 'mongodb://127.0.0.1:27017/kosherradar_agent2_test';
export const AGENT2_EMAIL_PATTERN = /^agent2\+[^@\s]+@example\.invalid$/;
export const AGENT2_NAME_PREFIX = 'Agent2 ';

const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '::1']);

export function assertAgent2Session() {
  if (process.env.AGENT2_DB_TEST !== '1') {
    throw new Error(
      'Refusing to connect. Set AGENT2_DB_TEST=1 in this process. Inherited configuration is not used.'
    );
  }
}

export function assertSafeAgent2Database(uri) {
  if (typeof uri !== 'string' || uri.trim() === '') {
    throw new Error('A MongoDB URI is required. Agent 2 tests do not read .env files.');
  }

  if (uri !== uri.trim() || /[\r\n\s]/.test(uri)) {
    throw new Error('The MongoDB URI must be a single connection string.');
  }

  if (uri.includes(',')) {
    throw new Error('Agent 2 accepts one host only. A replica-set host list is refused.');
  }

  if (/^mongodb\+srv:/i.test(uri)) {
    throw new Error('mongodb+srv URIs are refused. Use mongodb://127.0.0.1.');
  }

  let parsed;

  try {
    parsed = new URL(uri);
  } catch {
    throw new Error('The MongoDB URI is not a valid URL.');
  }

  if (parsed.protocol !== 'mongodb:') {
    throw new Error('Only the mongodb: protocol is allowed.');
  }

  const host = parsed.hostname.toLowerCase();

  if (!LOOPBACK_HOSTS.has(host)) {
    throw new Error('Host must be 127.0.0.1, localhost, or ::1.');
  }

  const database = decodeURIComponent(parsed.pathname.replace(/^\//, ''));

  if (database !== AGENT2_DATABASE_NAME) {
    throw new Error(`Database name must be ${AGENT2_DATABASE_NAME}.`);
  }

  const port = parsed.port || '27017';

  if (!/^\d+$/.test(port) || port !== '27017') {
    throw new Error('Port must be 27017.');
  }

  if (parsed.username || parsed.password) {
    throw new Error('The Agent 2 test URI must not carry credentials.');
  }

  return { host, port, database };
}

export function isLoopbackMember(value) {
  const host = String(value).split(':')[0].replace(/^\[|\]$/g, '').toLowerCase();
  return LOOPBACK_HOSTS.has(host);
}
