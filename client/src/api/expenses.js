import { api } from "./client";
import { unwrap } from "./utils";

export const expensesApi = {
  list: (groupId, params) => api.get(`/groups/${groupId}/expenses`, { params }).then(unwrap),
  create: (groupId, body) => api.post(`/groups/${groupId}/expenses`, body).then(unwrap),
  get: (expenseId) => api.get(`/expenses/${expenseId}`).then(unwrap),
  update: (expenseId, body) => api.patch(`/expenses/${expenseId}`, body).then(unwrap),
  remove: (expenseId) => api.delete(`/expenses/${expenseId}`).then(unwrap),

  uploadReceipt: (expenseId, file) => {
    const form = new FormData();
    form.append("receipt", file);
    return api.post(`/expenses/${expenseId}/receipt`, form).then(unwrap);
  },
  removeReceipt: (expenseId) => api.delete(`/expenses/${expenseId}/receipt`).then(unwrap),

  comments: (expenseId, params) => api.get(`/expenses/${expenseId}/comments`, { params }).then(unwrap),
  addComment: (expenseId, text) => api.post(`/expenses/${expenseId}/comments`, { text }).then(unwrap),
  removeComment: (expenseId, commentId) =>
    api.delete(`/expenses/${expenseId}/comments/${commentId}`).then(unwrap),
};
