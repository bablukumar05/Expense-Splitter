import { api } from "./client";
import { unwrap } from "./utils";

export const balancesApi = {
  me: () => api.get("/users/me/balances").then(unwrap),
  group: (groupId) => api.get(`/groups/${groupId}/balances`).then(unwrap),
  plan: (groupId) => api.get(`/groups/${groupId}/simplify`).then(unwrap),
};
