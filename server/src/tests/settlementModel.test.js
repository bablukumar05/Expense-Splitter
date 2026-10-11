import test from 'node:test';
import assert from 'node:assert/strict';
import Settlement from '../models/Settlement.js';

test('settlement requires integer paise and cannot pay itself', async () => {
  const base = {
    group: '507f1f77bcf86cd799439011',
    from: '507f191e810c19729de860ea',
    to: '507f191e810c19729de860eb',
    amount: 10050,
    createdBy: '507f191e810c19729de860ec'
  };

  await expectRejects(new Settlement({ ...base, amount: 100.5 }).validate(), /safe integer number of paise/);
  await expectRejects(new Settlement({ ...base, to: base.from }).validate(), /cannot settle with themselves/);

  const settlement = new Settlement(base);
  await settlement.validate();
  assert.equal(settlement.status, 'completed');
  assert.equal(settlement.toJSON().amount, 100.5);
  assert.equal(settlement.toObject().amount, 10050);
});

async function expectRejects(promise, message) {
  await assert.rejects(promise, message);
}