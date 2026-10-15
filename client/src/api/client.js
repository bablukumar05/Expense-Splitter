import axios from "axios";
import { clearRefreshToken, getRefreshToken, setRefreshToken } from "@/lib/storage";
import { markAlive, markDown, markWaking, SLOW_MS } from "@/lib/serverStatus";
import { SessionExpiredError, toApiError } from "./errors";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
const TIMEOUT = 70_000;
const RETRY_DELAYS = [1500, 2500, 4000, 6000, 8000];
const GATEWAY_ERRORS = [502, 503, 504];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function parseBlobError(error) {
  const data = error?.response?.data;
  if (typeof Blob !== "undefined" && data instanceof Blob && data.type.includes("json")) {
    try {
      error.response.data = JSON.parse(await data.text());
    } catch {
    }
  }
}

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

let sessionExpiredHandler = () => {};
export const setSessionExpiredHandler = (handler) => {
  sessionExpiredHandler = handler;
};

export const clearSession = () => {
  accessToken = null;
  clearRefreshToken();
};

export const api = axios.create({ baseURL: BASE_URL, timeout: TIMEOUT });

const bare = axios.create({ baseURL: BASE_URL, timeout: TIMEOUT });

const onRequest = (config) => {
  clearTimeout(config._slowTimer);
  config._slowTimer = setTimeout(markWaking, SLOW_MS);
  return config;
};

const onResponse = (response) => {
  clearTimeout(response.config._slowTimer);
  markAlive();
  return response;
};

const trackError = (error) => {
  clearTimeout(error.config?._slowTimer);
  if (error.response && !GATEWAY_ERRORS.includes(error.response.status)) markAlive();
};

bare.interceptors.request.use(onRequest);
bare.interceptors.response.use(onResponse, (error) => {
  trackError(error);
  return Promise.reject(error);
});

const withLock = (task) =>
  typeof navigator !== "undefined" && navigator.locks
    ? navigator.locks.request("splitmate-token-refresh", task)
    : task();

async function doRefresh() {

  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new SessionExpiredError();

  try {
    const { data } = await bare.post("/auth/refresh-token", { refreshToken });
    accessToken = data.data.accessToken;
    setRefreshToken(data.data.refreshToken);
    return accessToken;
  } catch (error) {
    const status = error.response?.status;
    if (status === 400 || status === 401) {
      clearSession();
      sessionExpiredHandler();
      throw new SessionExpiredError();
    }
    throw error;
  }
}

let refreshing = null;
export const refreshSession = () => {

  refreshing ??= withLock(doRefresh).finally(() => {
    refreshing = null;
  });
  return refreshing;
};

api.interceptors.request.use(onRequest);
api.interceptors.request.use((config) => {
  if (accessToken && !config.skipAuthRefresh) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

const isRetryable = (error) => {
  const method = error.config?.method?.toLowerCase();
  if (method !== "get" && method !== "head") return false;
  if (!error.response) return error.code === "ERR_NETWORK" && navigator.onLine !== false;
  return GATEWAY_ERRORS.includes(error.response.status);
};

api.interceptors.response.use(onResponse, async (error) => {
  trackError(error);
  await parseBlobError(error);
  if (axios.isCancel(error)) return Promise.reject(error);

  const config = error.config;

  if (config && isRetryable(error)) {
    config._retryCount = (config._retryCount ?? 0) + 1;
    if (config._retryCount <= RETRY_DELAYS.length) {
      markWaking();
      await sleep(RETRY_DELAYS[config._retryCount - 1]);
      return api(config);
    }
  }

  if (error.response?.status === 401 && config && !config.skipAuthRefresh && !config._retried) {
    config._retried = true;
    try {
      const token = await refreshSession();
      config.headers.Authorization = `Bearer ${token}`;
      return api(config);
    } catch (refreshError) {
      return Promise.reject(
        toApiError(refreshError instanceof SessionExpiredError ? error : refreshError)
      );
    }
  }

  if (!error.response && navigator.onLine !== false) markDown();

  return Promise.reject(toApiError(error));
});

export const wakeServer = () =>
  api.get("/health", { skipAuthRefresh: true, timeout: 90_000 }).catch(() => {});
