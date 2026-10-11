import test from 'node:test';
import assert from 'node:assert/strict';
import { validate } from '../middleware/validate.js';
import {
  createGroupSchema,
  inviteSettingsSchema,
  listGroupsSchema,
  mergeSchema,
  removeMemberSchema
} from '../validators/group.validator.js';

test('partial route schemas coerce query pagination without requiring body or params schemas', () => {
  const request = { query: { page: '2', limit: '15' } };
  let validationError;

  validate(listGroupsSchema)(request, {}, (error) => { validationError = error; });

  assert.equal(validationError, undefined);
  assert.equal(request.validated.query.page, 2);
  assert.equal(request.validated.query.limit, 15);
  assert.equal(request.validated.body && Object.keys(request.validated.body).length, 0);
});

test('group validators normalize values and reject invalid settings', () => {
  const group = createGroupSchema.body.safeParse({
    name: '  Goa Trip ', currency: 'inr', type: 'trip', emoji: '🏝️'
  });
  assert.equal(group.success, true);
  assert.equal(group.data.name, 'Goa Trip');
  assert.equal(group.data.currency, 'INR');
  assert.equal(group.data.type, 'trip');
  assert.equal(group.data.emoji, '🏝️');

  assert.equal(inviteSettingsSchema.body.safeParse({ maxUses: 0 }).success, false);
  assert.equal(inviteSettingsSchema.body.safeParse({}).success, false);
});

test('merge and removal schemas require a target and default member blocking off', () => {
  const ids = {
    groupId: '507f1f77bcf86cd799439011',
    placeholderId: '507f191e810c19729de860ea',
    memberId: '507f191e810c19729de860eb'
  };

  assert.equal(mergeSchema.body.safeParse({}).success, false);
  assert.equal(mergeSchema.body.safeParse({ memberId: ids.memberId }).success, true);
  assert.equal(removeMemberSchema.query.safeParse({}).data.block, 'false');
  assert.equal(removeMemberSchema.query.safeParse({ block: 'true' }).data.block, 'true');
  assert.equal(removeMemberSchema.query.safeParse({ block: 'yes' }).success, false);
});