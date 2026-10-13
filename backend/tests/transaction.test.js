import { expect, it, vi } from 'vitest';
vi.mock('mongoose', () => ({ default: { set: vi.fn(), connection: { transaction: vi.fn() } } }));
import mongoose from 'mongoose';
import { withTransaction } from '../src/repositories/transaction.js';
it('preserves database errors without claiming success', async () => {
  const error = new Error('database unavailable');
  mongoose.connection.transaction.mockRejectedValue(error);
  await expect(withTransaction(vi.fn())).rejects.toBe(error);
});
it('fails closed on standalone MongoDB rather than retrying without a transaction', async () => {
  mongoose.connection.transaction.mockRejectedValue(Object.assign(new Error('standalone'), { code: 20 }));
  const work = vi.fn();
  await expect(withTransaction(work)).rejects.toMatchObject({ statusCode: 503, code: 'TRANSACTIONS_REQUIRED' });
  expect(work).not.toHaveBeenCalled();
});
