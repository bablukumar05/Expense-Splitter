import { z } from 'zod';
import { objectId } from './common.js';

export const groupStatsSchema = {
  params: z.object({ groupId: objectId }).strict()
};

export const exportGroupSchema = {
  params: z.object({ groupId: objectId }).strict(),
  query: z.object({ format: z.enum(['csv', 'pdf']).default('csv') }).strict()
};