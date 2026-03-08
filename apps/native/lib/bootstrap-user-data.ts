import { api } from "@/lib/backend-api";
import { convex } from "@/lib/convex-client";

export async function bootstrapUserData() {
  return await convex.mutation(api.bootstrap.bootstrapUserData, {});
}
