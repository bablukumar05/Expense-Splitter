import Group from '../models/Group.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const loadGroup = asyncHandler(async (request, _response, next) => {
  const groupId = request.validated?.params?.groupId ?? request.params.groupId;
  const group = await Group.findById(groupId);

  if (!group || group.isArchived) throw new AppError('Group not found', 404);

  const member = group.findActiveMemberByUser(request.user._id);
  if (!member) throw new AppError('Group not found', 404);

  request.group = group;
  request.member = member;
  return next();
});

export function requireAdmin(request, _response, next) {
  if (request.member.role !== 'admin') {
    return next(new AppError('Only group admins can do this', 403));
  }
  return next();
}