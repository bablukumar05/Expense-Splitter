import { z } from 'zod';
import { emptyRequest, passwordSchema } from './common.js';

export const updateProfileRequest = {
  ...emptyRequest,
  body: z.object({
    name: z.string().trim().min(1).max(80).optional(),
    avatar: z.string().url().max(2048).nullable().optional(),
    defaultCurrency: z.string().regex(/^[A-Za-z]{3}$/).transform((currency) => currency.toUpperCase()).optional()
  }).strict().refine((body) => Object.keys(body).length > 0, 'At least one profile field is required')
};

export const changePasswordRequest = {
  ...emptyRequest,
  body: z.object({
    currentPassword: z.string().min(1).max(128),
    newPassword: passwordSchema
  }).strict().refine((body) => body.currentPassword !== body.newPassword, {
    message: 'New password must differ from current password',
    path: ['newPassword']
  })
};