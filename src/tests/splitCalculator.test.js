import test from 'node:test';
import assert from 'node:assert/strict';
import { fromPaise, toPaise } from '../utils/money.js';
import { calculateSplits, distribute } from '../utils/splitCalculator.js';

const members = ['a', 'b', 'c'];

test('money conversion uses integer paise and returns rupees at the boundary', () => {
  assert.equal(toPaise(100.5), 10050);
  assert.equal(fromPaise(10050), 100.5);
});

test('largest remainder is exact and deterministic for the requested examples', () => {
  assert.deepEqual(distribute(10000, [1, 1, 1]), [3334, 3333, 3333]);
  assert.deepEqual(distribute(10000, [1, 2]), [3333, 6667]);
  assert.deepEqual(distribute(99999, [5000, 3000, 2000]), [49999, 30000, 20000]);
  assert.equal(distribute(99999, [5000, 3000, 2000]).reduce((sum, value) => sum + value, 0), 99999);
});

test('all four split types produce exact paise totals', () => {
  const cases = [
    {
      splitType: 'EQUAL', total: 10000,
      splits: members.map((member) => ({ member })),
      expected: [3334, 3333, 3333]
    },
    {
      splitType: 'EXACT', total: 3000,
      splits: [{ member: 'a', amount: 1500 }, { member: 'b', amount: 900 }, { member: 'c', amount: 600 }],
      expected: [1500, 900, 600]
    },
    {
      splitType: 'PERCENTAGE', total: 99999,
      splits: [{ member: 'a', percentage: 50 }, { member: 'b', percentage: 30 }, { member: 'c', percentage: 20 }],
      expected: [49999, 30000, 20000]
    },
    {
      splitType: 'SHARES', total: 10000,
      splits: [{ member: 'a', shares: 1 }, { member: 'b', shares: 2 }],
      expected: [3333, 6667]
    }
  ];

  for (const scenario of cases) {
    const result = calculateSplits(scenario);
    assert.deepEqual(result.map((split) => split.owedAmount), scenario.expected);
    assert.equal(result.reduce((sum, split) => sum + split.owedAmount, 0), scenario.total);
  }
});

test('invalid split totals and precision are rejected', () => {
  assert.throws(() => calculateSplits({
    splitType: 'EXACT', total: 3000,
    splits: [{ member: 'a', amount: 1500 }, { member: 'b', amount: 900 }, { member: 'c', amount: 500 }]
  }), { statusCode: 400 });
  assert.throws(() => calculateSplits({
    splitType: 'PERCENTAGE', total: 10000,
    splits: [{ member: 'a', percentage: 50 }, { member: 'b', percentage: 30 }, { member: 'c', percentage: 10 }]
  }), { statusCode: 400 });
  assert.throws(() => distribute(10, [0, 1]), { statusCode: 400 });
});