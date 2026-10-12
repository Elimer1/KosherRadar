// NEW (Backend QA): connects the concurrency tests to kosherradar_agent2_test only.
// חדש (בדיקת שרת): מחבר את בדיקות המקביליות רק אל kosherradar_agent2_test.
import { createRequire } from 'node:module';
import { randomBytes } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import {
  AGENT2_DATABASE_NAME,
  AGENT2_EMAIL_PATTERN,
  AGENT2_MONGODB_URI,
  AGENT2_NAME_PREFIX,
  assertAgent2Session,
  assertSafeAgent2Database,
  isLoopbackMember,
} from './assertSafeAgent2Database.mjs';

const require = createRequire(new URL('../package.json', import.meta.url));

let loaded;

function applyAgent2ProcessEnv() {
  assertAgent2Session();
  assertSafeAgent2Database(AGENT2_MONGODB_URI);
  process.env.MONGODB_URI = AGENT2_MONGODB_URI;
  process.env.JWT_SECRET = randomBytes(48).toString('hex');
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.NODE_ENV = 'test';
  process.env.ATLAS_SEARCH_ENABLED = 'false';
  process.env.GEOAPIFY_API_KEY = '';
  process.env.CLOUDINARY_CLOUD_NAME = '';
  process.env.CLOUDINARY_API_KEY = '';
  process.env.CLOUDINARY_API_SECRET = '';
  process.env.RESEND_API_KEY = '';
  process.env.EMAIL_FROM = '';
  process.env.SEED_ADMIN_EMAIL = '';
  process.env.SEED_ADMIN_PASSWORD = '';
}

async function loadApp() {
  if (!loaded) {
    applyAgent2ProcessEnv();
    const mongoose = (await import(pathToFileURL(require.resolve('mongoose')).href)).default;
    const bcrypt = (await import(pathToFileURL(require.resolve('bcrypt')).href)).default;
    const [restaurant, teuda, report, user, submission, teudaSubmission] = await Promise.all([
      import('../src/models/Restaurant.js'),
      import('../src/models/Teuda.js'),
      import('../src/models/Report.js'),
      import('../src/models/User.js'),
      import('../src/services/restaurantSubmissionService.js'),
      import('../src/services/teudaSubmissionService.js'),
    ]);

    loaded = {
      mongoose,
      bcrypt,
      Restaurant: restaurant.Restaurant,
      Teuda: teuda.Teuda,
      Report: report.Report,
      User: user.User,
      submitRestaurantService: submission.submitRestaurantService,
      submitTeudaService: teudaSubmission.submitTeudaService,
    };
  }

  return loaded;
}

export async function connectAgent2() {
  const expected = assertSafeAgent2Database(AGENT2_MONGODB_URI);
  const { mongoose } = await loadApp();

  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(AGENT2_MONGODB_URI, {
      serverSelectionTimeoutMS: 4000,
      directConnection: true,
      family: 4,
    });
  }

  const host = mongoose.connection.host;
  const database = mongoose.connection.name;
  const port = String(mongoose.connection.port);

  const stop = async (message) => {
    await mongoose.disconnect();
    throw new Error(message);
  };

  if (!isLoopbackMember(host)) {
    await stop('Resolved MongoDB host is not loopback. Stopped before writing.');
  }

  if (database !== AGENT2_DATABASE_NAME) {
    await stop('Resolved database is not kosherradar_agent2_test. Stopped before writing.');
  }

  if (port !== expected.port) {
    await stop('Resolved MongoDB port is not 27017. Stopped before writing.');
  }

  const hello = await mongoose.connection.db.admin().command({ hello: 1 });
  const members = [...(hello.hosts || []), ...(hello.passives || []), ...(hello.arbiters || [])];

  if (members.some((member) => !isLoopbackMember(member))) {
    await stop('A replica-set member is not local. Stopped before writing.');
  }

  return {
    ...expected,
    resolvedHost: host,
    resolvedPort: port,
    replicaSet: hello.setName || null,
    writable: Boolean(hello.isWritablePrimary),
  };
}

export async function disconnectAgent2() {
  if (!loaded) {
    return;
  }

  const { mongoose } = loaded;

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

export async function deleteAgent2Records() {
  const { User, Restaurant, Teuda, Report } = await loadApp();
  const users = await User.find({ email: AGENT2_EMAIL_PATTERN }).select('_id');
  const userIds = users.map((user) => user._id);
  const restaurants = await Restaurant.find({
    $or: [{ name: { $regex: `^${AGENT2_NAME_PREFIX}` } }, { submittedBy: { $in: userIds } }],
  }).select('_id');
  const restaurantIds = restaurants.map((restaurant) => restaurant._id);

  await Report.deleteMany({
    $or: [{ restaurant: { $in: restaurantIds } }, { submittedBy: { $in: userIds } }],
  });
  await Teuda.deleteMany({
    $or: [{ restaurant: { $in: restaurantIds } }, { submittedBy: { $in: userIds } }],
  });
  await Restaurant.deleteMany({ _id: { $in: restaurantIds } });
  await User.deleteMany({ _id: { $in: userIds } });
}

export async function ensureRestaurantIndexes() {
  const { Restaurant } = await loadApp();
  await Restaurant.createIndexes();
}

export async function ensureTeudaIndexes() {
  const { Teuda } = await loadApp();
  await Teuda.createIndexes();
}

export async function agent2Models() {
  return loadApp();
}
