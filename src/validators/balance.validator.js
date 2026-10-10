import { z } from 'zod';
import { objectId } from './common.js';

export const simplifySchema = {
  params: z.object({ groupId: objectId }).strict(),
  query: z.object({
    mine: z.enum(['true', 'false']).default('false')
  }).strict()
};