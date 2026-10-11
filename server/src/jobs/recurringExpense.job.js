import cron from 'node-cron';
import { logger } from '../utils/logger.js';
import { processDueRecurringExpenses } from '../services/recurringExpense.service.js';

export function startRecurringExpenseJob() {
  return cron.schedule('* * * * *', async () => {
    try {
      const processed = await processDueRecurringExpenses();
      if (processed > 0) logger.info('Processed recurring expense occurrences', { processed });
    } catch (error) {
      logger.error('Recurring expense job failed', { message: error.message, stack: error.stack });
    }
  }, { noOverlap: true });
}