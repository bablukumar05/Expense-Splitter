import { Router } from 'express';
import mongoose from 'mongoose';
import { validate } from '../middleware/validate.js';
import { emptyRequest } from '../validators/common.js';

const router = Router();

router.get('/', validate(emptyRequest), (_request, response) => {
  const connected = mongoose.connection.readyState === 1;
  return response.status(connected ? 200 : 503).json({
    success: connected,
    message: connected ? 'Service is healthy' : 'Database is unavailable',
    data: { status: connected ? 'ok' : 'unavailable', database: connected ? 'connected' : 'disconnected' }
  });
});

router.get('/live', validate(emptyRequest), (_request, response) => {
  return response.status(200).json({
    success: true,
    message: 'Service is alive',
    data: { status: 'ok', uptime: process.uptime() }
  });
});

router.get('/ready', validate(emptyRequest), async (_request, response) => {
  let isDbReady = false;
  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      isDbReady = true;
    }
  } catch {
    isDbReady = false;
  }
  return response.status(isDbReady ? 200 : 503).json({
    success: isDbReady,
    message: isDbReady ? 'Service is ready' : 'Database ping failed',
    data: { status: isDbReady ? 'ready' : 'unavailable', database: isDbReady ? 'connected' : 'disconnected' }
  });
});

export default router;