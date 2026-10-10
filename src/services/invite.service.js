import Group, { MAX_GROUPS_PER_USER, MAX_MEMBERS } from '../models/Group.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { generateInviteCode } from '../utils/inviteCode.js';
import { sendEmail } from '../utils/sendEmail.js';
import { countUserGroups } from './group.service.js';

const buildLink = (code) => new URL(`/join/${code}`, env.FRONTEND_URL).toString();

function inviteResponse(invite) {
  return {
    link: buildLink(invite.code),
    isActive: invite.isActive,
    expiresAt: invite.expiresAt,
    maxUses: invite.maxUses,
    usedCount: invite.usedCount
  };
}

const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[character]));

const safeHeader = (value) => value.replace(/[\r\n\t]+/g, ' ').trim();

async function getGroupWithInvite(groupId) {
  const group = await Group.findById(groupId).select('+invite');
  if (!group || !group.invite) throw new AppError('Group not found', 404);
  return group;
}

export async function getInvite(groupId) {
  const group = await getGroupWithInvite(groupId);
  return inviteResponse(group.invite);
}

export async function regenerateInvite(groupId) {
  const group = await getGroupWithInvite(groupId);
  group.invite.code = generateInviteCode();
  group.invite.usedCount = 0;
  group.invite.isActive = true;
  await group.save();
  return inviteResponse(group.invite);
}

export async function revokeInvite(groupId) {
  const group = await getGroupWithInvite(groupId);
  group.invite.isActive = false;
  await group.save();
  return inviteResponse(group.invite);
}

export async function updateInviteSettings(groupId, changes) {
  const group = await getGroupWithInvite(groupId);
  for (const key of ['isActive', 'expiresAt', 'maxUses']) {
    if (changes[key] !== undefined) group.invite[key] = changes[key];
  }
  await group.save();
  return inviteResponse(group.invite);
}

export async function inviteByEmail(group, inviter, email) {
  const currentGroup = await getGroupWithInvite(group._id);
  if (!currentGroup.invite.isActive) throw new AppError('Enable the invite link first', 400);

  const link = buildLink(currentGroup.invite.code);
  const escapedName = escapeHtml(currentGroup.name);
  const escapedInviter = escapeHtml(inviter.name);
  const escapedLink = escapeHtml(link);

  await sendEmail({
    to: email,
    subject: `${safeHeader(inviter.name)} invited you to "${safeHeader(currentGroup.name)}"`,
    text: `${inviter.name} invited you to join ${currentGroup.name} on Expense Splitter. Join: ${link}`,
    html: `<p>${escapedInviter} invited you to join <b>${escapedName}</b> on Expense Splitter.</p><p><a href="${escapedLink}">Join the group</a></p>`
  });
}

function assertInviteActive(group) {
  const invite = group?.invite;
  if (!group || !invite?.isActive || (invite.expiresAt && invite.expiresAt <= new Date())) {
    throw new AppError('Invite link is invalid or has expired', 404);
  }
}

function assertNotExhausted(invite) {
  if (invite.maxUses !== null && invite.maxUses !== undefined && invite.usedCount >= invite.maxUses) {
    throw new AppError('This invite link has reached its usage limit', 410);
  }
}

const findByCode = (code) => Group.findOne({ 'invite.code': code, isArchived: false }).select('+invite');

export async function previewInvite(code) {
  const group = await findByCode(code);
  assertInviteActive(group);
  assertNotExhausted(group.invite);
  return { name: group.name, memberCount: group.activeMembers().length };
}

function inviteGuard(groupId, now) {
  return {
    _id: groupId,
    isArchived: false,
    'invite.isActive': true,
    $and: [
      { $or: [{ 'invite.expiresAt': null }, { 'invite.expiresAt': { $gt: now } }] },
      {
        $or: [
          { 'invite.maxUses': null },
          { $expr: { $lt: ['$invite.usedCount', '$invite.maxUses'] } }
        ]
      },
      {
        $expr: {
          $lt: [
            { $size: { $filter: { input: '$members', cond: { $eq: ['$$this.isActive', true] } } } },
            MAX_MEMBERS
          ]
        }
      }
    ]
  };
}

export async function joinViaInvite(user, code) {
  const group = await findByCode(code);
  assertInviteActive(group);
  assertNotExhausted(group.invite);

  const existing = group.findMemberByUser(user._id);
  if (existing?.isBlocked) throw new AppError("You can't join this group", 403);
  if (existing?.isActive) throw new AppError('You are already a member of this group', 409);
  if (group.activeMembers().length >= MAX_MEMBERS) throw new AppError('This group is full', 400);
  if ((await countUserGroups(user._id)) >= MAX_GROUPS_PER_USER) {
    throw new AppError(`You can be in at most ${MAX_GROUPS_PER_USER} groups`, 400);
  }

  const now = new Date();
  const guard = inviteGuard(group._id, now);
  let updated;

  if (existing) {
    updated = await Group.findOneAndUpdate(
      {
        ...guard,
        members: { $elemMatch: { user: user._id, isActive: false, isBlocked: { $ne: true } } }
      },
      {
        $inc: { 'invite.usedCount': 1 },
        $set: {
          'members.$[member].isActive': true,
          'members.$[member].leftAt': null,
          'members.$[member].role': 'member',
          'members.$[member].name': user.name,
          'members.$[member].joinedAt': now
        }
      },
      {
        new: true,
        arrayFilters: [{ 'member.user': user._id, 'member.isActive': false, 'member.isBlocked': { $ne: true } }]
      }
    );
  } else {
    updated = await Group.findOneAndUpdate(
      { ...guard, 'members.user': { $ne: user._id } },
      {
        $inc: { 'invite.usedCount': 1 },
        $push: {
          members: {
            user: user._id,
            name: user.name,
            role: 'member',
            isPlaceholder: false,
            isActive: true,
            joinedAt: now
          }
        }
      },
      { new: true }
    );
  }

  if (!updated) {
    throw new AppError('Could not join. The link may have just expired or the group became full.', 409);
  }
  return updated;
}