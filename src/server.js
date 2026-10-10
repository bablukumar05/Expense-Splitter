import http from 'node:http';
import app from './app.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

let server;

async function start() {
  await connectDatabase();
  server = http.createServer(app);
  server.listen(env.PORT, () => logger.info(`API listening on port ${env.PORT}`));
}

async function shutdown(signal) {
  logger.info(`Received ${signal}; shutting down`);
  if (server) {
    server.close(async () => {
      const mongoose = await import('mongoose');
      await mongoose.default.connection.close();
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start().catch((error) => {
  logger.error('Failed to start API', { message: error.message, stack: error.stack });
  process.exit(1);
});