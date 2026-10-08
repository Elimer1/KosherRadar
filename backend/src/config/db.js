import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDb = async () => {
  // Fail fast (5s) if Atlas is unreachable so the developer sees the problem right away.
  await mongoose.connect(env.mongodbUri, { serverSelectionTimeoutMS: 5000 });
  console.log('MongoDB connected');
};

export const disconnectDb = async () => {
  await mongoose.disconnect();
};
