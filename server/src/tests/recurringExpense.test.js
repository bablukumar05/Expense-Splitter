import test from 'node:test';
import assert from 'node:assert/strict';
import RecurringExpense from '../models/RecurringExpense.js';
import { nextRecurringDate } from '../services/recurringExpense.service.js';

test('weekly and monthly recurring dates advance in UTC and clamp month ends', () => {
  const january31 = new Date('2026-01-31T09:30:00.000Z');
  assert.equal(nextRecurringDate(january31, 'weekly').toISOString(), '2026-02-07T09:30:00.000Z');
  assert.equal(nextRecurringDate(january31, 'monthly').toISOString(), '2026-02-28T09:30:00.000Z');
  assert.equal(nextRecurringDate(
    new Date('2026-02-28T09:30:00.000Z'), 'monthly', 31
  ).toISOString(), '2026-03-31T09:30:00.000Z');
});

test('recurring templates store integer paise and constrain frequency/currency', async () => {
  const base = {
    group: '507f1f77bcf86cd799439011',
    description: 'Monthly rent',
    amount: 100000,
    currency: 'INR',
    paidBy: [{ member: '507f191e810c19729de860ea', amount: 100000 }],
    splitType: 'EQUAL',
    splits: [{ member: '507f191e810c19729de860ea' }],
    frequency: 'monthly',
    nextRunAt: new Date(),
    createdBy: '507f191e810c19729de860eb'
  };
  const recurring = new RecurringExpense(base);
  await recurring.validate();
  assert.equal(recurring.toJSON().amount, 1000);
  assert.equal(recurring.toJSON().paidBy[0].amount, 1000);
  assert.equal(recurring.toObject().amount, 100000);
  await assert.rejects(new RecurringExpense({ ...base, amount: 1.25 }).validate(), /safe integer/);
  await assert.rejects(new RecurringExpense({ ...base, frequency: 'yearly' }).validate(), /yearly/);
});