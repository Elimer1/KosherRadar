import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { env, validateEnv } from './config/env.js';
import { connectDb } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import optionsRoutes from './routes/optionsRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import { errorMiddleware, notFoundMiddleware } from './middleware/errorMiddleware.js';

const startServer = async () => {
  try {
    validateEnv();
    await connectDb();

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
    app.use('/api/options', optionsRoutes);
    app.use('/api/restaurants', restaurantRoutes);

    app.use(notFoundMiddleware);
    app.use(errorMiddleware);

    app.listen(env.port, () => {
      console.log(`KosherRadar API listening on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
