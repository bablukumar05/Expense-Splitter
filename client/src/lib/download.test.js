import { describe, expect, it } from "vitest";
import { filenameFromDisposition, safeFilename } from "./download";

describe("filenameFromDisposition", () => {
  it("quoted filename", () => {
    expect(filenameFromDisposition('attachment; filename="trip.csv"')).toBe("trip.csv");
  });

  it("RFC 5987 encoded filename", () => {
    expect(filenameFromDisposition("attachment; filename*=UTF-8''Goa%20Trip.csv")).toBe("Goa Trip.csv");
  });

  it("returns null when disposition header is missing", () => {
    expect(filenameFromDisposition(null)).toBeNull();
    expect(filenameFromDisposition(undefined)).toBeNull();
  });
});

describe("safeFilename", () => {
  it("generates fallback name from base and sanitizes illegal characters", () => {
    expect(safeFilename(null, "My Group: expenses", "csv")).toBe("My Group- expenses.csv");
  });

  it("appends extension when omitted", () => {
    expect(safeFilename("report", "x", "pdf")).toBe("report.pdf");
  });

  it("does not duplicate existing extension (case-insensitive)", () => {
    expect(safeFilename("REPORT.PDF", "x", "pdf")).toBe("REPORT.PDF");
  });

  it("replaces path separators with dashes", () => {
    expect(safeFilename("a/b.pdf", "x", "pdf")).toBe("a-b.pdf");
  });
});
