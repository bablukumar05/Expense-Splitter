import test from 'node:test';
import assert from 'node:assert/strict';
import { listActivitySchema } from '../validators/activity.validator.js';
import { createSettlementSchema, listSettlementsSchema } from '../validators/settlement.validator.js';

const groupId = '507f1f77bcf86cd799439011';
const memberA = '507f191e810c19729de860ea';
const memberB = '507f191e810c19729de860eb';

test('settlement schemas enforce currency-boundary precision and distinct members', () => {
  const valid = createSettlementSchema.body.safeParse({ from: memberA, to: memberB, amount: 100.5 });
  assert.equal(valid.success, true);
  assert.equal(valid.data.method, 'cash');
  assert.equal(createSettlementSchema.body.safeParse({ from: memberA, to: memberA, amount: 1 }).success, false);
  assert.equal(createSettlementSchema.body.safeParse({ from: memberA, to: memberB, amount: 1.001 }).success, false);
  assert.equal(createSettlementSchema.body.safeParse({ from: memberA, to: memberB, amount: 0 }).success, false);
});

test('settlement and activity listing coerce pagination and reject invalid member filters', () => {
  const settlements = listSettlementsSchema.query.safeParse({ page: '2', limit: '5', from: memberA });
  assert.equal(settlements.success, true);
  assert.equal(settlements.data.page, 2);
  assert.equal(listSettlementsSchema.query.safeParse({ to: 'bad-id' }).success, false);
  assert.equal(listActivitySchema.query.safeParse({ limit: '10' }).data.limit, 10);
  assert.equal(listActivitySchema.params.safeParse({ groupId }).success, true);
});