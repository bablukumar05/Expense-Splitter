import { describe, expect, it } from "vitest";
import { describeSchedule, initialEnd, recurringStatus, splitStateFromTemplate, STATUS_UI } from "./utils";

describe("describeSchedule", () => {
  it("monthly ordinals", () => {
    const text = (day) => describeSchedule("monthly", `2026-11-${String(day).padStart(2, "0")}T00:00:00.000Z`);
    expect(text(1)).toBe("Monthly on the 1st");
    expect(text(2)).toBe("Monthly on the 2nd");
    expect(text(3)).toBe("Monthly on the 3rd");
    expect(text(11)).toBe("Monthly on the 11th");
    expect(text(12)).toBe("Monthly on the 12th");
    expect(text(21)).toBe("Monthly on the 21st");
    expect(text(22)).toBe("Monthly on the 22nd");
  });

  it("28 ke baad ki dates par month-end ka note", () => {
    expect(describeSchedule("monthly", "2026-10-31T00:00:00.000Z")).toBe(
      "Monthly on the 31st (last day in shorter months)"
    );
    expect(describeSchedule("monthly", "2026-10-29T00:00:00.000Z")).toBe(
      "Monthly on the 29th (last day in shorter months)"
    );
  });

  it("weekly: formats UTC weekday correctly", () => {
    expect(describeSchedule("weekly", "2026-11-02T00:00:00.000Z")).toBe("Every Monday");
  });

  it("handles missing or invalid dates gracefully", () => {
    expect(describeSchedule("monthly", null)).toBe("Every month");
    expect(describeSchedule("weekly", undefined)).toBe("Every week");
    expect(describeSchedule("monthly", "garbage")).toBe("Every month");
  });
});

describe("recurringStatus", () => {
  it("identifies all four recurring states correctly", () => {
    expect(recurringStatus({ isActive: true, failureCount: 0, lastError: "" })).toBe("active");
    expect(recurringStatus({ isActive: true, failureCount: 1, lastError: "" })).toBe("attention");
    expect(recurringStatus({ isActive: true, failureCount: 0, lastError: "member left" })).toBe("attention");
    expect(recurringStatus({ isActive: false, nextRunAt: "2026-11-01T00:00:00.000Z" })).toBe("paused");
    expect(recurringStatus({ isActive: false, nextRunAt: null })).toBe("ended");
  });

  it("ensures UI mapping exists for each status", () => {
    for (const key of ["active", "attention", "paused", "ended"]) {
      expect(STATUS_UI[key].label).toBeTruthy();
    }
  });
});

describe("initialEnd", () => {
  it("end date, count, ya kuch nahi", () => {
    expect(initialEnd({ endDate: "2026-12-31T00:00:00.000Z" })).toEqual({
      mode: "date",
      date: "2026-12-31",
      count: "",
    });
    expect(initialEnd({ maxOccurrences: 12 })).toEqual({ mode: "count", date: "", count: "12" });
    expect(initialEnd({})).toEqual({ mode: "never", date: "", count: "" });
    expect(initialEnd(undefined)).toEqual({ mode: "never", date: "", count: "" });
  });
});

describe("splitStateFromTemplate", () => {
  it("amount, percentage aur shares ki strings", () => {
    const state = splitStateFromTemplate({
      splitType: "EXACT",
      splits: [
        { member: "m1", amount: 1500 },
        { member: "m2", amount: 1500.5 },
      ],
    });
    expect(state.type).toBe("EXACT");
    expect(state.included).toEqual({ m1: true, m2: true });
    expect(state.values.m1).toEqual({ amount: "1500", percentage: "", shares: "1" });
    expect(state.values.m2.amount).toBe("1500.5");
  });
});
