import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    BETTER_AUTH_SECRET: z.string().min(32),
    SITE_URL: z.url(),
    OPENROUTER_API_KEY: z.string().min(1).optional(),
    OPENROUTER_APP_NAME: z.string().min(1).optional(),
    PLANNER_AGENT_MODEL: z.string().min(1).optional(),
    PLANNER_AGENT_BASE_URL: z.url().optional(),
    FINANCE_AGENT_MODEL: z.string().min(1).optional(),
    FINANCE_AGENT_BASE_URL: z.url().optional(),
    CONVEX_SITE_URL: z.url(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
