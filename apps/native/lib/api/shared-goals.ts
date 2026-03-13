import { api } from "@/lib/backend-api";

export const sharedGoalsApi = {
  queries: (api as any)["shared_goals/queries"],
  mutations: (api as any)["shared_goals/mutations"],
};
