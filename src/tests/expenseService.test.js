import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import Activity from '../models/Activity.js';
import Expense from '../models/Expense.js';
import Group from '../models/Group.js';
import { createExpense } from '../services/expense.service.js';

const memberA = '507f1f77bcf86cd799439011';
const memberB = '507f191e810c19729de860ea';
const memberC = '507f191e810c19729de860eb';

test('expense service converts API rupees to paise and only accepts active group member IDs', async () => {
  const originalStartSession = mongoose.startSession;
  const originalGroupFindById = Group.findById;
  const originalGroupUpdateOne = Group.updateOne;
  const originalExpenseSave = Expense.prototype.save;
  const originalActivitySave = Activity.prototype.save;
  const user = { _id: '507f1f77bcf86cd799439013', name: 'Asha' };
  const group = {
    _id: '507f1f77bcf86cd799439012',
    currency: 'INR',
    isArchived: false,
    members: [],
    activeMembers: () => [{ _id: memberA }, { _id: memberB }, { _id: memberC }],
    findActiveMemberByUser: (userId) => String(userId) === String(user._id) ? { _id: memberA } : undefined
  };
  mongoose.startSession = async () => ({
    withTransaction: async (callback) => callback(),
    endSession: async () => {}
  });
  Group.findById = () => ({
    select() { return this; },
    session: async () => group
  });
  Group.updateOne = async () => ({ modifiedCount: 1 });
  Expense.prototype.save = async function saveExpenseForTest() { return this; };
  Activity.prototype.save = async function saveActivityForTest() { return this; };

  try {
    const body = {
      description: 'Dinner',
      amount: 100,
      paidBy: [{ member: memberA, amount: 100 }],
      splitType: 'EQUAL',
      splits: [{ member: memberA }, { member: memberB }, { member: memberC }]
    };

    const result = await createExpense(group, user, body);
    assert.equal(result.amount, 10000);
    assert.deepEqual(result.splits.map((split) => split.owedAmount), [3334, 3333, 3333]);

    await assert.rejects(createExpense(group, user, {
      ...body,
      splits: [{ member: memberA }, { member: memberA }]
    }), { statusCode: 400, message: 'Duplicate member in splits' });
    await assert.rejects(createExpense(group, user, {
      ...body,
      paidBy: [{ member: memberA, amount: 90 }]
    }), { statusCode: 400 });
    await assert.rejects(createExpense(group, user, {
      ...body,
      splits: [{ member: '507f191e810c19729de860ec' }]
    }), { statusCode: 400 });
  } finally {
    mongoose.startSession = originalStartSession;
    Group.findById = originalGroupFindById;
    Group.updateOne = originalGroupUpdateOne;
    Expense.prototype.save = originalExpenseSave;
    Activity.prototype.save = originalActivitySave;
  }
});