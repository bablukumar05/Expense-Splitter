import * as settlementService from '../services/settlement.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const createSettlement = asyncHandler(async (request, response) => {
  const settlement = await settlementService.createSettlement(
    request.group,
    request.member,
    request.user,
    request.validated.body
  );
  return sendSuccess(response, 201, 'Settlement recorded', { settlement });
});

export const listSettlements = asyncHandler(async (request, response) => {
  const data = await settlementService.listSettlements(request.group, request.validated.query);
  return sendSuccess(response, 200, 'Settlements fetched', data);
});

export const deleteSettlement = asyncHandler(async (request, response) => {
  await settlementService.voidSettlement(request.settlement._id, request.user, request.member);
  return sendSuccess(response, 200, 'Settlement undone', null);
});