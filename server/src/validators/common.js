import { z } from 'zod';

export const emptyRequest = {
  body: z.object({}).strict(),
  params: z.object({}).strict(),
  query: z.object({}).strict()
};

export const emailSchema = z.string().trim().email().max(254).transform((email) => email.toLowerCase());
export const passwordSchema = z.string().min(8).max(72);
export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');