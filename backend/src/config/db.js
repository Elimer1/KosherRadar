import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDb = async () => {
  await mongoose.connect(env.mongodbUri, { serverSelectionTimeoutMS: 5000 });
  console.log('MongoDB connected');
};

export const disconnectDb = async () => {
  await mongoose.disconnect();
};
