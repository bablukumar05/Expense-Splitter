import { api } from "./client";
import { unwrap } from "./utils";

export const balancesApi = {

  me: () => api.get("/users/me/balances").then(unwrap),
};
