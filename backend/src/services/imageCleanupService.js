import { enqueueImageCleanupRepo, findImageCleanupRepo, completeImageCleanupRepo, failImageCleanupRepo } from '../repositories/imageCleanupRepository.js';
import { deleteImageService } from './imageUploadService.js';

// Call after commit. Destroy is idempotent, so a crash after destroy but before ack is retryable.
export const retryImageCleanupService = async (ids) => {
  const result = { completed: 0, pending: 0 };
  try {
    const jobs = await findImageCleanupRepo(ids);
    for (const job of jobs) {
      const outcome = await deleteImageService(job.publicId);
      if (outcome?.deleted) {
        await completeImageCleanupRepo(job.publicId); result.completed++;
      } else {
        await failImageCleanupRepo(job.publicId, outcome?.reason || 'CLEANUP_FAILED'); result.pending++;
      }
    }
  } catch (error) {
    // Database work is already committed. The durable jobs remain available for retry.
    console.error('Image cleanup deferred; retry the durable cleanup queue:', error.message);
    result.pending++;
  }
  return result;
};

export const cleanupFailedUploadService = async (publicId, error) => {
  if (!publicId) return;
  if (error?.hasErrorLabel?.('UnknownTransactionCommitResult')) {
    console.error('Upload retained pending uncertain transaction commit; reconcile references before cleanup:', publicId);
    return;
  }
  try {
    await enqueueImageCleanupRepo([publicId]);
    await retryImageCleanupService([publicId]);
  } catch (error) {
    // If MongoDB itself is unavailable, preserve the id in logs for operator recovery.
    console.error('Could not queue failed upload cleanup:', publicId, error.message);
    await deleteImageService(publicId);
  }
};
