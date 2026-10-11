import test from 'node:test';
import assert from 'node:assert/strict';
import Expense from '../models/Expense.js';
import { collapseExpenseEntries } from '../services/balance.service.js';

test('placeholder history collapse remaps member IDs and combines duplicate amounts', () => {
  const expense = new Expense({
    group: '507f1f77bcf86cd799439011',
    description: 'Dinner',
    amount: 10000,
    paidBy: [
      { member: '507f191e810c19729de860ea', amount: 6000 },
      { member: '507f191e810c19729de860eb', amount: 4000 }
    ],
    splitType: 'EQUAL',
    splits: [
      { member: '507f191e810c19729de860ea', owedAmount: 5000 },
      { member: '507f191e810c19729de860eb', owedAmount: 3000 },
      { member: '507f191e810c19729de860ec', owedAmount: 2000 }
    ],
    createdBy: '507f191e810c19729de860ed'
  });

  const [placeholderId, targetId] = expense.paidBy.map((payer) => payer.member);
  const mergedPayers = collapseExpenseEntries(expense.paidBy, placeholderId, targetId, ['amount']);
  const mergedSplits = collapseExpenseEntries(expense.splits, '507f191e810c19729de860eb', '507f191e810c19729de860ea', ['owedAmount']);

  assert.equal(mergedPayers.length, 1);
  assert.equal(mergedPayers[0].amount, 10000);
  assert.equal(mergedSplits.length, 2);
  assert.equal(mergedSplits.find((split) => String(split.member) === '507f191e810c19729de860ea').owedAmount, 8000);
  assert.equal(mergedSplits.reduce((sum, split) => sum + split.owedAmount, 0), 10000);
});