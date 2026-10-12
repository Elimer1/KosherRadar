import { appError } from '../utils/appError.js';
import { findRestaurantByIdRepo } from '../repositories/restaurantRepository.js';
import { createReportRepo, findSimilarPendingReportRepo } from '../repositories/reportRepository.js';
import { findTeudaByIdRepo } from '../repositories/teudaRepository.js';
import { isTeudaPublic } from './teudaRulesService.js';
import { deleteImageService, uploadReportImageService } from './imageUploadService.js';

// A signed-in user reports a problem or proposes a correction. The report is PENDING: nothing about
// the restaurant or certificate changes until an admin reviews it and applies a correction.
export const submitReportService = async ({ reportData, file, user }) => {
  const restaurant = await findRestaurantByIdRepo(reportData.restaurantId);

  if (!restaurant || restaurant.status !== 'APPROVED') {
    throw appError('Restaurant not found', 404);
  }

  if (reportData.teudaId) {
    const teuda = await findTeudaByIdRepo(reportData.teudaId);
    const belongsToRestaurant = teuda && String(teuda.restaurant) === String(restaurant._id);

    // Same answer for "missing", "belongs elsewhere" and "admin-only (expired over six months)",
    // so a user cannot learn that an old hidden certificate exists.
    if (!belongsToRestaurant || !isTeudaPublic(teuda)) {
      throw appError('Certificate not found', 404);
    }
  }

  const alreadySent = await findSimilarPendingReportRepo({
    restaurant: restaurant._id,
    teuda: reportData.teudaId,
    submittedBy: user._id,
    description: reportData.description,
  });

  if (alreadySent) {
    throw appError('You already sent this report and it is waiting for review', 409);
  }

  // NEW (update): the photo is optional. A failed save removes the upload so it is not left behind.
  // חדש (עדכון): התמונה אינה חובה. שמירה שנכשלת מוחקת את ההעלאה כדי שלא תישאר.
  const image = file ? await uploadReportImageService(file) : null;

  try {
    const report = await createReportRepo({
      restaurant: restaurant._id,
      teuda: reportData.teudaId,
      submittedBy: user._id,
      type: reportData.type || 'GENERAL',
      description: reportData.description,
      proposedHechsher: reportData.proposedHechsher,
      proposedHechsherOther: reportData.proposedHechsherOther,
      proposedKashrutLevel: reportData.proposedKashrutLevel,
      photoUrl: image?.photoUrl,
      cloudinaryPublicId: image?.cloudinaryPublicId,
      status: 'PENDING',
      correctionApplied: false,
    });

    return { id: String(report._id), status: report.status };
  } catch (error) {
    if (image) {
      await deleteImageService(image.cloudinaryPublicId);
    }

    throw error;
  }
};
