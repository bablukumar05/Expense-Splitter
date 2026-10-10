import test from 'node:test';
import assert from 'node:assert/strict';
import Expense from '../models/Expense.js';

function validExpense(overrides = {}) {
  return new Expense({
    group: '507f1f77bcf86cd799439011',
    description: 'Dinner',
    amount: 10000,
    paidBy: [{ member: '507f191e810c19729de860ea', amount: 10000 }],
    splitType: 'EQUAL',
    splits: [{ member: '507f191e810c19729de860ea', owedAmount: 10000 }],
    createdBy: '507f191e810c19729de860eb',
    ...overrides
  });
}

test('expense model rejects fractional paise and financial totals that do not balance', async () => {
  await assert.rejects(validExpense({ amount: 10000.5 }).validate(), /integer number of paise|Invariant broken/);
  await assert.rejects(validExpense({ paidBy: [{ member: '507f191e810c19729de860ea', amount: 9999 }] }).validate(), /Invariant broken/);
  await assert.rejects(validExpense({ splits: [{ member: '507f191e810c19729de860ea', owedAmount: 9999 }] }).validate(), /Invariant broken/);
});

test('expense JSON converts paise to rupees and hides Cloudinary public IDs', () => {
  const expense = validExpense({
    receiptPublicId: 'secret/public-id',
    comments: [{
      user: '507f191e810c19729de860ec',
      userName: 'Asha',
      text: 'Paid by UPI'
    }]
  });
  const result = expense.toJSON();

  assert.equal(result.amount, 100);
  assert.equal(result.paidBy[0].amount, 100);
  assert.equal(result.splits[0].owedAmount, 100);
  assert.equal(result.receiptPublicId, undefined);
  assert.equal(result.comments[0].text, 'Paid by UPI');
  assert.equal(expense.toObject().amount, 10000);
});