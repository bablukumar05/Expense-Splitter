import test from 'node:test';
import assert from 'node:assert/strict';
import Group from '../models/Group.js';
import { lockGroupBalanceRevision } from '../services/balanceRevision.service.js';

test('balance revision lock handles existing groups with no stored revision', async () => {
  const originalFindById = Group.findById;
  const originalUpdateOne = Group.updateOne;
  const group = { _id: '507f1f77bcf86cd799439011', balanceRevision: 0, isArchived: false };
  let updateFilter;
  Group.findById = () => ({
    select() { return this; },
    session: async () => group
  });
  Group.updateOne = async (filter) => {
    updateFilter = filter;
    return { modifiedCount: 1 };
  };

  try {
    assert.equal(await lockGroupBalanceRevision(group._id, {}), group);
    assert.ok(updateFilter.$or.some((condition) => condition.balanceRevision?.$exists === false));
  } finally {
    Group.findById = originalFindById;
    Group.updateOne = originalUpdateOne;
  }
});