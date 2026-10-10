import { z } from 'zod';
import { objectId } from './common.js';

export const createCommentSchema = {
  params: z.object({ expenseId: objectId }).strict(),
  body: z.object({ text: z.string().trim().min(1).max(2000) }).strict()
};

export const expenseCommentsSchema = {
  params: z.object({ expenseId: objectId }).strict()
};

export const commentIdSchema = {
  params: z.object({ expenseId: objectId, commentId: objectId }).strict()
};