import { describe, expect, it } from "vitest";
import { formatBytes, receiptThumb } from "./image";

describe("receiptThumb", () => {
  it("appends resize transformation to Cloudinary URL", () => {
    expect(receiptThumb("https://res.cloudinary.com/demo/image/upload/v1/a.jpg")).toBe(
      "https://res.cloudinary.com/demo/image/upload/w_900,c_limit,q_auto,f_auto/v1/a.jpg"
    );
  });

  it("leaves non-Cloudinary URLs unchanged", () => {
    expect(receiptThumb("https://example.com/a.jpg")).toBe("https://example.com/a.jpg");
  });
});

describe("formatBytes", () => {
  it("formats bytes into KB and MB correctly", () => {
    expect(formatBytes(500)).toBe("1 KB");
    expect(formatBytes(2048)).toBe("2 KB");
    expect(formatBytes(1024 * 1024)).toBe("1.0 MB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5.0 MB");
  });
});
