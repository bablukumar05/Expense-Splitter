import test from 'node:test';
import assert from 'node:assert/strict';
import { createExpenseSchema, listExpensesSchema, updateExpenseSchema } from '../validators/expense.validator.js';

const memberId = '507f1f77bcf86cd799439011';
const groupId = '507f191e810c19729de860ea';
const expenseId = '507f191e810c19729de860eb';
const financials = {
  amount: 100,
  paidBy: [{ member: memberId, amount: 100 }],
  splitType: 'EQUAL',
  splits: [{ member: memberId }]
};

test('expense create validator requires valid rupee precision and payer/split arrays', () => {
  const result = createExpenseSchema.body.safeParse({ description: ' Dinner ', ...financials });
  assert.equal(result.success, true);
  assert.equal(result.data.description, 'Dinner');
  assert.equal(result.data.category, 'general');
  assert.equal(createExpenseSchema.body.safeParse({ description: 'Dinner', ...financials, amount: 10.123 }).success, false);
  assert.equal(createExpenseSchema.body.safeParse({ description: 'Dinner', ...financials, amount: 10.123456 }).success, false);
});

test('expense update requires all financial fields together but allows detail-only edits', () => {
  assert.equal(updateExpenseSchema.body.safeParse({ description: 'Dinner at Taj' }).success, true);
  assert.equal(updateExpenseSchema.body.safeParse({}).success, false);
  assert.equal(updateExpenseSchema.body.safeParse({ amount: 200 }).success, false);
  assert.equal(updateExpenseSchema.body.safeParse(financials).success, true);
});

test('expense list validator coerces pagination and validates query filters', () => {
  const result = listExpensesSchema.query.safeParse({ page: '3', limit: '25', order: 'asc' });
  assert.equal(result.success, true);
  assert.equal(result.data.page, 3);
  assert.equal(result.data.limit, 25);
  assert.equal(result.data.sortBy, 'date');
  assert.equal(listExpensesSchema.query.safeParse({ page: '0' }).success, false);
  assert.equal(listExpensesSchema.query.safeParse({ member: 'bad-id' }).success, false);
  assert.ok(groupId && expenseId);
});