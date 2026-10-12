import { z } from 'zod';
import { objectId } from './common.js';

export const recurringExpenseIdSchema = {
  params: z.object({ recurringExpenseId: objectId }).strict()
};