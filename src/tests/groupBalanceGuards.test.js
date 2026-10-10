import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import Expense from '../models/Expense.js';
import Settlement from '../models/Settlement.js';
import { archiveGroup, leaveGroup, removeMember } from '../services/group.service.js';

const groupId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');
const adminId = new mongoose.Types.ObjectId('507f191e810c19729de860ea');
const memberId = new mongoose.Types.ObjectId('507f191e810c19729de860eb');

function makeGroup() {
  const member = {
    _id: memberId,
    role: 'member',
    isActive: true,
    isBlocked: false,
    leftAt: null
  };
  const admin = { _id: adminId, role: 'admin', isActive: true };
  const members = [admin, member];
  return {
    _id: groupId,
    members: Object.assign(members, { id: (id) => members.find((entry) => entry._id.equals(id)) }),
    activeMembers: () => members.filter((entry) => entry.isActive),
    save: async () => {}
  };
}

async function withUnsettledBalance(callback) {
  const originalExpenseAggregate = Expense.aggregate;
  const originalSettlementAggregate = Settlement.aggregate;
  Expense.aggregate = (pipeline) => {
    const unwind = pipeline.find((stage) => stage.$unwind)?.$unwind;
    if (unwind === '$paidBy') return Promise.resolve([{ _id: memberId, total: 1000 }]);
    return Promise.resolve([]);
  };
  Settlement.aggregate = () => Promise.resolve([]);

  try {
    await callback();
  } finally {
    Expense.aggregate = originalExpenseAggregate;
    Settlement.aggregate = originalSettlementAggregate;
  }
}

test('leave, remove, and archive guards reject non-zero aggregate balances', async () => {
  await withUnsettledBalance(async () => {
    const groupForLeave = makeGroup();
    await assert.rejects(leaveGroup(groupForLeave, groupForLeave.members[1]), {
      statusCode: 400,
      message: 'You have an unsettled balance. Settle up before leaving.'
    });

    const groupForRemoval = makeGroup();
    await assert.rejects(removeMember(groupForRemoval, memberId, groupForRemoval.members[0]), {
      statusCode: 400,
      message: 'Member has an unsettled balance. Settle up first.'
    });

    await assert.rejects(archiveGroup(makeGroup()), {
      statusCode: 400,
      message: 'Settle all balances before deleting the group'
    });
  });
});