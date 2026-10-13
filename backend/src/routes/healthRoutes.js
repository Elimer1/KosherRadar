// NEW (Agent 3): isolate health routing for tests without starting the database.
// חדש (סוכן 3): הפרדת נתב הבריאות לבדיקות ללא מסד נתונים.
import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();
// NEW (Agent 3): keep legacy health as readiness; liveness never depends on MongoDB.
// חדש (סוכן 3): בדיקת מוכנות נפרדת מבדיקת פעילות השרת.
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
router.get('/live', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
router.get(['/', '/ready'], (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? 'ok' : 'unavailable',
    database: databaseConnected ? 'connected' : 'disconnected',
  });
});
export default router;
