import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorMiddleware, notFoundMiddleware } from './middleware/errorMiddleware.js';

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');

  app.use(cors({ origin: env.clientUrl }));
  app.use(express.json({ limit: '10kb' }));

  app.get('/api/health', (req, res) => {
    const databaseConnected = mongoose.connection.readyState === 1;
    res.status(200).json({ status: 'ok', database: databaseConnected ? 'connected' : 'disconnected' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/admin', adminRoutes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};
