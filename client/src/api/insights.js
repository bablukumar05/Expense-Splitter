import { api } from "./client";
import { unwrap } from "./utils";

const rangeParams = ({ from, to, category }) => ({
  fromDate: from,
  toDate: to,
  from,
  to,
  ...(category ? { category } : {}),
});

export const insightsApi = {
  group: (groupId, range) => api.get(`/groups/${groupId}/stats`, { params: rangeParams(range) }).then(unwrap),
  me: (range) => api.get("/users/me/stats", { params: rangeParams(range) }).then(unwrap),
};
