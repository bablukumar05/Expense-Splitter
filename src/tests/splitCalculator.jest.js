import { describe, expect, test } from '@jest/globals';
import { calculateSplits, distribute } from '../utils/splitCalculator.js';

const sum = (values) => values.reduce((total, value) => total + value, 0);
const seededRandom = (seed) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

describe('largest-remainder distribution', () => {
  test('uses deterministic remainder and tie-breaking', () => {
    expect(distribute(10000, [1, 1, 1])).toEqual([3334, 3333, 3333]);
    expect(distribute(10000, [1, 2])).toEqual([3333, 6667]);
    expect(distribute(99999, [5000, 3000, 2000])).toEqual([49999, 30000, 20000]);
  });

  test('always distributes the exact total for 500 seeded cases', () => {
    const random = seededRandom(7);
    for (let iteration = 0; iteration < 500; iteration += 1) {
      const total = 1 + Math.floor(random() * 100000000);
      const count = 1 + Math.floor(random() * 20);
      const weights = Array.from({ length: count }, () => 1 + Math.floor(random() * 10000));
      const result = distribute(total, weights);
      expect(sum(result)).toBe(total);
      expect(result.every((amount) => amount >= 0)).toBe(true);
    }
  });
});

describe('all expense split types', () => {
  test('equal, exact, percentage, and shares sums are exact', () => {
    const scenarios = [
      { splitType: 'EQUAL', total: 10000, splits: ['a', 'b', 'c'].map((member) => ({ member })) },
      {
        splitType: 'EXACT', total: 3000,
        splits: [{ member: 'a', amount: 1500 }, { member: 'b', amount: 900 }, { member: 'c', amount: 600 }]
      },
      {
        splitType: 'PERCENTAGE', total: 99999,
        splits: [{ member: 'a', percentage: 50 }, { member: 'b', percentage: 30 }, { member: 'c', percentage: 20 }]
      },
      {
        splitType: 'SHARES', total: 10000,
        splits: [{ member: 'a', shares: 1 }, { member: 'b', shares: 2 }]
      }
    ];

    for (const scenario of scenarios) {
      const result = calculateSplits(scenario);
      expect(sum(result.map((entry) => entry.owedAmount))).toBe(scenario.total);
    }
  });
});