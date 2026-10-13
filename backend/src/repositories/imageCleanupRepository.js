import { ImageCleanup } from '../models/ImageCleanup.js';
export const enqueueImageCleanupRepo = async (ids) => {
  for (const publicId of new Set(ids.filter(Boolean))) {
    await ImageCleanup.updateOne({ publicId }, { $setOnInsert: { publicId, attempts: 0 } }, { upsert: true });
  }
};
export const findImageCleanupRepo = (ids, limit = 100) =>
  ImageCleanup.find(ids ? { publicId: { $in: ids } } : {}).sort({ createdAt: 1 }).limit(limit).lean();
export const completeImageCleanupRepo = (publicId) => ImageCleanup.deleteOne({ publicId });
export const failImageCleanupRepo = (publicId, reason) =>
  ImageCleanup.updateOne({ publicId }, { $inc: { attempts: 1 }, $set: { lastFailure: reason } });
