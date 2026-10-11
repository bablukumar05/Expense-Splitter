import * as analyticsService from '../services/analytics.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const getGroupStats = asyncHandler(async (request, response) => {
  const stats = await analyticsService.getGroupStats(request.group);
  return sendSuccess(response, 200, 'Group statistics fetched', { stats });
});

export const getMyStats = asyncHandler(async (request, response) => {
  const stats = await analyticsService.getUserStats(request.user._id);
  return sendSuccess(response, 200, 'Personal statistics fetched', { stats });
});