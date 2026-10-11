import axios from "axios";
import { clearRefreshToken, getRefreshToken, setRefreshToken } from "@/lib/storage";
import { markAlive, markDown, markWaking, SLOW_MS } from "@/lib/serverStatus";
import { SessionExpiredError, toApiError } from "./errors";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
const TIMEOUT = 70_000; // Render free tier ke cold start ke liye lamba
const RETRY_DELAYS = [1500, 2500, 4000, 6000, 8000]; // GET retries (~22s total)
const GATEWAY_ERRORS = [502, 503, 504];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ---------------- Tokens ---------------- */
let accessToken = null; // sirf memory mein

export const setAccessToken = (token) => {
  accessToken = token;
};

let sessionExpiredHandler = () => {};
export const setSessionExpiredHandler = (handler) => {
  sessionExpiredHandler = handler;
};

// Dono tokens hata do
export const clearSession = () => {
  accessToken = null;
  clearRefreshToken();
};

/* ---------------- Axios instances ---------------- */
export const api = axios.create({ baseURL: BASE_URL, timeout: TIMEOUT });

// Bina auth-interceptors wala instance: refresh call ke liye (warna infinite loop ban sakta hai)
const bare = axios.create({ baseURL: BASE_URL, timeout: TIMEOUT });

/* ---------------- "Server jag raha hai" tracking ---------------- */
const onRequest = (config) => {
  clearTimeout(config._slowTimer);
  config._slowTimer = setTimeout(markWaking, SLOW_MS); // 4s tak jawab nahi aaya => banner
  return config;
};

const onResponse = (response) => {
  clearTimeout(response.config._slowTimer);
  markAlive();
  return response;
};

// Gateway errors (502/503/504) ka matlab server abhi uth raha hai, zinda nahi
const trackError = (error) => {
  clearTimeout(error.config?._slowTimer);
  if (error.response && !GATEWAY_ERRORS.includes(error.response.status)) markAlive();
};

bare.interceptors.request.use(onRequest);
bare.interceptors.response.use(onResponse, (error) => {
  trackError(error);
  return Promise.reject(error);
});

/* ---------------- Token refresh (single-flight + tabs ke beech lock) ---------------- */
// Web Locks sirf secure context (https ya localhost) mein hota hai. Na ho to bina lock ke chalao.
const withLock = (task) =>
  typeof navigator !== "undefined" && navigator.locks
    ? navigator.locks.request("splitly-token-refresh", task)
    : task();

async function doRefresh() {
  // Lock ke ANDAR padhna zaroori hai: doosre tab ne abhi rotate kiya ho to latest token milega
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new SessionExpiredError();

  try {
    const { data } = await bare.post("/auth/refresh-token", { refreshToken });
    accessToken = data.data.accessToken;
    setRefreshToken(data.data.refreshToken); // rotation: naya refresh token turant save
    return accessToken;
  } catch (error) {
    const status = error.response?.status;
    if (status === 400 || status === 401) {
      clearSession();
      sessionExpiredHandler();
      throw new SessionExpiredError();
    }
    throw error; // network, 5xx ya 429: session mat todo, baad me dobara try hoga
  }
}

let refreshing = null;
export const refreshSession = () => {
  // Ek tab mein 5 requests ek saath 401 khayein to bhi sirf ek refresh call
  refreshing ??= withLock(doRefresh).finally(() => {
    refreshing = null;
  });
  return refreshing;
};

/* ---------------- Interceptors ---------------- */
api.interceptors.request.use(onRequest);
api.interceptors.request.use((config) => {
  if (accessToken && !config.skipAuthRefresh) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Sirf GET/HEAD ko chupchap retry karte hain (POST duplicate bana sakta hai)
const isRetryable = (error) => {
  const method = error.config?.method?.toLowerCase();
  if (method !== "get" && method !== "head") return false;
  if (!error.response) return error.code === "ERR_NETWORK" && navigator.onLine !== false;
  return GATEWAY_ERRORS.includes(error.response.status);
};

api.interceptors.response.use(onResponse, async (error) => {
  trackError(error);
  if (axios.isCancel(error)) return Promise.reject(error);

  const config = error.config;

  // 1) Cold start ya network hiccup: GET ko backoff ke saath retry
  if (config && isRetryable(error)) {
    config._retryCount = (config._retryCount ?? 0) + 1;
    if (config._retryCount <= RETRY_DELAYS.length) {
      markWaking();
      await sleep(RETRY_DELAYS[config._retryCount - 1]);
      return api(config);
    }
  }

  // 2) Access token expire: refresh karke ek baar retry
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

  // 3) Aakhri failure
  if (!error.response && navigator.onLine !== false) markDown();

  return Promise.reject(toApiError(error));
});

// App khulte hi server ko jagao: user form bharta rahe, server tab tak uth jaye
export const wakeServer = () =>
  api.get("/health", { skipAuthRefresh: true, timeout: 90_000 }).catch(() => {});
