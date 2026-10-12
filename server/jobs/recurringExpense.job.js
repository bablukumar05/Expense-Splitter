import cron from 'node-cron';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { processDueRecurringExpenses } from '../services/recurringExpense.service.js';

export function startRecurringExpenseJob() {
  if (!env.ENABLE_CRON) {
    logger.info('Recurring expense cron job is disabled via ENABLE_CRON=false');
    return null;
  }

  return cron.schedule('0 * * * *', async () => {
    try {
      const processed = await processDueRecurringExpenses();
      if (processed > 0) logger.info('Processed recurring expense occurrences', { processed });
    } catch (error) {
      logger.error('Recurring expense job failed', { message: error.message, stack: error.stack });
    }
  }, { noOverlap: true });
}