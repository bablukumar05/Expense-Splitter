import { z } from 'zod';
import { emailSchema, emptyRequest, passwordSchema } from './common.js';

export const registerRequest = {
  ...emptyRequest,
  body: z.object({
    name: z.string().trim().min(1).max(80),
    email: emailSchema,
    password: passwordSchema
  }).strict()
};

export const loginRequest = {
  ...emptyRequest,
  body: z.object({ email: emailSchema, password: z.string().min(1).max(128) }).strict()
};

export const refreshTokenRequest = {
  ...emptyRequest,
  body: z.object({ refreshToken: z.string().min(40).max(256) }).strict()
};

export const forgotPasswordRequest = {
  ...emptyRequest,
  body: z.object({ email: emailSchema }).strict()
};

export const resetPasswordRequest = {
  ...emptyRequest,
  body: z.object({ token: z.string().min(40).max(256), password: passwordSchema }).strict()
};