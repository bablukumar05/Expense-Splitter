import mongoose from 'mongoose';
import Group, { MAX_GROUPS_PER_USER, MAX_MEMBERS } from '../models/Group.js';
import { AppError } from '../utils/AppError.js';
import { generateInviteCode } from '../utils/inviteCode.js';
import {
  getMemberNetBalance,
  groupHasUnsettledBalances,
  mergeMemberHistory
} from './balance.service.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const countUserGroups = (userId) => Group.countDocuments({
  isArchived: false,
  members: { $elemMatch: { user: userId, isActive: true } }
});

async function assertUserGroupLimit(userId) {
  if ((await countUserGroups(userId)) >= MAX_GROUPS_PER_USER) {
    throw new AppError(`A user can be in at most ${MAX_GROUPS_PER_USER} groups`, 400);
  }
}

function assertCapacity(group) {
  if (group.activeMembers().length >= MAX_MEMBERS) {
    throw new AppError(`A group can have at most ${MAX_MEMBERS} members`, 400);
  }
}

export function toGroupResponse(group) {
  const response = group.toJSON();
  response.members = response.members.filter((member) => member.isActive);
  return response;
}

export async function createGroup(user, { name, description, currency, type, emoji }) {
  await assertUserGroupLimit(user._id);
  return Group.create({
    name,
    description,
    type,
    emoji,
    currency: currency || user.defaultCurrency,
    createdBy: user._id,
    members: [{ user: user._id, name: user.name, role: 'admin' }],
    invite: { code: generateInviteCode() }
  });
}

export async function listGroups(userId, { page, limit, search }) {
  const filter = {
    isArchived: false,
    members: { $elemMatch: { user: userId, isActive: true } }
  };
  if (search) filter.name = { $regex: escapeRegex(search), $options: 'i' };

  const [groups, total] = await Promise.all([
    Group.find(filter).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit),
    Group.countDocuments(filter)
  ]);

  return {
    groups: groups.map((group) => {
      const response = group.toJSON();
      response.memberCount = group.activeMembers().length;
      delete response.members;
      return response;
    }),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  };
}

export async function updateGroup(group, changes) {
  if (changes.name !== undefined) group.name = changes.name;
  if (changes.description !== undefined) group.description = changes.description;
  if (changes.type !== undefined) group.type = changes.type;
  if (changes.emoji !== undefined) group.emoji = changes.emoji;
  await group.save();
  return group;
}

export async function archiveGroup(group) {
  if (await groupHasUnsettledBalances(group._id)) {
    throw new AppError('Settle all balances before deleting the group', 400);
  }
  group.isArchived = true;
  group.archivedAt = new Date();
  await group.save();
}

export async function addPlaceholder(group, name) {
  assertCapacity(group);
  const duplicate = group.activeMembers().some((member) => member.name.toLowerCase() === name.toLowerCase());
  if (duplicate) throw new AppError('A member with this name already exists', 409);

  group.members.push({ name, isPlaceholder: true });
  await group.save();
  return group;
}

export async function removeMember(group, memberId, actorMember, block = false) {
  const member = group.members.id(memberId);
  if (!member || !member.isActive) throw new AppError('Member not found', 404);
  if (member._id.equals(actorMember._id)) {
    throw new AppError('Use the leave endpoint to leave the group', 400);
  }

  if (member.role === 'admin') {
    const activeAdmins = group.activeMembers().filter((activeMember) => activeMember.role === 'admin');
    if (activeAdmins.length <= 1) throw new AppError('Group must have at least one admin', 400);
  }
  if ((await getMemberNetBalance(group._id, member._id)) !== 0) {
    throw new AppError('Member has an unsettled balance. Settle up first.', 400);
  }

  member.isActive = false;
  member.isBlocked = block;
  member.leftAt = new Date();
  await group.save();
  return group;
}

export async function unblockMember(group, memberId) {
  const member = group.members.id(memberId);
  if (!member || !member.isBlocked) throw new AppError('Member not found', 404);
  member.isBlocked = false;
  await group.save();
  return group;
}

export async function changeRole(group, memberId, role) {
  const member = group.members.id(memberId);
  if (!member || !member.isActive) throw new AppError('Member not found', 404);
  if (member.isPlaceholder) throw new AppError('A placeholder cannot be an admin', 400);
  if (member.role === role) return group;

  if (role === 'member') {
    const adminCount = group.activeMembers().filter((activeMember) => activeMember.role === 'admin').length;
    if (adminCount <= 1) throw new AppError('Group must have at least one admin', 400);
  }

  member.role = role;
  await group.save();
  return group;
}

export async function leaveGroup(group, member) {
  if ((await getMemberNetBalance(group._id, member._id)) !== 0) {
    throw new AppError('You have an unsettled balance. Settle up before leaving.', 400);
  }

  if (member.role === 'admin') {
    const anotherAdmin = group.activeMembers().some((activeMember) => (
      activeMember.role === 'admin' && !activeMember._id.equals(member._id)
    ));

    if (!anotherAdmin) {
      const successor = group.activeMembers()
        .filter((activeMember) => !activeMember.isPlaceholder && !activeMember._id.equals(member._id))
        .sort((first, second) => first.joinedAt - second.joinedAt)[0];
      if (successor) successor.role = 'admin';
      else {
        group.isArchived = true;
        group.archivedAt = new Date();
      }
    }
  }

  member.isActive = false;
  member.leftAt = new Date();
  await group.save();
}

export async function mergePlaceholder(group, placeholderId, targetMemberId) {
  const placeholder = group.members.id(placeholderId);
  if (!placeholder || !placeholder.isActive || !placeholder.isPlaceholder) {
    throw new AppError('Placeholder not found', 404);
  }
  const target = group.members.id(targetMemberId);
  if (!target || !target.isActive || target.isPlaceholder || !target.user) {
    throw new AppError('Target must be an active registered member', 400);
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await mergeMemberHistory({
        groupId: group._id,
        fromMemberId: placeholder._id,
        toMemberId: target._id,
        session
      });
      placeholder.isActive = false;
      placeholder.leftAt = new Date();
      placeholder.mergedInto = target._id;
      await group.save({ session });
    });
  } finally {
    await session.endSession();
  }

  return group;
}

export async function restoreGroup(groupId, userId) {
  const group = await Group.findById(groupId);
  const member = group?.findActiveMemberByUser(userId);

  if (!group || !group.isArchived || member?.role !== 'admin') {
    throw new AppError('Group not found', 404);
  }
  if (!group.archivedAt || Date.now() - group.archivedAt.getTime() > 30 * 24 * 60 * 60 * 1000) {
    throw new AppError('Restore window of 30 days has passed', 410);
  }

  group.isArchived = false;
  group.archivedAt = null;
  await group.save();
  return group;
}