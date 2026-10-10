import Group from '../models/Group.js';
import Settlement from '../models/Settlement.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const loadSettlement = asyncHandler(async (request, _response, next) => {
  const settlementId = request.validated?.params?.settlementId ?? request.params.settlementId;
  const settlement = await Settlement.findOne({ _id: settlementId, isDeleted: false });
  if (!settlement) throw new AppError('Settlement not found', 404);

  const group = await Group.findById(settlement.group);
  const member = group && !group.isArchived
    ? group.findActiveMemberByUser(request.user._id)
    : null;
  if (!member) throw new AppError('Settlement not found', 404);

  request.settlement = settlement;
  request.group = group;
  request.member = member;
  return next();
});