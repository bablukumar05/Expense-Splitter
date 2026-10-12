import { api } from "./client";
import { unwrap } from "./utils";

export const inviteApi = {
  // => { group: { name, memberCount } }
  preview: (code) => api.get(`/invite/${encodeURIComponent(code)}`, { skipAuthRefresh: true }).then(unwrap),
  // => { group: { id, name } }
  join: (code) => api.post(`/invite/${encodeURIComponent(code)}/join`).then(unwrap),
};
