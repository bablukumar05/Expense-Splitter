import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { authApi } from "@/api/auth";
import {
  clearSession,
  refreshSession,
  setAccessToken,
  setSessionExpiredHandler,
} from "@/api/client";
import { ApiError, SessionExpiredError } from "@/api/errors";
import { queryClient } from "@/lib/queryClient";
import { getRefreshToken, setRefreshToken } from "@/lib/storage";
import { AuthContext } from "./auth-context";

export default function AuthProvider({ children }) {

  const [state, setState] = useState(() => ({
    status: getRefreshToken() ? "loading" : "unauthenticated",
    user: null,
  }));

  const endSession = useCallback(() => {
    clearSession();
    queryClient.clear();
    setState({ status: "unauthenticated", user: null });
  }, []);

  const normalizeUser = (u) => (u ? { ...u, _id: u._id || u.id, id: u.id || u._id } : null);

  const bootstrap = useCallback(async () => {
    if (!getRefreshToken()) {
      setState({ status: "unauthenticated", user: null });
      return;
    }
    try {
      await refreshSession();
      const { user } = await authApi.me();
      setState({ status: "authenticated", user: normalizeUser(user) });
    } catch (error) {
      if (error instanceof SessionExpiredError || (error instanceof ApiError && error.status === 401)) {
        endSession();
      } else {

        setState({ status: "error", user: null });
      }
    }
  }, [endSession]);

  useEffect(() => {

    setSessionExpiredHandler(() => {
      queryClient.clear();
      setState({ status: "unauthenticated", user: null });
      toast.info("Your session expired. Please log in again.");
    });
    bootstrap();
    return () => setSessionExpiredHandler(() => {});
  }, [bootstrap]);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== null && event.key !== "splitly.refreshToken") return;
      if (getRefreshToken()) return;
      setAccessToken(null);
      queryClient.clear();
      setState({ status: "unauthenticated", user: null });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const startSession = useCallback(({ user, accessToken, refreshToken }) => {
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    queryClient.clear();
    const cleanUser = normalizeUser(user);
    setState({ status: "authenticated", user: cleanUser });
    return cleanUser;
  }, []);

  const login = useCallback(async (credentials) => startSession(await authApi.login(credentials)), [startSession]);
  const signup = useCallback(async (details) => startSession(await authApi.register(details)), [startSession]);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    endSession();
    if (refreshToken) authApi.logout(refreshToken).catch(() => {});
  }, [endSession]);

  const retry = useCallback(() => {
    setState({ status: "loading", user: null });
    return bootstrap();
  }, [bootstrap]);

  const updateUser = useCallback((user) => setState((prev) => ({ ...prev, user: normalizeUser(user) })), []);

  const value = useMemo(
    () => ({ status: state.status, user: state.user, login, signup, logout, retry, updateUser }),
    [state, login, signup, logout, retry, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
