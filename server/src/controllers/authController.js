import * as authService from '../services/authService.js';
import { sendPasswordResetEmail } from '../services/emailService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const register = asyncHandler(async (request, response) => {
  const session = await authService.register(request.validated.body);
  return sendSuccess(response, 201, 'Account created successfully', session);
});

export const login = asyncHandler(async (request, response) => {
  const session = await authService.login(request.validated.body);
  return sendSuccess(response, 200, 'Logged in successfully', session);
});

export const refreshToken = asyncHandler(async (request, response) => {
  const session = await authService.refreshSession(request.validated.body.refreshToken);
  return sendSuccess(response, 200, 'Token refreshed successfully', session);
});

export const logout = asyncHandler(async (request, response) => {
  await authService.logout(request.validated.body.refreshToken);
  return sendSuccess(response, 200, 'Logged out successfully', null);
});

export const me = asyncHandler(async (request, response) => {
  const { id, name, email, avatar, defaultCurrency, createdAt } = request.user;
  return sendSuccess(response, 200, 'Current user retrieved successfully', {
    id, name, email, avatar, defaultCurrency, createdAt
  });
});

export const forgotPassword = asyncHandler(async (request, response) => {
  await authService.requestPasswordReset(request.validated.body.email, sendPasswordResetEmail);
  return sendSuccess(response, 200, 'If an account exists for that email, password reset instructions have been sent', null);
});

export const resetPassword = asyncHandler(async (request, response) => {
  const { token, password } = request.validated.body;
  await authService.resetPassword(token, password);
  return sendSuccess(response, 200, 'Password reset successfully', null);
});