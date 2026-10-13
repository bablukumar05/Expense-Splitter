import { describe, expect, it } from "vitest";
import {
  computePaidBy,
  computeSplits,
  defaultPayerState,
  distribute,
  equalAmounts,
  equalPercentages,
  myPosition,
  normalizePayload,
  payerStateFromExpense,
  splitPayload,
  splitStateFromExpense,
  toPaise,
} from "./split";

const sum = (list) => list.reduce((a, b) => a + b, 0);
const makeRng = (seed) => () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const row = (member, extra = {}) => ({
  member,
  included: true,
  amount: "",
  percentage: "",
  shares: "1",
  ...extra,
});

describe("toPaise", () => {
  it("float ki galti se bachata hai", () => {
    expect(toPaise(33.34)).toBe(3334);
    expect(toPaise(1300.5)).toBe(130050);
    expect(toPaise(0.1 + 0.2)).toBe(30);
  });
});

describe("distribute (aligns with backend split algorithm)", () => {
  it("splits ₹100 into 3 parts allocating remainder penny to first item", () => {
    expect(distribute(10000, [1, 1, 1])).toEqual([3334, 3333, 3333]);
  });

  it("weights 1:2", () => {
    expect(distribute(10000, [1, 2])).toEqual([3333, 6667]);
  });

  it("handles percentage-based weight distribution", () => {
    expect(distribute(99999, [5000, 3000, 2000])).toEqual([49999, 30000, 20000]);
  });

  it("handles single recipient distribution", () => {
    expect(distribute(12345, [1])).toEqual([12345]);
  });

  it("ensures distributed sum always strictly matches total across random inputs", () => {
    const rng = makeRng(7);
    for (let i = 0; i < 300; i++) {
      const total = 1 + Math.floor(rng() * 100_000_000);
      const count = 1 + Math.floor(rng() * 20);
      const weights = Array.from({ length: count }, () => 1 + Math.floor(rng() * 10_000));
      const result = distribute(total, weights);
      expect(sum(result)).toBe(total);
      result.forEach((value) => expect(value).toBeGreaterThanOrEqual(0));
    }
  });
});

describe("equalAmounts / equalPercentages", () => {
  it("prefill strings", () => {
    expect(equalAmounts(10000, 3)).toEqual(["33.34", "33.33", "33.33"]);
    expect(equalAmounts(10000, 4)).toEqual(["25", "25", "25", "25"]);
    expect(equalPercentages(3)).toEqual(["33.34", "33.33", "33.33"]);
    expect(equalPercentages(4)).toEqual(["25", "25", "25", "25"]);
  });
});

