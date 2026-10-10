import * as inviteService from '../services/invite.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const getInvite = asyncHandler(async (request, response) => {
  const invite = await inviteService.getInvite(request.group._id);
  return sendSuccess(response, 200, 'Invite link', { invite });
});

export const regenerateInvite = asyncHandler(async (request, response) => {
  const invite = await inviteService.regenerateInvite(request.group._id);
  return sendSuccess(response, 200, 'New invite link created. Old link no longer works.', { invite });
});

export const revokeInvite = asyncHandler(async (request, response) => {
  const invite = await inviteService.revokeInvite(request.group._id);
  return sendSuccess(response, 200, 'Invite link disabled', { invite });
});

export const updateInviteSettings = asyncHandler(async (request, response) => {
  const invite = await inviteService.updateInviteSettings(request.group._id, request.validated.body);
  return sendSuccess(response, 200, 'Invite settings updated', { invite });
});

export const inviteByEmail = asyncHandler(async (request, response) => {
  await inviteService.inviteByEmail(request.group, request.user, request.validated.body.email);
  return sendSuccess(response, 200, 'If the email is valid, an invitation has been sent', null);
});

export const previewInvite = asyncHandler(async (request, response) => {
  const group = await inviteService.previewInvite(request.validated.params.inviteCode);
  return sendSuccess(response, 200, 'Invite preview', { group });
});

export const joinInvite = asyncHandler(async (request, response) => {
  const group = await inviteService.joinViaInvite(request.user, request.validated.params.inviteCode);
  return sendSuccess(response, 200, 'Joined the group', {
    group: { id: group._id, name: group.name }
  });
});