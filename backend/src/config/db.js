import mongoose from 'mongoose';
import { env } from './env.js';
import { assertUniqueIndexesRepo } from '../repositories/indexIntegrityRepository.js';

export const connectDb = async () => {
  // Inspect existing indexes before accepting requests; never implicitly migrate application data.
  await mongoose.connect(env.mongodbUri, { serverSelectionTimeoutMS: 5000, autoIndex: false, autoCreate: false });
  try {
    await assertUniqueIndexesRepo();
  } catch (error) {
    await mongoose.disconnect();
    throw error;
  }
  console.log('MongoDB connected');
};

export const disconnectDb = async () => {
  await mongoose.disconnect();
};
