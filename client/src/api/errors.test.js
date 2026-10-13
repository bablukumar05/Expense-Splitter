import { describe, expect, it, vi } from "vitest";
import { ApiError, applyFieldErrors, getErrorMessage, SessionExpiredError, toApiError } from "./errors";

describe("toApiError", () => {
  it("parses backend error shape", () => {
    const error = toApiError({
      response: {
        status: 400,
        data: {
          message: "Validation failed",
          errors: [
            { field: "email", message: "Invalid email" },
            { field: "email", message: "Duplicate message" },
            { field: "name", message: "Too short" },
          ],
        },
      },
    });
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(400);
    expect(error.message).toBe("Validation failed");
    expect(error.fieldErrors).toEqual({ email: "Invalid email", name: "Too short" });
  });

  it("falls back to generic message when none provided", () => {
    const error = toApiError({ response: { status: 500, data: {} } });
    expect(error.message).toBe("Something went wrong. Please try again.");
  });

  it("handles request timeout", () => {
    const error = toApiError({ code: "ECONNABORTED" });
    expect(error.isTimeout).toBe(true);
    expect(error.status).toBe(0);
    expect(error.message).toMatch(/too long/);
  });

  it("handles network error without response", () => {
    const error = toApiError({});
    expect(error.isNetworkError).toBe(true);
    expect(error.status).toBe(0);
  });

  it("returns existing ApiError instance directly", () => {
    const original = new ApiError({ message: "x", status: 404 });
    expect(toApiError(original)).toBe(original);
  });
});

describe("getErrorMessage", () => {
  it("extracts message from ApiError", () => {
    expect(getErrorMessage(new ApiError({ message: "Bad request", status: 400 }))).toBe("Bad request");
  });

  it("falls back to default message on standard errors", () => {
    expect(getErrorMessage(new Error("internal"))).toBe("Something went wrong. Please try again.");
    expect(getErrorMessage(new Error("internal"), "Custom")).toBe("Custom");
  });
});

describe("applyFieldErrors", () => {
  it("applies error only to specified target fields", () => {
    const setError = vi.fn();
    const error = new ApiError({
      message: "Validation failed",
      status: 400,
      fieldErrors: { email: "Invalid", other: "ignored" },
    });
    expect(applyFieldErrors(error, setError, ["email"])).toBe(true);
    expect(setError).toHaveBeenCalledTimes(1);
    expect(setError).toHaveBeenCalledWith("email", { type: "server", message: "Invalid" });
  });

  it("returns false if no fields match or not an ApiError", () => {
    const setError = vi.fn();
    expect(applyFieldErrors(new Error("x"), setError, ["email"])).toBe(false);
    expect(
      applyFieldErrors(new ApiError({ message: "m", fieldErrors: { other: "x" } }), setError, ["email"])
    ).toBe(false);
    expect(setError).not.toHaveBeenCalled();
  });
});

describe("SessionExpiredError", () => {
  it("sets expected error name and message", () => {
    const error = new SessionExpiredError();
    expect(error.name).toBe("SessionExpiredError");
    expect(error.message).toBe("Session expired");
  });
});
