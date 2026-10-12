import { listActivity } from '../services/activity.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const getActivity = asyncHandler(async (request, response) => {
  const data = await listActivity(request.group._id, request.validated.query);
  return sendSuccess(response, 200, 'Activity fetched', data);
});