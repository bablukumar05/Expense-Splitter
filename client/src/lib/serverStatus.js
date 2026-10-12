
export const SLOW_MS = 4000;

const listeners = new Set();
let state = { status: "ok", since: null };
let recoverTimer;

const set = (next) => {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
};

export const getServerState = () => state;

export const subscribeServerState = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const markWaking = () => {
  if (state.status === "waking") return;
  clearTimeout(recoverTimer);
  set({ status: "waking", since: Date.now() });
};

export const markDown = () => {
  clearTimeout(recoverTimer);
  set({ status: "down", since: null });
};

export const markAlive = () => {
  if (state.status !== "waking" && state.status !== "down") return;
  set({ status: "recovered" });
  clearTimeout(recoverTimer);
  recoverTimer = setTimeout(() => set({ status: "ok", since: null }), 2500);
};
