import { api } from "@/lib/backend-api";

export const sharedGoalsApi = {
  queries: api.shared_goals.queries,
  mutations: api.shared_goals.mutations,
};
