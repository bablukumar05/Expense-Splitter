import { describe, expect, test } from '@jest/globals';
import { simplifyDebts } from '../utils/simplifyDebts.js';

const balancesFrom = (values) => Object.entries(values).map(([member, balance]) => ({ member, balance }));

function applyPlan(balances, plan) {
  const state = Object.fromEntries(balances.map(({ member, balance }) => [String(member), balance]));
  for (const transaction of plan) {
    state[transaction.from] += transaction.amount;
    state[transaction.to] -= transaction.amount;
  }
  return state;
}

const seededRandom = (seed) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

describe('simplifyDebts', () => {
  test('settles a two-member balance in one transfer', () => {
    expect(simplifyDebts(balancesFrom({ A: 5000, B: -5000 }))).toEqual([
      { from: 'B', to: 'A', amount: 5000 }
    ]);
  });

  test('matches the two-payment group example', () => {
    expect(simplifyDebts(balancesFrom({ A: 170000, B: -40000, C: -130000 }))).toEqual([
      { from: 'C', to: 'A', amount: 130000 },
      { from: 'B', to: 'A', amount: 40000 }
    ]);
  });

  test('zero balances need no transactions and ties are deterministic', () => {
    expect(simplifyDebts(balancesFrom({ A: 0, B: 0 }))).toEqual([]);
    expect(simplifyDebts(balancesFrom({ A: 100, B: 100, C: -200 }))).toEqual([
      { from: 'C', to: 'A', amount: 100 },
      { from: 'C', to: 'B', amount: 100 }
    ]);
  });

  test('rejects fractional paise and non-zero totals', () => {
    expect(() => simplifyDebts(balancesFrom({ A: 10.5, B: -10.5 }))).toThrow(/integers/);
    expect(() => simplifyDebts(balancesFrom({ A: 100, B: -90 }))).toThrow(/do not add up to zero/);
  });

  test('seeded property check settles 200 random groups in at most n-1 transfers', () => {
    const random = seededRandom(42);
    for (let iteration = 0; iteration < 200; iteration += 1) {
      const memberCount = 2 + Math.floor(random() * 11);
      const balances = [];
      let total = 0;
      for (let index = 0; index < memberCount - 1; index += 1) {
        const balance = Math.floor(random() * 2000001) - 1000000;
        balances.push({ member: `M${index}`, balance });
        total += balance;
      }
      balances.push({ member: `M${memberCount - 1}`, balance: -total });

      const plan = simplifyDebts(balances);
      expect(Object.values(applyPlan(balances, plan)).every((balance) => balance === 0)).toBe(true);
      const nonZeroMembers = balances.filter((entry) => entry.balance !== 0).length;
      expect(plan.length).toBeLessThanOrEqual(Math.max(nonZeroMembers - 1, 0));

      const initial = Object.fromEntries(balances.map((entry) => [entry.member, entry.balance]));
      for (const transaction of plan) {
        expect(transaction.amount).toBeGreaterThan(0);
        expect(initial[transaction.from]).toBeLessThan(0);
        expect(initial[transaction.to]).toBeGreaterThan(0);
      }
    }
  });
});