export const queryKeys = {
  groups: {
    all: ["groups"],
    lists: ["groups", "list"],
    list: (search = "") => ["groups", "list", { search }],
    detail: (id) => ["groups", "detail", id],
  },
  balances: { me: ["balances", "me"] },
  invite: (groupId) => ["invites", groupId],
  invitePreview: (code) => ["invitePreview", code],
};
