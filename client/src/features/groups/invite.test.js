import { describe, expect, it } from "vitest";
import { getInviteStatus, inviteMessage, parseInviteCode } from "./invite";

const inFuture = () => new Date(Date.now() + 86_400_000).toISOString();
const inPast = () => new Date(Date.now() - 1000).toISOString();

describe("getInviteStatus", () => {
  it("active", () => {
    expect(getInviteStatus({ isActive: true, expiresAt: null, maxUses: null, usedCount: 3 })).toBe("active");
    expect(getInviteStatus({ isActive: true, expiresAt: inFuture(), maxUses: 5, usedCount: 4 })).toBe("active");
  });

  it("prioritizes disabled status over expiry and use limit", () => {
    expect(getInviteStatus({ isActive: false, expiresAt: inPast(), maxUses: 1, usedCount: 1 })).toBe("disabled");
  });

  it("expired", () => {
    expect(getInviteStatus({ isActive: true, expiresAt: inPast(), maxUses: null, usedCount: 0 })).toBe("expired");
  });

  it("limit reached", () => {
    expect(getInviteStatus({ isActive: true, expiresAt: null, maxUses: 5, usedCount: 5 })).toBe("full");
  });
});

describe("parseInviteCode", () => {
  it("extracts code from full invitation link", () => {
    expect(parseInviteCode("https://splitly.app/join/abcDEF_123-xyz")).toBe("abcDEF_123-xyz");
    expect(parseInviteCode(" https://splitly.app/join/abc123XYZ789?ref=wa ")).toBe("abc123XYZ789");
  });

  it("accepts direct raw invite code", () => {
    expect(parseInviteCode("abcdefghij")).toBe("abcdefghij");
  });

  it("returns null for invalid inputs", () => {
    expect(parseInviteCode("")).toBeNull();
    expect(parseInviteCode(" ")).toBeNull();
    expect(parseInviteCode("short")).toBeNull();
    expect(parseInviteCode("hello world!")).toBeNull();
    expect(parseInviteCode("https://example.com/other")).toBeNull();
    expect(parseInviteCode("javascript:alert(1)")).toBeNull();
  });
});

describe("inviteMessage", () => {
  it("group ka naam aur app ka naam", () => {
    expect(inviteMessage("Goa Trip")).toBe('Join "Goa Trip" on Splitly to split expenses together.');
  });
});
