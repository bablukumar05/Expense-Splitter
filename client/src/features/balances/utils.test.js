import { describe, expect, it } from "vitest";
import {
  buildUpiLink,
  canRecordPayment,
  isValidUpiId,
  methodLabel,
  pairMax,
  settleOptions,
  withSelected,
} from "./utils";

const rows = [
  { member: "a", name: "Bablu", balance: 1700, isActive: true },
  { member: "b", name: "Priya", balance: -400, isActive: true },
  { member: "c", name: "Rahul", balance: -1300, isActive: true },
  { member: "d", name: "Left", balance: 0, isActive: false },
];

const ids = (list) => list.map((row) => row.member);

describe("pairMax (settlement limit calculation)", () => {
  it("calculates min(debtor balance, creditor balance) in paise", () => {
    expect(pairMax(rows[1], rows[0])).toBe(40000);
    expect(pairMax(rows[2], rows[0])).toBe(130000);
  });

  it("prevents creditor from being the debtor", () => {
    expect(pairMax(rows[0], rows[1])).toBe(0);
  });

  it("prevents debtor from being the creditor", () => {
    expect(pairMax(rows[1], rows[2])).toBe(0);
  });

  it("returns 0 if either row is missing", () => {
    expect(pairMax(null, rows[0])).toBe(0);
    expect(pairMax(rows[1], undefined)).toBe(0);
  });
});

describe("settleOptions", () => {
  it("allows admin to select any debtor and creditor", () => {
    const options = settleOptions(rows, "a", true);
    expect(ids(options.froms)).toEqual(["b", "c"]);
    expect(ids(options.tos)).toEqual(["a"]);
  });

  it("restricts non-admin debtor to settle with creditors", () => {
    const options = settleOptions(rows, "b", false);
    expect(ids(options.froms)).toEqual(["b"]);
    expect(ids(options.tos)).toEqual(["a"]);
  });

  it("restricts non-admin creditor to receive from debtors", () => {
    const options = settleOptions(rows, "a", false);
    expect(ids(options.froms)).toEqual(["b", "c"]);
    expect(ids(options.tos)).toEqual(["a"]);
  });

  it("returns empty options for members with zero balance or inactive status", () => {
    const withZero = [...rows, { member: "e", name: "Even", balance: 0, isActive: true }];
    expect(settleOptions(withZero, "e", false)).toEqual({ froms: [], tos: [] });
    expect(settleOptions(rows, "d", false)).toEqual({ froms: [], tos: [] });
    expect(settleOptions(rows, "unknown", false)).toEqual({ froms: [], tos: [] });
  });

  it("canRecordPayment", () => {
    expect(canRecordPayment({ froms: [1], tos: [1] })).toBe(true);
    expect(canRecordPayment({ froms: [], tos: [1] })).toBe(false);
  });
});

describe("withSelected", () => {
  it("appends selected member if not present in initial list", () => {
    const list = [rows[1]];
    expect(withSelected(list, rows, "b")).toBe(list);
    expect(withSelected(list, rows, "a")).toEqual([rows[1], rows[0]]);
    expect(withSelected(list, rows, "zzz")).toBe(list);
    expect(withSelected(list, rows, "")).toBe(list);
  });
});

describe("UPI", () => {
  it("validates UPI ID format correctly", () => {
    expect(isValidUpiId("rahul@oksbi")).toBe(true);
    expect(isValidUpiId("my.name-1@okhdfcbank")).toBe(true);
    expect(isValidUpiId("abc")).toBe(false);
    expect(isValidUpiId("a@bank")).toBe(false);
    expect(isValidUpiId("ab@c")).toBe(false);
  });

  it("deep link", () => {
    expect(
      buildUpiLink({ upiId: "rahul@oksbi", name: "Rahul Sharma", amount: 400, note: "Splitly - Goa" })
    ).toBe("upi://pay?pa=rahul@oksbi&pn=Rahul%20Sharma&am=400.00&cu=INR&tn=Splitly%20-%20Goa");
  });

  it("note ke bina tn nahi", () => {
    expect(buildUpiLink({ upiId: "a1@bank", name: "A", amount: 10.5 })).toBe(
      "upi://pay?pa=a1@bank&pn=A&am=10.50&cu=INR"
    );
  });
});

describe("methodLabel", () => {
  it("labels", () => {
    expect(methodLabel("upi")).toBe("UPI");
    expect(methodLabel("cash")).toBe("Cash");
    expect(methodLabel("whatever")).toBe("Other");
  });
});
