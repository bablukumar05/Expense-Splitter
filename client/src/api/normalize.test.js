import { describe, expect, it } from "vitest";
import {
  normalizeGroupStats,
  normalizePersonalStats,
  normalizeRecurring,
  normalizeRecurringList,
} from "./normalize";

const canonical = {
  currency: "INR",
  totals: {
    totalSpend: 3900,
    expenseCount: 2,
    averagePerExpense: 1950,
    biggestExpense: { description: "Hotel", amount: 3000 },
  },
  byCategory: [
    { category: "food", amount: 900, count: 1 },
    { category: "stay", amount: 3000, count: 1 },
  ],
  byMember: [
    { member: "m1", name: "Bablu", paid: 3000, share: 1300, net: 1700 },
    { member: "m2", name: "Priya", paid: 900, share: 1300, net: -400 },
    { member: "m3", name: "Rahul", paid: 0, share: 1300, net: -1300 },
  ],
  monthly: [{ month: "2026-10", amount: 3900, count: 2 }],
  topSpender: { member: "m1", name: "Bablu", paid: 3000 },
};

describe("normalizeGroupStats", () => {
  it("contract wali shape", () => {
    const stats = normalizeGroupStats(canonical);
    expect(stats.totalSpend).toBe(3900);
    expect(stats.expenseCount).toBe(2);
    expect(stats.averagePerExpense).toBe(1950);
    expect(stats.biggestExpense).toEqual({ description: "Hotel", amount: 3000 });
    expect(stats.topSpender).toEqual({ member: "m1", name: "Bablu", paid: 3000 });
    expect(stats.byMember[1].net).toBe(-400);
    expect(stats.monthly[0]).toEqual({ month: "2026-10", amount: 3900, count: 2 });
  });

  it("sorts categories by amount in descending order", () => {
    const stats = normalizeGroupStats(canonical);
    expect(stats.byCategory.map((row) => row.category)).toEqual(["stay", "food"]);
  });

  it("handles alternative naming conventions for summary, categories, members, and trend", () => {
    const stats = normalizeGroupStats({
      summary: { total: 3900, count: 2 },
      categories: [{ _id: "food", total: 900 }],
      members: [{ _id: "m1", paid: 3000, owed: 1300 }],
      trend: [{ _id: { year: 2026, month: 10 }, total: 3900 }],
    });
    expect(stats.totalSpend).toBe(3900);
    expect(stats.expenseCount).toBe(2);
    expect(stats.averagePerExpense).toBe(1950);
    expect(stats.byCategory[0]).toMatchObject({ category: "food", amount: 900 });
    expect(stats.byMember[0]).toMatchObject({ member: "m1", paid: 3000, share: 1300, net: 1700 });
    expect(stats.monthly[0]).toMatchObject({ month: "2026-10", amount: 3900 });
  });

  it("falls back to highest paying member when topSpender is missing", () => {
    const stats = normalizeGroupStats({
      members: [
        { _id: "m1", paid: 3000, owed: 1300 },
        { _id: "m2", paid: 900, owed: 1300 },
      ],
    });
    expect(stats.topSpender).toEqual({ member: "m1", name: null, paid: 3000 });
  });

  it("handles empty or undefined input gracefully", () => {
    expect(normalizeGroupStats(undefined)).toEqual({
      totalSpend: 0,
      expenseCount: 0,
      averagePerExpense: 0,
      biggestExpense: null,
      topSpender: null,
      byCategory: [],
      monthly: [],
      byMember: [],
    });
  });

  it("filters out categories with zero amount", () => {
    expect(normalizeGroupStats({ byCategory: [{ category: "food", amount: 0 }] }).byCategory).toEqual([]);
  });
});

describe("normalizePersonalStats", () => {
  it("groups by currency with largest share first", () => {
    const { currencies } = normalizePersonalStats({
      currencies: {
        USD: { totalShare: 50 },
        INR: {
          totalShare: 1300,
          totalPaid: 3000,
          expenseCount: 2,
          byCategory: [{ category: "stay", amount: 1000 }],
          monthly: [{ month: "2026-10", amount: 1300 }],
          topGroup: { groupId: "g1", name: "Goa Trip", amount: 1300 },
        },
      },
    });
    expect(currencies.map((c) => c.currency)).toEqual(["INR", "USD"]);
    expect(currencies[0].totalPaid).toBe(3000);
    expect(currencies[0].topGroup).toEqual({ groupId: "g1", name: "Goa Trip", amount: 1300 });
    expect(currencies[0].monthly[0].month).toBe("2026-10");
  });

  it("accepts array format directly", () => {
    const { currencies } = normalizePersonalStats({ currencies: [{ currency: "USD", totalShare: 5 }] });
    expect(currencies).toHaveLength(1);
    expect(currencies[0]).toMatchObject({ currency: "USD", totalShare: 5 });
  });

  it("returns empty array for invalid or non-currency keys", () => {
    expect(normalizePersonalStats({ foo: { totalShare: 5 } }).currencies).toEqual([]);
    expect(normalizePersonalStats(null).currencies).toEqual([]);
  });
});

describe("normalizeRecurring", () => {
  const raw = {
    recurring: {
      _id: "r1",
      group: "g1",
      description: "Rent",
      amount: 15000,
      frequency: "monthly",
      startDate: "2026-11-01T00:00:00.000Z",
      nextRunAt: "2026-11-01T00:00:00.000Z",
      active: false,
      createdBy: { _id: "u1" },
      paidBy: [{ member: "m1", amount: 15000 }],
      splits: [{ member: "m1", owedAmount: 5000 }],
    },
  };

  it("normalizes nested wrapper and alternative field names", () => {
    const template = normalizeRecurring(raw);
    expect(template._id).toBe("r1");
    expect(template.group).toBe("g1");
    expect(template.amount).toBe(15000);
    expect(template.isActive).toBe(false);
    expect(template.createdBy).toBe("u1");
    expect(template.paidBy[0]).toEqual({ member: "m1", amount: 15000 });
    expect(template.splits[0].amount).toBe(5000);
    expect(template.occurrenceCount).toBe(0);
    expect(template.endDate).toBeNull();
    expect(template.lastError).toBe("");
  });

  it("defaults isActive to true and frequency to monthly when omitted", () => {
    const template = normalizeRecurring({ recurring: { _id: "r2" } });
    expect(template.isActive).toBe(true);
    expect(template.frequency).toBe("monthly");
    expect(normalizeRecurring({ _id: "r3", frequency: "weekly" }).frequency).toBe("weekly");
  });

  it("handles wrapped array, direct array, or empty values", () => {
    expect(normalizeRecurringList({ recurring: [{ _id: "a" }, { _id: "b" }] })).toHaveLength(2);
    expect(normalizeRecurringList([{ _id: "a" }])).toHaveLength(1);
    expect(normalizeRecurringList(null)).toEqual([]);
  });
});
