import { api } from "./client";
import { unwrap } from "./utils";

export const recurringApi = {
  list: (groupId, params) =>
    api
      .get(`/groups/${groupId}/recurring-expenses`, { params })
      .catch(() => api.get(`/groups/${groupId}/recurring`, { params }))
      .then(unwrap),
  create: (groupId, body) =>
    api
      .post(`/groups/${groupId}/recurring-expenses`, body)
      .catch(() => api.post(`/groups/${groupId}/recurring`, body))
      .then(unwrap),
  get: (id) =>
    api
      .get(`/recurring-expenses/${id}`)
      .catch(() => api.get(`/recurring/${id}`))
      .then(unwrap),
  update: (id, body) =>
    api
      .patch(`/recurring-expenses/${id}`, body)
      .catch(() => api.patch(`/recurring/${id}`, body))
      .then(unwrap),
  pause: (id) =>
    api
      .post(`/recurring-expenses/${id}/pause`)
      .catch(() => api.post(`/recurring/${id}/pause`))
      .then(unwrap),
  resume: (id) =>
    api
      .post(`/recurring-expenses/${id}/resume`)
      .catch(() => api.post(`/recurring/${id}/resume`))
      .then(unwrap),
  skip: (id) =>
    api
      .post(`/recurring-expenses/${id}/skip`)
      .catch(() => api.post(`/recurring/${id}/skip`))
      .then(unwrap),
  run: (id) =>
    api
      .post(`/recurring-expenses/${id}/run-now`)
      .catch(() => api.post(`/recurring/${id}/run`))
      .then(unwrap),
  remove: (id) =>
    api
      .delete(`/recurring-expenses/${id}`)
      .catch(() => api.delete(`/recurring/${id}`))
      .then(unwrap),
};
