export class ApiError extends Error {
  constructor({ message, status = 0, fieldErrors = {}, isNetworkError = false, isTimeout = false }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.isNetworkError = isNetworkError;
    this.isTimeout = isTimeout;
  }
}

export class SessionExpiredError extends Error {
  constructor() {
    super("Session expired");
    this.name = "SessionExpiredError";
  }
}

export function toApiError(error) {
  if (error instanceof ApiError) return error;

  const response = error?.response;
  if (!response) {
    const isTimeout = error?.code === "ECONNABORTED";
    const offline = typeof navigator !== "undefined" && navigator.onLine === false;
    return new ApiError({
      message: offline
        ? "You're offline. Check your internet connection."
        : isTimeout
          ? "The server took too long to respond. Please try again."
          : "Can't reach the server. Please try again in a moment.",
      status: 0,
      isNetworkError: !isTimeout,
      isTimeout,
    });
  }

  const body = response.data;
  const fieldErrors = {};
  if (Array.isArray(body?.errors)) {
    for (const item of body.errors) {
      if (item?.field && !fieldErrors[item.field]) fieldErrors[item.field] = item.message;
    }
  }

  return new ApiError({
    message: body?.message || "Something went wrong. Please try again.",
    status: response.status,
    fieldErrors,
  });
}

export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") =>
  error instanceof ApiError ? error.message : fallback;

export function applyFieldErrors(error, setError, fields) {
  if (!(error instanceof ApiError)) return false;
  let applied = false;
  for (const [field, message] of Object.entries(error.fieldErrors)) {
    if (fields.includes(field)) {
      setError(field, { type: "server", message });
      applied = true;
    }
  }
  return applied;
}
