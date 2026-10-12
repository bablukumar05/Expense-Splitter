import { api } from "./client";
import { unwrap } from "./utils";

export const inviteApi = {

  preview: (code) => api.get(`/invite/${encodeURIComponent(code)}`, { skipAuthRefresh: true }).then(unwrap),

  join: (code) => api.post(`/invite/${encodeURIComponent(code)}/join`).then(unwrap),
};