describe("computeSplits", () => {
  it("EQUAL", () => {
    const result = computeSplits({ type: "EQUAL", total: 10000, rows: [row("a"), row("b"), row("c")] });
    expect(result.items.map((i) => i.owed)).toEqual([3334, 3333, 3333]);
    expect(result.error).toBeNull();
  });

  it("EQUAL: excludes unselected participants", () => {
    const result = computeSplits({
      type: "EQUAL",
      total: 10000,
      rows: [row("a"), row("b"), row("c", { included: false })],
    });
    expect(result.items).toEqual([
      { member: "a", owed: 5000 },
      { member: "b", owed: 5000 },
    ]);
  });

  it("EQUAL: errors when no participants are selected", () => {
    const result = computeSplits({ type: "EQUAL", total: 10000, rows: [row("a", { included: false })] });
    expect(result.items).toEqual([]);
    expect(result.error).toBe("Select at least one person to split with.");
  });

  it("EQUAL: returns null when amount is not yet entered (NaN)", () => {
    const result = computeSplits({ type: "EQUAL", total: toPaise(NaN), rows: [row("a")] });
    expect(result.items).toBeNull();
    expect(result.error).toBeNull();
  });

  it("EXACT: succeeds when item amounts match total", () => {
    const result = computeSplits({
      type: "EXACT",
      total: 300000,
      rows: [row("a", { amount: "1500" }), row("b", { amount: "900" }), row("c", { amount: "600" })],
    });
    expect(result.items.map((i) => i.owed)).toEqual([150000, 90000, 60000]);
    expect(result.error).toBeNull();
    expect(result.remaining).toBe(0);
  });

  it("EXACT: displays error and remaining balance on mismatched sum", () => {
    const result = computeSplits({
      type: "EXACT",
      total: 300000,
      rows: [row("a", { amount: "1500" }), row("b", { amount: "900" }), row("c", { amount: "500" })],
    });
    expect(result.items).toBeNull();
    expect(result.error).toMatch(/2,900/);
    expect(result.error).toMatch(/3,000/);
    expect(result.remaining).toBe(10000);
  });

  it("EXACT: errors when any participant amount is blank", () => {
    const result = computeSplits({
      type: "EXACT",
      total: 300000,
      rows: [row("a", { amount: "1500" }), row("b", { amount: "" })],
    });
    expect(result.error).toMatch(/Enter an amount/);
  });

  it("PERCENTAGE 50/30/20 on Rs 999.99", () => {
    const result = computeSplits({
      type: "PERCENTAGE",
      total: 99999,
      rows: [row("a", { percentage: "50" }), row("b", { percentage: "30" }), row("c", { percentage: "20" })],
    });
    expect(result.items.map((i) => i.owed)).toEqual([49999, 30000, 20000]);
    expect(result.items[0].percentage).toBe(50);
    expect(result.remaining).toBe(0);
  });

  it("PERCENTAGE 33.33 + 33.33 + 33.34: sum total ke barabar", () => {
    const result = computeSplits({
      type: "PERCENTAGE",
      total: 10000,
      rows: [row("a", { percentage: "33.33" }), row("b", { percentage: "33.33" }), row("c", { percentage: "33.34" })],
    });
    expect(sum(result.items.map((i) => i.owed))).toBe(10000);
    expect(result.error).toBeNull();
  });

  it("PERCENTAGE 100 nahi hai", () => {
    const result = computeSplits({
      type: "PERCENTAGE",
      total: 10000,
      rows: [row("a", { percentage: "50" }), row("b", { percentage: "30" }), row("c", { percentage: "10" })],
    });
    expect(result.error).toBe("Percentages add up to 90% but must total 100%.");
    expect(result.remaining).toBe(1000);
  });

  it("PERCENTAGE: khali value", () => {
    const result = computeSplits({
      type: "PERCENTAGE",
      total: 10000,
      rows: [row("a", { percentage: "50" }), row("b", { percentage: "" })],
    });
    expect(result.error).toMatch(/Enter a percentage/);
  });

  it("SHARES 1:2", () => {
    const result = computeSplits({
      type: "SHARES",
      total: 10000,
      rows: [row("a", { shares: "1" }), row("b", { shares: "2" })],
    });
    expect(result.items.map((i) => i.owed)).toEqual([3333, 6667]);
    expect(result.items.map((i) => i.shares)).toEqual([1, 2]);
  });

  it("SHARES: 0 allowed nahi", () => {
    const result = computeSplits({ type: "SHARES", total: 10000, rows: [row("a", { shares: "0" })] });
    expect(result.error).toBe("Shares must be whole numbers from 1 to 1000.");
  });
});

describe("computePaidBy", () => {
  const participants = [{ _id: "a" }, { _id: "b" }];

  it("ek payer", () => {
    const result = computePaidBy({ mode: "single", single: "a", amounts: {}, participants, total: 10000 });
    expect(result.items).toEqual([{ member: "a", amount: 10000 }]);
    expect(result.error).toBeNull();
  });

  it("payer chuna nahi", () => {
    const result = computePaidBy({ mode: "single", single: "", amounts: {}, participants, total: 10000 });
    expect(result.error).toBe("Choose who paid.");
  });

  it("multiple payers, sahi sum", () => {
    const result = computePaidBy({
      mode: "multi",
      single: "a",
      amounts: { a: "600", b: "400" },
      participants,
      total: 100000,
    });
    expect(result.items).toEqual([
      { member: "a", amount: 60000 },
      { member: "b", amount: 40000 },
    ]);
    expect(result.remaining).toBe(0);
  });

  it("multiple payers, galat sum", () => {
    const result = computePaidBy({
      mode: "multi",
      single: "a",
      amounts: { a: "600", b: "300" },
      participants,
      total: 100000,
    });
    expect(result.items).toBeNull();
    expect(result.remaining).toBe(10000);
    expect(result.error).toMatch(/add up to/);
  });

  it("errors when no payments are entered", () => {
    const result = computePaidBy({ mode: "multi", single: "a", amounts: {}, participants, total: 100000 });
    expect(result.error).toBe("Enter how much each person paid.");
  });
});

