import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { authApi } from "@/api/auth";
import { onUnauthorized } from "@/api/client";
import {
  clearSession,
  getSession,
  setSession as persistSession,
  updateSession,
} from "@/auth/auth-storage";
import type { AuthResponse, AuthSession } from "@/types/api";

interface AuthContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  login: (phoneNumber: string, password: string) => Promise<void>;
  signup: (
    name: string,
    phoneNumber: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
  patchSession: (patch: Partial<AuthSession>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toSession(response: AuthResponse): AuthSession {
  return {
    userId: response._id,
    name: response.name,
    phoneNumber: response.phoneNumber,
    accessToken: response.accessToken,
    refreshToken: response.userAuthenticationRecord?.refreshToken ?? "",
    profilePicture: response.profilePicture,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(() =>
    getSession(),
  );

  // Force logout if the API client gives up on refreshing the token.
  useEffect(() => onUnauthorized(() => setSessionState(null)), []);

  const login = useCallback(async (phoneNumber: string, password: string) => {
    const response = await authApi.login(phoneNumber, password);
    const next = toSession(response);
    persistSession(next);
    setSessionState(next);
  }, []);

  const signup = useCallback(
    async (name: string, phoneNumber: string, password: string) => {
      const response = await authApi.signup(name, phoneNumber, password);
      const next = toSession(response);
      persistSession(next);
      setSessionState(next);
    },
    [],
  );

  const logout = useCallback(() => {
    clearSession();
    setSessionState(null);
  }, []);

  const patchSession = useCallback((patch: Partial<AuthSession>) => {
    updateSession(patch);
    setSessionState((current) =>
      current ? { ...current, ...patch } : current,
    );
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: session !== null,
      login,
      signup,
      logout,
      patchSession,
    }),
    [session, login, signup, logout, patchSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
