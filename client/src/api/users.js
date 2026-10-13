import { api } from "./client";
import { unwrap } from "./utils";

export const usersApi = {
  updateMe: (body) => api.patch("/users/me", body).then(unwrap),
  changePassword: (body) => api.patch("/users/change-password", body).then(unwrap),
};
