import * as groupService from '../services/group.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

async function groupPayload(group) {
  await group.populate('members.user', 'name email avatar');
  return { group: groupService.toGroupResponse(group) };
}

export const createGroup = asyncHandler(async (request, response) => {
  const group = await groupService.createGroup(request.user, request.validated.body);
  return sendSuccess(response, 201, 'Group created', await groupPayload(group));
});

export const listGroups = asyncHandler(async (request, response) => {
  const data = await groupService.listGroups(request.user._id, request.validated.query);
  return sendSuccess(response, 200, 'Groups fetched', data);
});

export const getGroup = asyncHandler(async (request, response) => (
  sendSuccess(response, 200, 'Group fetched', await groupPayload(request.group))
));

export const updateGroup = asyncHandler(async (request, response) => {
  const group = await groupService.updateGroup(request.group, request.validated.body);
  return sendSuccess(response, 200, 'Group updated', await groupPayload(group));
});

export const archiveGroup = asyncHandler(async (request, response) => {
  await groupService.archiveGroup(request.group);
  return sendSuccess(response, 200, 'Group deleted', null);
});

export const addPlaceholder = asyncHandler(async (request, response) => {
  const group = await groupService.addPlaceholder(request.group, request.validated.body.name);
  return sendSuccess(response, 201, 'Placeholder member added', await groupPayload(group));
});

export const removeMember = asyncHandler(async (request, response) => {
  const group = await groupService.removeMember(
    request.group,
    request.validated.params.memberId,
    request.member,
    request.validated.query.block === 'true'
  );
  return sendSuccess(response, 200, 'Member removed', await groupPayload(group));
});

export const unblockMember = asyncHandler(async (request, response) => {
  const group = await groupService.unblockMember(request.group, request.validated.params.memberId);
  return sendSuccess(response, 200, 'Member unblocked', await groupPayload(group));
});

export const changeRole = asyncHandler(async (request, response) => {
  const group = await groupService.changeRole(
    request.group,
    request.validated.params.memberId,
    request.validated.body.role
  );
  return sendSuccess(response, 200, 'Role updated', await groupPayload(group));
});

export const leaveGroup = asyncHandler(async (request, response) => {
  await groupService.leaveGroup(request.group, request.member);
  return sendSuccess(response, 200, 'You left the group', null);
});

export const mergePlaceholder = asyncHandler(async (request, response) => {
  const group = await groupService.mergePlaceholder(
    request.group,
    request.validated.params.placeholderId,
    request.validated.body.memberId
  );
  return sendSuccess(response, 200, 'Placeholder merged', await groupPayload(group));
});

export const restoreGroup = asyncHandler(async (request, response) => {
  const group = await groupService.restoreGroup(request.validated.params.groupId, request.user._id);
  return sendSuccess(response, 200, 'Group restored', await groupPayload(group));
});