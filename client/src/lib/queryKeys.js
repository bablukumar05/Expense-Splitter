export const queryKeys = {
  groups: {
    all: ["groups"],
    lists: ["groups", "list"],
    list: (search = "") => ["groups", "list", { search }],
    detail: (id) => ["groups", "detail", id],
  },
  balances: {
    all: ["balances"],
    me: ["balances", "me"],
    group: (groupId) => ["balances", "group", groupId],
    plan: (groupId) => ["balances", "plan", groupId],
  },
  settlements: {
    lists: (groupId) => ["settlements", groupId, "list"],
  },
  expenses: {
    lists: (groupId) => ["expenses", groupId, "list"],
    list: (groupId, filters) => ["expenses", groupId, "list", filters],
    detail: (expenseId) => ["expenses", "detail", expenseId],
    comments: (expenseId) => ["expenses", "comments", expenseId],
  },
  activity: (groupId) => ["activity", groupId],
  insights: {
    all: ["insights"],
    group: (groupId, params) => ["insights", "group", groupId, params],
    me: (params) => ["insights", "me", params],
  },
  analytics: {
    all: ["insights"],
    group: (groupId, params) => ["insights", "group", groupId, params],
    me: (params) => ["insights", "me", params],
  },
  recurring: {
    all: ["recurring"],
    list: (groupId) => ["recurring", "list", groupId],
    detail: (id) => ["recurring", "detail", id],
  },
  invite: (groupId) => ["invites", groupId],
  invitePreview: (code) => ["invitePreview", code],
};
