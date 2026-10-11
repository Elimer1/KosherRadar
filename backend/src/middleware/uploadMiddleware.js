import multer from 'multer';
import { MAX_IMAGE_BYTES } from '../config/constants.js';
import { appError } from '../utils/appError.js';

// The photo is kept in memory only until it is sent on to Cloudinary. Nothing is written to disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1, fields: 10, fieldSize: 20 * 1024 },
});

const photoUpload = upload.single('photo');

export const uploadPhotoMiddleware = (req, res, next) => {
  photoUpload(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error.code === 'LIMIT_FILE_SIZE') {
      return next(appError('The photo is larger than 5 MB', 413));
    }

    if (error instanceof multer.MulterError) {
      return next(appError('The upload was not valid. Send one photo in the "photo" field.', 400));
    }

    return next(error);
  });
};
