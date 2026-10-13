import { describe, expect, it } from "vitest";
import { fillMonths, MAX_RANGE_MONTHS, monthKeys, monthsSpan, RANGE_PRESETS } from "./range";

describe("monthsSpan", () => {
  it("counts inclusive months in span", () => {
    expect(monthsSpan("2026-05-01", "2026-10-12")).toBe(6);
    expect(monthsSpan("2026-10-01", "2026-10-31")).toBe(1);
    expect(monthsSpan("2025-11-15", "2026-02-03")).toBe(4);
  });
});

describe("monthKeys", () => {
  it("generates month keys within the same year", () => {
    expect(monthKeys("2026-05-01", "2026-10-12")).toEqual([
      "2026-05",
      "2026-06",
      "2026-07",
      "2026-08",
      "2026-09",
      "2026-10",
    ]);
  });

  it("generates month keys crossing year boundaries", () => {
    expect(monthKeys("2025-11-15", "2026-02-03")).toEqual(["2025-11", "2025-12", "2026-01", "2026-02"]);
  });
});

describe("fillMonths", () => {
  it("fills empty months with zero amounts", () => {
    const monthly = [{ month: "2026-10", amount: 3900, count: 2 }];
    expect(fillMonths(monthly, "2026-08-01", "2026-10-12")).toEqual([
      { month: "2026-08", amount: 0, count: 0 },
      { month: "2026-09", amount: 0, count: 0 },
      { month: "2026-10", amount: 3900, count: 2 },
    ]);
  });

  it("preserves out-of-range data points", () => {
    const monthly = [{ month: "2026-07", amount: 5, count: 1 }];
    const filled = fillMonths(monthly, "2026-08-01", "2026-09-30");
    expect(filled.map((row) => row.month)).toEqual(["2026-07", "2026-08", "2026-09"]);
    expect(filled[0].amount).toBe(5);
  });
});

describe("presets", () => {
  it("contains valid default presets and upper range limits", () => {
    expect(RANGE_PRESETS.some((preset) => preset.value === "6")).toBe(true);
    expect(MAX_RANGE_MONTHS).toBe(24);
  });
});
