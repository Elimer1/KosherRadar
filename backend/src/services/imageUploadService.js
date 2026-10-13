import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from '../config/constants.js';
import { getCloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { appError } from '../utils/appError.js';
import { detectImageType } from '../utils/imageType.js';

const TEUDA_FOLDER = 'kosherradar/teudot';

// Checks the real file contents, not just the file name or the type the browser reported.
export const checkImageFile = (file) => {
  if (!file || !file.buffer) {
    throw appError('A certificate photo is required', 400);
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw appError('The photo is larger than 5 MB', 413);
  }

  const realType = detectImageType(file.buffer);

  if (!realType || !ALLOWED_IMAGE_TYPES.includes(realType)) {
    throw appError('The photo must be a JPG, PNG or WebP image', 400);
  }
};

// NEW (update): report photos use their own folder. Certificate photos stay in the teuda folder.
// חדש (עדכון): תמונות דיווח נשמרות בתיקייה נפרדת. תמונות תעודה נשארות בתיקיית התעודות.
const REPORT_FOLDER = 'kosherradar/reports';

const uploadImageService = async (file, folder) => {
  checkImageFile(file);

  if (!isCloudinaryConfigured()) {
    throw appError('Image upload is not available right now. Please try again later.', 503);
  }

  const cloudinary = getCloudinary();

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image', allowed_formats: ['jpg', 'png', 'webp'] },
        (error, uploadResult) => (error ? reject(error) : resolve(uploadResult))
      );
      stream.end(file.buffer);
    });

    return { photoUrl: result.secure_url, cloudinaryPublicId: result.public_id };
  } catch (error) {
    console.error('Cloudinary upload failed:', error.message || error);
    throw appError('Could not upload the photo. Please try again later.', 502);
  }
};

export const uploadTeudaImageService = (file) => uploadImageService(file, TEUDA_FOLDER);

export const uploadReportImageService = (file) => uploadImageService(file, REPORT_FOLDER);

// Used to clean up an uploaded photo when saving to the database fails afterwards.
// Return an explicit outcome so the durable cleanup queue can retain failures for retry.
export const deleteImageService = async (cloudinaryPublicId) => {
  if (!cloudinaryPublicId) {
    return { deleted: true };
  }
  if (!isCloudinaryConfigured()) {
    return { deleted: false, reason: 'NOT_CONFIGURED' };
  }

  try {
    const result = await getCloudinary().uploader.destroy(cloudinaryPublicId, { resource_type: 'image' });
    return result?.result === 'ok' || result?.result === 'not found'
      ? { deleted: true }
      : { deleted: false, reason: 'UNEXPECTED_RESPONSE' };
  } catch (error) {
    console.error('Could not delete orphaned Cloudinary image:', cloudinaryPublicId, error.message);
    return { deleted: false, reason: 'CLEANUP_FAILED' };
  }
};
