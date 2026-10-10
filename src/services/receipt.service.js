import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

function uploadBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      folder: 'expense-splitter/receipts',
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1600, height: 1600, crop: 'limit', quality: 'auto' }]
    }, (error, result) => {
      if (error) return reject(error);
      return resolve(result);
    });
    stream.end(buffer);
  });
}

async function destroyQuietly(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch (error) {
    logger.error('Could not remove old receipt from Cloudinary', { message: error.message });
  }
}

export async function attachReceipt(expense, file) {
  if (!isCloudinaryConfigured) throw new AppError('Receipt upload is not configured', 503);
  if (!file) throw new AppError('Receipt image is required (form-data field: receipt)', 400);

  const uploaded = await uploadBuffer(file.buffer);
  const previousPublicId = expense.receiptPublicId;
  expense.receiptUrl = uploaded.secure_url;
  expense.receiptPublicId = uploaded.public_id;

  try {
    await expense.save();
  } catch (error) {
    await destroyQuietly(uploaded.public_id);
    throw error;
  }

  await destroyQuietly(previousPublicId);
  return expense;
}

export async function removeReceipt(expense) {
  if (!expense.receiptUrl) throw new AppError('This expense has no receipt', 404);
  const previousPublicId = expense.receiptPublicId;

  expense.receiptUrl = '';
  expense.receiptPublicId = '';
  await expense.save();

  if (isCloudinaryConfigured) await destroyQuietly(previousPublicId);
  return expense;
}