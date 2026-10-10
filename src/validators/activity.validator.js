import { z } from 'zod';
import { objectId } from './common.js';

export const listActivitySchema = {
  params: z.object({ groupId: objectId }).strict(),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(30)
  }).strict()
};