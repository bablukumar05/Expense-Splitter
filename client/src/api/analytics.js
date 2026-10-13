import { api } from "./client";
import { unwrap } from "./utils";

export const analyticsApi = {
  getGroupStats: (groupId, params) => api.get(`/groups/${groupId}/stats`, { params }).then(unwrap),
  getMyStats: (params) => api.get("/users/me/stats", { params }).then(unwrap),
};
