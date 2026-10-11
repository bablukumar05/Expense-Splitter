import { z } from 'zod';
import { CATEGORIES, SPLIT_TYPES } from '../models/Expense.js';
import { objectId } from './common.js';
import { SUPPORTED_CURRENCIES } from '../config/exchangeRates.js';

const MAX_AMOUNT = 10_000_000;
const twoDecimals = (value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-6;
const money = z.number()
  .positive()
  .max(MAX_AMOUNT)
  .refine(twoDecimals, 'Maximum 2 decimal places allowed');
const description = z.string().trim().min(1).max(100);
const notes = z.string().trim().max(500);
const date = z.coerce.date().refine(
  (value) => value <= new Date(Date.now() + 24 * 60 * 60 * 1000),
  'Date cannot be in the future'
);

const paidByItem = z.object({ member: objectId, amount: money }).strict();
const splitItem = z.object({
  member: objectId,
  amount: money.optional(),
  percentage: z.number().positive().max(100).refine(twoDecimals, 'Maximum 2 decimal places allowed').optional(),
  shares: z.number().int().min(1).max(1000).optional()
}).strict();

export const createExpenseSchema = {
  params: z.object({ groupId: objectId }).strict(),
  body: z.object({
    description,
    amount: money,
    currency: z.string().trim().toUpperCase().pipe(z.enum(SUPPORTED_CURRENCIES)).optional(),
    category: z.enum(CATEGORIES).default('general'),
    date: date.default(() => new Date()),
    notes: notes.optional(),
    currency: z.string().trim().toUpperCase().pipe(z.enum(SUPPORTED_CURRENCIES)).optional(),
    paidBy: z.array(paidByItem).min(1).max(20),
    splitType: z.enum(SPLIT_TYPES),
    splits: z.array(splitItem).min(1).max(50)
  }).strict()
};

const financialFields = ['amount', 'paidBy', 'splitType', 'splits'];

export const updateExpenseSchema = {
  params: z.object({ expenseId: objectId }).strict(),
  body: z.object({
    description: description.optional(),
    category: z.enum(CATEGORIES).optional(),
    date: date.optional(),
    notes: notes.optional(),
    amount: money.optional(),
    paidBy: z.array(paidByItem).min(1).max(20).optional(),
    splitType: z.enum(SPLIT_TYPES).optional(),
    splits: z.array(splitItem).min(1).max(50).optional()
  }).strict().superRefine((data, context) => {
    if (Object.keys(data).length === 0) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Send at least one field' });
    }

    const presentFinancialFields = financialFields.filter((field) => data[field] !== undefined);
    if ((presentFinancialFields.length > 0 && presentFinancialFields.length < financialFields.length) ||
      (data.currency !== undefined && presentFinancialFields.length !== financialFields.length)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'To change money details send amount, paidBy, splitType and splits together'
      });
    }
  })
};

export const listExpensesSchema = {
  params: z.object({ groupId: objectId }).strict(),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(60).optional(),
    category: z.enum(CATEGORIES).optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    paidBy: objectId.optional(),
    member: objectId.optional(),
    sortBy: z.enum(['date', 'amount', 'createdAt']).default('date'),
    order: z.enum(['asc', 'desc']).default('desc')
  }).strict()
};

export const expenseIdSchema = {
  params: z.object({ expenseId: objectId }).strict()
};