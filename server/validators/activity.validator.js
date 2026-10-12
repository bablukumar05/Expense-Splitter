import { z } from 'zod';
import { objectId } from './common.js';

export const listActivitySchema = {
  params: z.object({ groupId: objectId }).strict(),
  query: z.object({
    before: objectId.optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(50).default(20)
  }).strict()
};