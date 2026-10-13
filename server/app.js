import cors from 'cors';
import express from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import groupRoutes from './routes/group.routes.js';
import inviteRoutes from './routes/invite.routes.js';
import expenseRoutes from './routes/expense.routes.js';
import settlementRoutes from './routes/settlement.routes.js';
import recurringExpenseRoutes from './routes/recurringExpense.routes.js';
import userRoutes from './routes/userRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { inviteLimiter } from './middleware/rateLimiter.js';
import { logger } from './utils/logger.js';
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from './config/openapi.js';

import { randomUUID } from 'node:crypto';

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'img-src': ["'self'", 'data:', 'https:'],
      'script-src': ["'self'", "'unsafe-inline'"],
      'style-src': ["'self'", "'unsafe-inline'"]
    }
  }
}));
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.CORS_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true,
  exposedHeaders: ['Content-Disposition']
}));
app.use(express.json({ limit: '16kb' }));
app.use(mongoSanitize());
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim(), { source: 'http' }) }
}));

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/invite', inviteLimiter, inviteRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/settlements', settlementRoutes);
app.use('/api/recurring-expenses', recurringExpenseRoutes);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, { explorer: true }));
app.use(notFoundHandler);
app.use(errorHandler);

export default app;