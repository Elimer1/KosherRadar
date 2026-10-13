import mongoose from 'mongoose';
import { appError } from '../utils/appError.js';

// Mongoose propagates the session to every repository query/create/save in this callback.
// Keep external services outside: the driver may retry the entire callback.
mongoose.set('transactionAsyncLocalStorage', true);
export const withTransaction = async (work) => {
  try {
    return await mongoose.connection.transaction(work, {
      readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' }, readPreference: 'primary',
    });
  } catch (error) {
    if (error.code === 20 || error.codeName === 'IllegalOperation') {
      throw appError('This operation requires a MongoDB replica set or sharded deployment. No changes were committed.', 503, 'TRANSACTIONS_REQUIRED');
    }
    throw error;
  }
};
