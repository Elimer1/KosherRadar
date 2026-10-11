import { env, validateEnv } from './config/env.js';
import { connectDb } from './config/db.js';
import { createApp } from './app.js';

const startServer = async () => {
  try {
    validateEnv();
    await connectDb();

    const app = createApp();
    app.listen(env.port, () => {
      console.log(`KosherRadar API listening on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
