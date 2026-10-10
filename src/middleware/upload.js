import multer from 'multer';
import { AppError } from '../utils/AppError.js';

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const uploadReceipt = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(_request, file, callback) {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(new AppError('Only JPG, PNG, or WEBP images are allowed', 400));
    }
    return callback(null, true);
  }
}).single('receipt');