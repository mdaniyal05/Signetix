/** Persistence + in-memory cache for the signed-in session. */
import type { AuthSession } from "@/types/api";

const STORAGE_KEY = "signetix.session";

let cachedSession: AuthSession | null = null;
let loaded = false;

function load(): AuthSession | null {
  if (loaded) return cachedSession;
  loaded = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    cachedSession = raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    cachedSession = null;
  }
  return cachedSession;
}

export function getSession(): AuthSession | null {
  return load();
}

export function setSession(session: AuthSession): void {
  cachedSession = session;
  loaded = true;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* ignore storage errors */
  }
}

/** Patch the stored session (e.g. a refreshed access token). */
export function updateSession(patch: Partial<AuthSession>): void {
  const current = load();
  if (!current) return;
  setSession({ ...current, ...patch });
}

export function clearSession(): void {
  cachedSession = null;
  loaded = true;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
