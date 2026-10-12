import { z } from 'zod';
import { SUPPORTED_CURRENCIES } from '../config/exchangeRates.js';
import { CATEGORIES, SPLIT_TYPES } from '../models/Expense.js';
import { objectId } from './common.js';

const money = z.number()
  .positive()
  .max(10_000_000)
  .refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-6,
    'Maximum 2 decimal places allowed');
const payer = z.object({ member: objectId, amount: money }).strict();
const split = z.object({
  member: objectId,
  amount: money.optional(),
  percentage: z.number().positive().max(100).optional(),
  shares: z.number().int().min(1).max(1000).optional()
}).strict();

export const createRecurringExpenseSchema = {
  params: z.object({ groupId: objectId }).strict(),
  body: z.object({
    description: z.string().trim().min(1).max(100),
    amount: money,
    currency: z.string().trim().toUpperCase().pipe(z.enum(SUPPORTED_CURRENCIES)).optional(),
    category: z.enum(CATEGORIES).default('general'),
    notes: z.string().trim().max(500).optional(),
    paidBy: z.array(payer).min(1).max(20),
    splitType: z.enum(SPLIT_TYPES),
    splits: z.array(split).min(1).max(50),
    frequency: z.enum(['weekly', 'monthly']),
    startsAt: z.coerce.date().optional()
  }).strict()
};

export const listRecurringExpensesSchema = {
  params: z.object({ groupId: objectId }).strict(),
  query: z.object({ active: z.enum(['true', 'false']).optional() }).strict()
};

export const recurringExpenseIdSchema = {
  params: z.object({ recurringExpenseId: objectId }).strict()
};