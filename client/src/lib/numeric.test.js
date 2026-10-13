import { describe, expect, it } from "vitest";
import { sanitizeDecimal, sanitizeInteger } from "./numeric";

describe("sanitizeDecimal", () => {
  it("sirf digits aur ek dot rakhta hai", () => {
    expect(sanitizeDecimal("12..5abc")).toBe("12.5");
  });

  it("2 decimals se zyada kaat deta hai", () => {
    expect(sanitizeDecimal("1.234")).toBe("1.23");
  });

  it("leading zeros hatata hai", () => {
    expect(sanitizeDecimal("007")).toBe("7");
  });

  it("sirf dot ho to 0 lagata hai", () => {
    expect(sanitizeDecimal(".5")).toBe("0.5");
  });

  it("khali input khali hi rehta hai", () => {
    expect(sanitizeDecimal("")).toBe("");
    expect(sanitizeDecimal("abc")).toBe("");
  });

  it("whole part ki limit lagata hai", () => {
    expect(sanitizeDecimal("123456789")).toBe("12345678");
  });

  it("custom limits (percentage ke liye)", () => {
    expect(sanitizeDecimal("1234.567", { maxWhole: 3, maxFraction: 2 })).toBe("123.56");
  });
});

describe("sanitizeInteger", () => {
  it("sirf digits, max length tak", () => {
    expect(sanitizeInteger("a1b2c3", 2)).toBe("12");
  });

  it("leading zeros hatata hai", () => {
    expect(sanitizeInteger("007")).toBe("7");
  });

  it("khali ko khali rakhta hai", () => {
    expect(sanitizeInteger("")).toBe("");
  });
});
