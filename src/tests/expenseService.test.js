import test from 'node:test';
import assert from 'node:assert/strict';
import Expense from '../models/Expense.js';
import { createExpense } from '../services/expense.service.js';

const memberA = '507f1f77bcf86cd799439011';
const memberB = '507f191e810c19729de860ea';
const memberC = '507f191e810c19729de860eb';

test('expense service converts API rupees to paise and only accepts active group member IDs', async () => {
  const originalCreate = Expense.create;
  Expense.create = async (document) => document;

  try {
    const group = {
      _id: '507f1f77bcf86cd799439012',
      currency: 'INR',
      activeMembers: () => [{ _id: memberA }, { _id: memberB }, { _id: memberC }]
    };
    const user = { _id: '507f1f77bcf86cd799439013' };
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
    Expense.create = originalCreate;
  }
});