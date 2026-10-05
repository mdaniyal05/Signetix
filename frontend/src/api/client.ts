/**
 * Core HTTP client for the Signetix REST API.
 *
 * - Attaches the bearer access token.
 * - On a 401 "ACCESS_TOKEN_EXPIRED", refreshes once via /jwt/refresh and retries
 *   the original request (refreshes are de-duped behind a single promise).
 * - On refresh failure, clears the session and notifies listeners (so the auth
 *   context can redirect to login).
 */
import { API_BASE_URL } from "@/config/env";
import { clearSession, getSession, updateSession } from "@/auth/auth-storage";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type UnauthorizedListener = () => void;
const unauthorizedListeners = new Set<UnauthorizedListener>();

/** Register a callback fired when the session becomes unrecoverable. */
export function onUnauthorized(listener: UnauthorizedListener): () => void {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

function notifyUnauthorized(): void {
  clearSession();
  unauthorizedListeners.forEach((listener) => listener());
}

/** Pull a human-readable message out of the backend's varied error shapes. */
function extractErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    for (const key of ["Message", "message", "error", "customMessage"]) {
      const value = record[key];
      if (typeof value === "string" && value) return value;
    }
  }
  return fallback;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  /** Internal: prevents infinite refresh recursion. */
  _retried?: boolean;
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const session = getSession();
  if (!session?.refreshToken) return false;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/jwt/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phoneNumber: session.phoneNumber,
            refreshToken: session.refreshToken,
          }),
        });
        if (!response.ok) return false;
        const data = (await response.json()) as { accessToken?: string };
        if (!data.accessToken) return false;
        updateSession({ accessToken: data.accessToken });
        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const session = getSession();
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (session?.accessToken) {
    headers["Authorization"] = `Bearer ${session.accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401 && !options._retried) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiRequest<T>(path, { ...options, _retried: true });
    }
    notifyUnauthorized();
    throw new ApiError(401, "Your session expired. Please sign in again.");
  }

  // 204 / empty body
  const text = await response.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    throw new ApiError(
      response.status,
      extractErrorMessage(data, `Request failed (${response.status})`),
    );
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => apiRequest<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: "PUT", body }),
  del: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: "DELETE", body }),
};
