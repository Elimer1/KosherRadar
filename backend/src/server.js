import express from 'express';
import cors from 'cors';
import { env, validateEnv } from './config/env.js';
import { connectDb } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import optionsRoutes from './routes/optionsRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import placesRoutes from './routes/placesRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { errorMiddleware, notFoundMiddleware } from './middleware/errorMiddleware.js';

const startServer = async () => {
  try {
    validateEnv();
    await connectDb();

    const app = express();

    app.disable('x-powered-by');

    app.use(cors({ origin: env.clientUrl }));
    app.use(express.json({ limit: '10kb' }));

    app.use('/api/health', healthRoutes);

    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/options', optionsRoutes);
    app.use('/api/restaurants', restaurantRoutes);
    app.use('/api/reports', reportRoutes);
    app.use('/api/places', placesRoutes);

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
