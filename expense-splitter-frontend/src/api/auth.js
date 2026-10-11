import { api } from "./client";

// Backend: { success, message, data } => sirf data chahiye
const unwrap = (response) => response.data.data;
const open = { skipAuthRefresh: true }; // in endpoints par token/refresh logic nahi

export const authApi = {
  register: (body) => api.post("/auth/register", body, open).then(unwrap), // { user, accessToken, refreshToken }
  login: (body) => api.post("/auth/login", body, open).then(unwrap),
  logout: (refreshToken) => api.post("/auth/logout", { refreshToken }, open),
  me: () =>
    api
      .get("/auth/me")
      .then(unwrap)
      .then((data) => (data?.user ? data : { user: data })), // { user }
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }, open),
  resetPassword: (token, password) =>
    api.post(`/auth/reset-password/${encodeURIComponent(token)}`, { password }, open),
};
