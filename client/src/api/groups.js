import { api } from "./client";
import { unwrap } from "./utils";

export const groupsApi = {
  // => { groups: [...], pagination: { page, limit, total, pages } }
  list: ({ page = 1, limit = 12, search } = {}) =>
    api.get("/groups", { params: { page, limit, ...(search ? { search } : {}) } }).then(unwrap),

  // => { group }
  create: (body) => api.post("/groups", body).then(unwrap),
};
