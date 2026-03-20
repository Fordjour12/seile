import { httpRouter } from "convex/server";

import { authComponent, createAuth } from "./auth";
import { registerAiStreamingRoutes } from "./ai/streaming";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth, { cors: true });
registerAiStreamingRoutes(http);

export default http;
