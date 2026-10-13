import { z } from 'zod';
import { objectId } from './common.js';

export const groupStatsSchema = {
  params: z.object({ groupId: objectId }).strict(),
  query: z.object({
    fromDate: z.coerce.date().optional(),
    toDate: z.coerce.date().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    category: z.string().trim().optional(),
    timezone: z.string().trim().default('Asia/Kolkata')
  }).passthrough().optional()
};

export const userStatsSchema = {
  query: z.object({
    fromDate: z.coerce.date().optional(),
    toDate: z.coerce.date().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    category: z.string().trim().optional(),
    timezone: z.string().trim().default('Asia/Kolkata')
  }).passthrough().optional()
};

export const exportGroupSchema = {
  params: z.object({ groupId: objectId }).strict(),
  query: z.object({
    format: z.enum(['csv', 'pdf']).default('csv'),
    fromDate: z.coerce.date().optional(),
    toDate: z.coerce.date().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    category: z.string().trim().optional(),
    member: objectId.optional()
  }).passthrough().optional()
};