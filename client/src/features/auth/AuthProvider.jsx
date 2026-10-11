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
  // Refresh token hi nahi hai to loader dikhane ki zaroorat nahi (flash se bachav)
  const [state, setState] = useState(() => ({
    status: getRefreshToken() ? "loading" : "unauthenticated",
    user: null,
  }));

  const endSession = useCallback(() => {
    clearSession();
    queryClient.clear(); // purane user ka cache na bache
    setState({ status: "unauthenticated", user: null });
  }, []);

  // Page khulte hi: refresh token se naya access token, phir user ki details
  const bootstrap = useCallback(async () => {
    if (!getRefreshToken()) {
      setState({ status: "unauthenticated", user: null });
      return;
    }
    try {
      await refreshSession();
      const { user } = await authApi.me();
      setState({ status: "authenticated", user });
    } catch (error) {
      if (error instanceof SessionExpiredError || (error instanceof ApiError && error.status === 401)) {
        endSession();
      } else {
        // Server down ya network issue: logout mat karo, retry ka mauka do
        setState({ status: "error", user: null });
      }
    }
  }, [endSession]);

  useEffect(() => {
    // Refresh fail hone par api/client.js isse bulata hai
    setSessionExpiredHandler(() => {
      queryClient.clear();
      setState({ status: "unauthenticated", user: null });
      toast.info("Your session expired. Please log in again.");
    });
    bootstrap(); // StrictMode mein 2 baar chalta hai, par refreshSession single-flight hai
    return () => setSessionExpiredHandler(() => {});
  }, [bootstrap]);

  // Doosre tab mein logout hua (refresh token hata) to yahan bhi logout
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
    setState({ status: "authenticated", user });
    return user;
  }, []);

  const login = useCallback(async (credentials) => startSession(await authApi.login(credentials)), [startSession]);
  const signup = useCallback(async (details) => startSession(await authApi.register(details)), [startSession]);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    endSession(); // UI turant login par; backend call best-effort
    if (refreshToken) authApi.logout(refreshToken).catch(() => {});
  }, [endSession]);

  const retry = useCallback(() => {
    setState({ status: "loading", user: null });
    return bootstrap();
  }, [bootstrap]);

  const updateUser = useCallback((user) => setState((prev) => ({ ...prev, user })), []);

  const value = useMemo(
    () => ({ status: state.status, user: state.user, login, signup, logout, retry, updateUser }),
    [state, login, signup, logout, retry, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
