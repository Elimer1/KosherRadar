// NEW (Agent 3): HTTP health semantics with mocked connection state and no live MongoDB.
// חדש (סוכן 3): בדיקות בריאות HTTP עם מצב חיבור מדומה.
import express from 'express';
import { afterAll, beforeAll, expect, it, vi } from 'vitest';
vi.mock('mongoose', () => ({ default: { connection: { readyState: 1 } } }));
import mongoose from 'mongoose';
import healthRoutes from '../src/routes/healthRoutes.js';
let server; let baseUrl;
beforeAll(async () => {
  const app = express(); app.use('/api/health', healthRoutes);
  await new Promise((resolve) => { server = app.listen(0, '127.0.0.1', resolve); });
  baseUrl = `http://127.0.0.1:${server.address().port}/api/health`;
});
afterAll(async () => { await new Promise((resolve) => server.close(resolve)); });

it.each(['', '/ready'])('reports readiness on %s using current connection state', async (path) => {
  for (const state of [1, 0, 2, 3, 99, 1]) {
    mongoose.connection.readyState = state;
    const response = await fetch(`${baseUrl}${path}`);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.status).toBe(state === 1 ? 200 : 503);
    expect(await response.json()).toEqual({
      status: state === 1 ? 'ok' : 'unavailable',
      database: state === 1 ? 'connected' : 'disconnected',
    });
  }
});

it.each([1, 0, 2, 3])('reports liveness independently of database state %s', async (state) => {
  mongoose.connection.readyState = state;
  const response = await fetch(`${baseUrl}/live`);
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ status: 'ok' });
});
