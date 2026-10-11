import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import Expense from '../models/Expense.js';
import Group from '../models/Group.js';
import { getGroupStats, getUserStats } from '../services/analytics.service.js';

const groupId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');
const userId = new mongoose.Types.ObjectId('507f191e810c19729de860ea');
const memberId = new mongoose.Types.ObjectId('507f191e810c19729de860eb');

function groupFixture() {
  const members = [{ _id: memberId, name: 'Asha', user: userId, isActive: true }];
  members.id = (id) => members.find((member) => member._id.equals(id));
  return { _id: groupId, name: 'USD Trip', currency: 'INR', members, findActiveMemberByUser: () => members[0] };
}

test('group analytics converts category, monthly, member, and payer totals into group currency', async () => {
  const originalAggregate = Expense.aggregate;
  const originalCount = Expense.countDocuments;
  Expense.aggregate = (pipeline) => {
    const group = pipeline.find((stage) => stage.$group)?.$group;
    if (pipeline.some((stage) => stage.$unwind === '$splits')) {
      return Promise.resolve([{ _id: { member: memberId, currency: 'USD' }, total: 10000 }]);
    }
    if (pipeline.some((stage) => stage.$unwind === '$paidBy')) {
      return Promise.resolve([{ _id: { member: memberId, currency: 'USD' }, total: 10000 }]);
    }
    const id = group?._id;
    if (id && typeof id === 'object' && id.category) {
      return Promise.resolve([{ _id: { category: 'food', currency: 'USD' }, total: 10000 }]);
    }
    if (id && typeof id === 'object' && id.month) {
      return Promise.resolve([{ _id: { month: '2026-10', currency: 'USD' }, total: 10000 }]);
    }
    return Promise.resolve([{ _id: 'USD', total: 10000 }]);
  };
  Expense.countDocuments = async () => 1;

  try {
    const stats = await getGroupStats(groupFixture());
    assert.equal(stats.totalSpend, 8350);
    assert.deepEqual(stats.spendByCategory, [{ category: 'food', amount: 8350 }]);
    assert.deepEqual(stats.spendPerMember, [{ member: String(memberId), name: 'Asha', amount: 8350 }]);
    assert.deepEqual(stats.monthlyTrend, [{ month: '2026-10', amount: 8350 }]);
    assert.equal(stats.topSpender.amount, 8350);
  } finally {
    Expense.aggregate = originalAggregate;
    Expense.countDocuments = originalCount;
  }
});

test('personal statistics separate group currencies and report per-currency totals', async () => {
  const originalFind = Group.find;
  const originalAggregate = Expense.aggregate;
  const inrGroup = groupFixture();
  const usdGroup = { ...groupFixture(), _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'), currency: 'USD', name: 'USD Group' };
  Group.find = () => ({ select: async () => [inrGroup, usdGroup] });
  Expense.aggregate = (pipeline) => {
    const month = pipeline.some((stage) => stage.$group?._id?.month);
    if (month) return Promise.resolve([]);
    return Promise.resolve([
      { _id: { group: inrGroup._id, currency: 'USD' }, total: 10000 },
      { _id: { group: usdGroup._id, currency: 'USD' }, total: 10000 }
    ]);
  };

  try {
    const stats = await getUserStats(userId);
    assert.deepEqual(stats.summary, { INR: { totalSpend: 8350 }, USD: { totalSpend: 100 } });
    assert.equal(stats.groups.length, 2);
  } finally {
    Group.find = originalFind;
    Expense.aggregate = originalAggregate;
  }
});