import { z } from 'zod';
import { objectId } from './common.js';

const money = z.number()
  .positive()
  .max(10_000_000)
  .refine((amount) => Math.abs(amount * 100 - Math.round(amount * 100)) < 1e-6,
    'Maximum 2 decimal places allowed');

export const createSettlementSchema = {
  params: z.object({ groupId: objectId }).strict(),
  body: z.object({
    from: objectId,
    to: objectId,
    amount: money,
    method: z.enum(['cash', 'upi', 'bank', 'other']).default('cash'),
    note: z.string().trim().max(200).optional(),
    date: z.coerce.date().optional()
  }).strict().refine((body) => body.from !== body.to, {
    message: 'A member cannot settle with themselves',
    path: ['to']
  })
};

export const listSettlementsSchema = {
  params: z.object({ groupId: objectId }).strict(),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    member: objectId.optional(),
    from: objectId.optional(),
    to: objectId.optional(),
    fromDate: z.coerce.date().optional(),
    toDate: z.coerce.date().optional(),
    method: z.enum(['cash', 'upi', 'bank', 'other']).optional()
  }).strict()
};

export const settlementIdSchema = {
  params: z.object({ settlementId: objectId }).strict()
};