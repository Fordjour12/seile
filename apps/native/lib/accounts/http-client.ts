import { env } from "@seile/env/native";

function normalizeBaseUrl(rawUrl: string): string {
  return rawUrl.endsWith("/") ? rawUrl.slice(0, -1) : rawUrl;
}

function deriveSiteUrl(convexUrl: string): string {
  try {
    const parsed = new URL(convexUrl);
    if (parsed.hostname.endsWith(".convex.cloud")) {
      return `https://${parsed.hostname.replace(/\.convex\.cloud$/, ".convex.site")}`;
    }

    if (parsed.hostname.endsWith(".cloud")) {
      return `https://${parsed.hostname.replace(/\.cloud$/, ".site")}`;
    }

    return `${parsed.origin}`;
  } catch {
    throw new Error("Invalid Convex URL configuration");
  }
}

export function getConvexSiteUrl(): string {
  const configuredSiteUrl = env.EXPO_PUBLIC_CONVEX_SITE_URL;
  if (configuredSiteUrl) {
    return normalizeBaseUrl(configuredSiteUrl);
  }

  return normalizeBaseUrl(deriveSiteUrl(env.EXPO_PUBLIC_CONVEX_URL));
}

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object" && "error" in payload) {
    const error = (payload as { error?: unknown }).error;
    if (typeof error === "string" && error.length > 0) {
      return error;
    }
  }

  return fallback;
}

export async function postJson<TResponse>(
  path: string,
  body: Record<string, unknown>,
): Promise<TResponse> {
  const baseUrl = getConvexSiteUrl();
  const requestUrl = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(requestUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(extractErrorMessage(payload, "Request failed"));
  }

  return payload as TResponse;
}
