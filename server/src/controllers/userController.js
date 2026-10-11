import { changePassword } from '../services/authService.js';
import { updateProfile } from '../services/userService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const updateMe = asyncHandler(async (request, response) => {
  const user = await updateProfile(request.user.id, request.validated.body);
  return sendSuccess(response, 200, 'Profile updated successfully', user);
});

export const updatePassword = asyncHandler(async (request, response) => {
  const { currentPassword, newPassword } = request.validated.body;
  await changePassword(request.user, currentPassword, newPassword);
  return sendSuccess(response, 200, 'Password changed successfully. Please log in again.', null);
});