import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import Expense from '../models/Expense.js';
import Group from '../models/Group.js';
import Settlement from '../models/Settlement.js';
import { getGroupBalances, getSimplifiedPlan, getUserOverallBalances } from '../services/balance.service.js';

const memberA = '507f1f77bcf86cd799439011';
const memberB = '507f191e810c19729de860ea';
const memberC = '507f191e810c19729de860eb';
const groupId = '507f191e810c19729de860ec';

function aggregateFixture(pipeline) {
  const unwind = pipeline.find((stage) => stage.$unwind)?.$unwind;
  if (unwind === '$paidBy') {
    return [{ _id: new mongoose.Types.ObjectId(memberA), total: 300000 }, { _id: new mongoose.Types.ObjectId(memberB), total: 90000 }];
  }
  if (unwind === '$splits') {
    return [
      { _id: new mongoose.Types.ObjectId(memberA), total: 130000 },
      { _id: new mongoose.Types.ObjectId(memberB), total: 130000 },
      { _id: new mongoose.Types.ObjectId(memberC), total: 130000 }
    ];
  }
  return [];
}

function makeGroup() {
  const members = [
    { _id: new mongoose.Types.ObjectId(memberA), name: 'Asha', isPlaceholder: false, isActive: true },
    { _id: new mongoose.Types.ObjectId(memberB), name: 'Bala', isPlaceholder: false, isActive: true },
    { _id: new mongoose.Types.ObjectId(memberC), name: 'Charu', isPlaceholder: false, isActive: true }
  ];
  members.id = (id) => members.find((member) => String(member._id) === String(id));
  return { _id: new mongoose.Types.ObjectId(groupId), currency: 'INR', members };
}

test('balance service aggregates expenses with the corrected creditor/debtor sign', async () => {
  const originalExpenseAggregate = Expense.aggregate;
  const originalSettlementAggregate = Settlement.aggregate;
  Expense.aggregate = (pipeline) => Promise.resolve(aggregateFixture(pipeline));
  Settlement.aggregate = () => Promise.resolve([]);

  try {
    const group = makeGroup();
    const balances = await getGroupBalances(group, group.members[0]);
    assert.equal(balances.isBalanced, true);
    assert.equal(balances.you.balance, 1700);
    assert.deepEqual(balances.balances.map(({ name, balance }) => [name, balance]), [
      ['Asha', 1700], ['Bala', -400], ['Charu', -1300]
    ]);
    assert.equal(balances.balances[0].paid, 3000);
    assert.equal(balances.balances[0].owed, 1300);

    const plan = await getSimplifiedPlan(group, group.members[0]);
    assert.deepEqual(plan.transactions.map(({ from, to, amount }) => [from.name, to.name, amount]), [
      ['Charu', 'Asha', 1300], ['Bala', 'Asha', 400]
    ]);
    const mineOnly = await getSimplifiedPlan(group, group.members[1], true);
    assert.deepEqual(mineOnly.transactions.map(({ from, to }) => [from.name, to.name]), [['Bala', 'Asha']]);
  } finally {
    Expense.aggregate = originalExpenseAggregate;
    Settlement.aggregate = originalSettlementAggregate;
  }
});

test('settlement paid adds to debtor net and settlement received subtracts from creditor net', async () => {
  const originalExpenseAggregate = Expense.aggregate;
  const originalSettlementAggregate = Settlement.aggregate;
  Expense.aggregate = (pipeline) => Promise.resolve(aggregateFixture(pipeline));
  Settlement.aggregate = (pipeline) => {
    const side = pipeline.find((stage) => stage.$group)?.$group?._id?.slice(1);
    if (side === 'from') return Promise.resolve([{ _id: new mongoose.Types.ObjectId(memberC), total: 130000 }]);
    if (side === 'to') return Promise.resolve([{ _id: new mongoose.Types.ObjectId(memberA), total: 130000 }]);
    return Promise.resolve([]);
  };

  try {
    const group = makeGroup();
    const balances = await getGroupBalances(group, group.members[0]);
    assert.equal(balances.isBalanced, true);
    assert.deepEqual(balances.balances.map(({ name, balance }) => [name, balance]), [
      ['Asha', 400], ['Charu', 0], ['Bala', -400]
    ]);
    assert.equal(balances.balances.find((row) => row.name === 'Charu').settledPaid, 1300);
    assert.equal(balances.balances.find((row) => row.name === 'Asha').settledReceived, 1300);
  } finally {
    Expense.aggregate = originalExpenseAggregate;
    Settlement.aggregate = originalSettlementAggregate;
  }
});

test('overall balances keep separate currencies and aggregate by the user member in each group', async () => {
  const userId = new mongoose.Types.ObjectId('507f191e810c19729de860ed');
  const inrMemberId = new mongoose.Types.ObjectId(memberA);
  const usdMemberId = new mongoose.Types.ObjectId(memberB);
  const groups = [
    {
      _id: new mongoose.Types.ObjectId('507f191e810c19729de860f1'),
      name: 'India trip',
      currency: 'INR',
      findActiveMemberByUser: () => ({ _id: inrMemberId })
    },
    {
      _id: new mongoose.Types.ObjectId('507f191e810c19729de860f2'),
      name: 'US trip',
      currency: 'USD',
      findActiveMemberByUser: () => ({ _id: usdMemberId })
    }
  ];
  const originalGroupFind = Group.find;
  const originalExpenseAggregate = Expense.aggregate;
  const originalSettlementAggregate = Settlement.aggregate;
  Group.find = () => ({ select: async () => groups });
  Expense.aggregate = (pipeline) => {
    const unwind = pipeline.find((stage) => stage.$unwind)?.$unwind;
    const memberMatch = pipeline.find((stage) => stage.$match?.['paidBy.member'] || stage.$match?.['splits.member']);
    const ids = memberMatch?.$match?.[unwind === '$paidBy' ? 'paidBy.member' : 'splits.member']?.$in ?? [];
    if (unwind === '$paidBy') {
      return Promise.resolve(ids.filter((id) => String(id) === String(inrMemberId)).map((id) => ({ _id: id, total: 300000 })));
    }
    return Promise.resolve(ids.map((id) => ({
      _id: id,
      total: String(id) === String(inrMemberId) ? 130000 : 50000
    })));
  };
  Settlement.aggregate = () => Promise.resolve([]);

  try {
    const result = await getUserOverallBalances(userId);
    assert.deepEqual(result.summary, {
      INR: { youAreOwed: 1700, youOwe: 0, net: 1700 },
      USD: { youAreOwed: 0, youOwe: 500, net: -500 }
    });
    assert.deepEqual(result.groups.map((entry) => entry.currency), ['INR', 'USD']);
  } finally {
    Group.find = originalGroupFind;
    Expense.aggregate = originalExpenseAggregate;
    Settlement.aggregate = originalSettlementAggregate;
  }
});