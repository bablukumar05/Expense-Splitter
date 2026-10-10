import test from 'node:test';
import assert from 'node:assert/strict';
import Group from '../models/Group.js';
import { toGroupResponse } from '../services/group.service.js';
import { generateInviteCode } from '../utils/inviteCode.js';

test('group serialization keeps member IDs but never exposes its invite code', () => {
  const userId = '507f1f77bcf86cd799439011';
  const group = new Group({
    name: 'Goa Trip',
    type: 'home',
    emoji: '🏠',
    createdBy: userId,
    invite: { code: 'secret-invite-code' },
    members: [
      { user: userId, name: 'Asha', role: 'admin' },
      { name: 'Rahul', isPlaceholder: true },
      { user: '507f191e810c19729de860ea', name: 'Inactive', isActive: false }
    ]
  });

  const serialized = group.toJSON();
  const activeResponse = toGroupResponse(group);

  assert.equal(serialized.invite, undefined);
  assert.equal(serialized.type, 'home');
  assert.equal(serialized.emoji, '🏠');
  assert.ok(serialized.members[0]._id);
  assert.notEqual(String(serialized.members[0]._id), String(serialized.members[0].user));
  assert.equal(serialized.members[1].user, null);
  assert.equal(serialized.members[0].isBlocked, false);
  assert.equal(activeResponse.members.length, 2);
  assert.equal(activeResponse.members.some((member) => member.name === 'Inactive'), false);
});

test('invite codes contain 128 bits of URL-safe random data', () => {
  const first = generateInviteCode();
  const second = generateInviteCode();

  assert.match(first, /^[A-Za-z0-9_-]{22}$/);
  assert.notEqual(first, second);
});