import * as balanceService from '../services/balance.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const getBalances = asyncHandler(async (request, response) => {
  const data = await balanceService.getGroupBalances(request.group, request.member);
  return sendSuccess(response, 200, 'Balances fetched', data);
});

export const getSimplifiedPlan = asyncHandler(async (request, response) => {
  const data = await balanceService.getSimplifiedPlan(
    request.group,
    request.member,
    request.validated.query.mine === 'true'
  );
  return sendSuccess(response, 200, 'Settle-up plan generated', data);
});

export const getMyBalances = asyncHandler(async (request, response) => {
  const data = await balanceService.getUserOverallBalances(request.user._id);
  return sendSuccess(response, 200, 'Overall balances fetched', data);
});