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

export default router;