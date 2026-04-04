// src/lib/apiClient.ts
// Internal API client for Next.js (Vercel-safe)
// All fetch calls go through here so the rest of the app
// never needs to hardcode URLs or deal with raw fetch logic.

type Verb = "GET" | "POST" | "PUT" | "DELETE";

/**
 * Core request function — not exported.
 * Use get / post / put / del helpers below instead.
 */
async function request<T>(
  path: string,
  method: Verb = "GET",
  body?: unknown
): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: method !== "GET" ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const text = await response.text();
  try {
    return text ? (JSON.parse(text) as T) : ({} as T);
  } catch {
    throw new Error("Invalid JSON response");
  }
}

// Typed helper functions — these are the only things you import
export const get = async <T>(path: string): Promise<T> =>
  request<T>(path, "GET");

export const post = async <T, B = unknown>(path: string, body: B): Promise<T> =>
  request<T>(path, "POST", body);

export const put = async <T, B = unknown>(path: string, body: B): Promise<T> =>
  request<T>(path, "PUT", body);

export const del = async <T>(path: string): Promise<T> =>
  request<T>(path, "DELETE");
