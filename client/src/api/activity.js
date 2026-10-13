import { api } from "./client";
import { unwrap } from "./utils";

export const activityApi = {
  list: (groupId, params) => api.get(`/groups/${groupId}/activity`, { params }).then(unwrap),
};