describe("splitPayload", () => {
  it("generates correct payload fields based on split type", () => {
    expect(splitPayload("EQUAL", [{ member: "a", owed: 100 }])).toEqual([{ member: "a" }]);
    expect(splitPayload("EXACT", [{ member: "a", owed: 150 }])).toEqual([{ member: "a", amount: 1.5 }]);
    expect(splitPayload("PERCENTAGE", [{ member: "a", owed: 100, percentage: 50 }])).toEqual([
      { member: "a", percentage: 50 },
    ]);
    expect(splitPayload("SHARES", [{ member: "a", owed: 100, shares: 2 }])).toEqual([{ member: "a", shares: 2 }]);
  });
});

describe("state preparation for editing", () => {
  it("payer state", () => {
    expect(defaultPayerState("me")).toEqual({ mode: "single", single: "me", amounts: {} });
    expect(payerStateFromExpense({ paidBy: [{ member: "a", amount: 100 }] })).toEqual({
      mode: "single",
      single: "a",
      amounts: {},
    });
    expect(
      payerStateFromExpense({
        paidBy: [
          { member: "a", amount: 600 },
          { member: "b", amount: 400 },
        ],
      })
    ).toEqual({ mode: "multi", single: "a", amounts: { a: "600", b: "400" } });
  });

  it("split state", () => {
    const state = splitStateFromExpense({
      splitType: "PERCENTAGE",
      splits: [{ member: "a", owedAmount: 50, percentage: 50 }],
    });
    expect(state.type).toBe("PERCENTAGE");
    expect(state.included).toEqual({ a: true });
    expect(state.values.a).toEqual({ amount: "50", percentage: "50", shares: "1" });
  });
});

describe("normalizePayload", () => {
  const base = {
    description: "Dinner",
    amount: 100,
    category: "food",
    date: "2026-10-12",
    notes: "",
    paidBy: [
      { member: "b", amount: 40 },
      { member: "a", amount: 60 },
    ],
    splitType: "EQUAL",
    splits: [{ member: "b" }, { member: "a" }],
  };

  it("ignores element order differences", () => {
    const reordered = { ...base, paidBy: [...base.paidBy].reverse(), splits: [...base.splits].reverse() };
    expect(normalizePayload(base)).toBe(normalizePayload(reordered));
  });

  it("detects genuine changes correctly", () => {
    expect(normalizePayload(base)).not.toBe(normalizePayload({ ...base, amount: 101 }));
  });
});

describe("myPosition", () => {
  const expense = {
    paidBy: [{ member: "m1", amount: 3000 }],
    splits: [
      { member: "m1", owedAmount: 1000 },
      { member: "m2", owedAmount: 1000 },
      { member: "m3", owedAmount: 1000 },
    ],
  };

  it("calculates position for payer", () => {
    expect(myPosition(expense, "m1")).toEqual({ paid: 300000, share: 100000, net: 200000, involved: true });
  });

  it("calculates position for debtor", () => {
    expect(myPosition(expense, "m2")).toEqual({ paid: 0, share: 100000, net: -100000, involved: true });
  });

  it("calculates position for uninvolved member", () => {
    expect(myPosition(expense, "m9")).toEqual({ paid: 0, share: 0, net: 0, involved: false });
  });
});
