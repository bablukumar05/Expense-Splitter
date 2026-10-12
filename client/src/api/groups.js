import { api } from "./client";
import { unwrap } from "./utils";

export const groupsApi = {
  // => { groups: [...], pagination }
  list: ({ page = 1, limit = 12, search } = {}) =>
    api.get("/groups", { params: { page, limit, ...(search ? { search } : {}) } }).then(unwrap),
  create: (body) => api.post("/groups", body).then(unwrap),

  // => { group } (members populate hote hain, sirf active members)
  get: (groupId) => api.get(`/groups/${groupId}`).then(unwrap),
  update: (groupId, body) => api.patch(`/groups/${groupId}`, body).then(unwrap),
  remove: (groupId) => api.delete(`/groups/${groupId}`).then(unwrap),
  restore: (groupId) => api.post(`/groups/${groupId}/restore`).then(unwrap),
  leave: (groupId) => api.post(`/groups/${groupId}/leave`).then(unwrap),

  addPlaceholder: (groupId, name) => api.post(`/groups/${groupId}/placeholders`, { name }).then(unwrap),
  removeMember: (groupId, memberId, { block = false } = {}) =>
    api.delete(`/groups/${groupId}/members/${memberId}`, { params: { block } }).then(unwrap),
  changeRole: (groupId, memberId, role) =>
    api.patch(`/groups/${groupId}/members/${memberId}/role`, { role }).then(unwrap),
  mergePlaceholder: (groupId, placeholderId, memberId) =>
    api.post(`/groups/${groupId}/placeholders/${placeholderId}/merge`, { memberId }).then(unwrap),

  // Invite (sirf admin). Sab { invite: { link, isActive, expiresAt, maxUses, usedCount } } dete hain
  getInvite: (groupId) => api.get(`/groups/${groupId}/invite`).then(unwrap),
  regenerateInvite: (groupId) => api.post(`/groups/${groupId}/invite/regenerate`).then(unwrap),
  updateInvite: (groupId, body) => api.patch(`/groups/${groupId}/invite`, body).then(unwrap),
  inviteByEmail: (groupId, email) => api.post(`/groups/${groupId}/invitations`, { email }).then(unwrap),
};
