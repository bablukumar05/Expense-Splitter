import { describe, expect, test } from '@jest/globals';
import { netBalance } from '../utils/balanceMath.js';

describe('netBalance', () => {
  test('expenses produce a positive creditor balance', () => {
    expect(netBalance({ paid: 300000, owed: 130000 })).toBe(170000);
  });

  test('unpaid share produces a negative debtor balance', () => {
    expect(netBalance({ paid: 0, owed: 130000 })).toBe(-130000);
  });

  test('settlement paid increases debtor net to zero', () => {
    expect(netBalance({ owed: 130000, settledPaid: 130000 })).toBe(0);
  });

  test('settlement received reduces creditor net', () => {
    expect(netBalance({ paid: 300000, owed: 130000, settledReceived: 130000 })).toBe(40000);
  });

  test('missing amounts default to zero', () => {
    expect(netBalance({})).toBe(0);
  });
});