import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

export async function connectDatabase() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
    autoIndex: env.NODE_ENV !== 'production'
  });
  logger.info('Connected to MongoDB');
}