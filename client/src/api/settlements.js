import { api } from "./client";
import { unwrap } from "./utils";

export const settlementsApi = {
  create: (groupId, body) => api.post(`/groups/${groupId}/settlements`, body).then(unwrap),
  list: (groupId, params) => api.get(`/groups/${groupId}/settlements`, { params }).then(unwrap),
  undo: (settlementId) => api.delete(`/settlements/${settlementId}`).then(unwrap),
  remove: (settlementId) => api.delete(`/settlements/${settlementId}`).then(unwrap),
};
