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
  const view = {
    ...settlement.toJSON(),
    fromName: request.group.members.id(settlement.from)?.name ?? 'Unknown',
    toName: request.group.members.id(settlement.to)?.name ?? 'Unknown'
  };
  return sendSuccess(response, 201, 'Settlement recorded', { settlement: view });
});

export const listSettlements = asyncHandler(async (request, response) => {
  const data = await settlementService.listSettlements(request.group, request.validated.query);
  return sendSuccess(response, 200, 'Settlements fetched', data);
});

export const getSettlement = asyncHandler(async (request, response) => {
  const settlement = {
    ...request.settlement.toJSON(),
    fromName: request.group.members.id(request.settlement.from)?.name ?? 'Unknown',
    toName: request.group.members.id(request.settlement.to)?.name ?? 'Unknown'
  };
  return sendSuccess(response, 200, 'Settlement fetched', { settlement });
});

export const deleteSettlement = asyncHandler(async (request, response) => {
  await settlementService.voidSettlement(request.settlement._id, request.user, request.member);
  return sendSuccess(response, 200, 'Settlement undone', null);
});