import { logger } from '../utils/logger.js';

export function notFoundHandler(request, _response, next) {
  const error = new Error(`Route not found: ${request.method} ${request.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function errorHandler(error, _request, response, _next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';
  let details = error.details || null;

  if (error.code === 11000) {
    statusCode = 409;
    message = 'An account with this email already exists';
    details = null;
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource identifier';
    details = null;
  } else if (error.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Malformed JSON request body';
    details = null;
  } else if (error.name === 'MulterError') {
    statusCode = 400;
    message = error.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5 MB or smaller' : error.message;
    details = null;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Resource validation failed';
    details = Object.values(error.errors ?? {}).map((issue) => ({
      field: issue.path,
      message: issue.message
    }));
  }

  if (statusCode >= 500) {
    logger.error(message, { stack: error.stack });
    message = 'Internal server error';
    details = null;
  }

  return response.status(statusCode).json({ success: false, message, data: details });
}