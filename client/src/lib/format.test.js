import { describe, expect, it } from "vitest";
import {
  compactMoney,
  currencySymbol,
  dateInputValue,
  dayHeading,
  formatDay,
  formatMoney,
  formatMonth,
  initials,
  localDayKey,
  monthLabel,
  parseMoney,
  timeAgo,
  timeUntil,
  todayInputValue,
} from "./format";

describe("formatMoney", () => {
  it("poore rupees bina decimals ke", () => {
    expect(formatMoney(1300)).toMatch(/^₹\s?1,300$/);
  });

  it("decimals ho to 2 digits", () => {
    expect(formatMoney(1300.5)).toMatch(/^₹\s?1,300\.50$/);
  });

  it("Indian grouping", () => {
    expect(formatMoney(10000000)).toContain("1,00,00,000");
  });

  it("galat currency code par crash nahi hota", () => {
    expect(formatMoney(10, "XX")).toBe("XX 10.00");
  });
});

describe("compactMoney", () => {
  it("chart axis ke liye chhota form", () => {
    expect(compactMoney(12500)).toMatch(/12\.5K/);
  });
});

describe("parseMoney", () => {
  it("number deta hai", () => {
    expect(parseMoney("1300.5")).toBe(1300.5);
    expect(parseMoney("100")).toBe(100);
  });

  it("khali ya galat par NaN", () => {
    expect(parseMoney("")).toBeNaN();
    expect(parseMoney("abc")).toBeNaN();
  });
});

describe("currencySymbol", () => {
  it("common currencies", () => {
    expect(currencySymbol("INR")).toBe("₹");
    expect(currencySymbol("USD")).toBe("$");
  });

  it("galat code par code hi wapas", () => {
    expect(currencySymbol("XXXX")).toBe("XXXX");
  });
});

describe("dates", () => {
  it("dateInputValue server ki UTC date se YYYY-MM-DD", () => {
    expect(dateInputValue("2026-10-12T00:00:00.000Z")).toBe("2026-10-12");
  });

  it("todayInputValue ka format", () => {
    expect(todayInputValue()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("formatDay UTC date dikhata hai", () => {
    expect(formatDay("2026-10-12T00:00:00.000Z")).toMatch(/12\s+Oct,?\s+2026/);
  });

  it("formatMonth", () => {
    expect(formatMonth("2026-10-15T00:00:00.000Z")).toMatch(/October 2026/);
  });

  it("monthLabel short aur long", () => {
    expect(monthLabel("2026-10")).toMatch(/Oct/);
    expect(monthLabel("2026-10")).toMatch(/26/);
    expect(monthLabel("2026-10", { month: "long", year: "numeric" })).toMatch(/October 2026/);
    expect(monthLabel("bad")).toBe("bad");
  });

  it("localDayKey", () => {
    expect(localDayKey(new Date(2026, 9, 12, 15, 30))).toBe("2026-9-12");
  });

  it("dayHeading: Today aur Yesterday", () => {
    expect(dayHeading(new Date())).toBe("Today");
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(dayHeading(yesterday)).toBe("Yesterday");
  });
});

describe("relative time", () => {
  it("timeAgo", () => {
    expect(timeAgo(new Date(Date.now() - 30_000))).toBe("just now");
    expect(timeAgo(new Date(Date.now() - 5 * 60_000))).toMatch(/5 minutes ago/);
  });

  it("timeUntil", () => {
    expect(timeUntil(new Date(Date.now() + 3 * 86_400_000))).toBe("in 3 days");
    expect(timeUntil(new Date(Date.now() - 1000))).toBe("expired");
  });
});

describe("initials", () => {
  it("naam se initials", () => {
    expect(initials("Bablu Kumar")).toBe("BK");
    expect(initials("rahul")).toBe("R");
    expect(initials("a b c")).toBe("AB");
    expect(initials("")).toBe("?");
  });
});
