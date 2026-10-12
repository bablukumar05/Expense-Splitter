export const queryKeys = {
  groups: {
    all: ["groups"],
    list: (search = "") => ["groups", "list", { search }],
  },
  balances: {
    me: ["balances", "me"],
  },
};
