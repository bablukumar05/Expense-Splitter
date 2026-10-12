import { api } from "./client";
import { unwrap } from "./utils";

export const balancesApi = {
  // => { summary: { INR: { youAreOwed, youOwe, net } }, groups: [{ groupId, name, currency, balance }] }
  me: () => api.get("/users/me/balances").then(unwrap),
};
