import { api } from "./client";
import type { AuthResponse } from "@/types/api";

const enc = encodeURIComponent;

export const authApi = {
  login: (phoneNumber: string, password: string) =>
    api.post<AuthResponse>("/auth/users/login", { phoneNumber, password }),

  signup: (name: string, phoneNumber: string, password: string) =>
    api.post<AuthResponse>("/auth/users/create", {
      name,
      phoneNumber,
      password,
    }),

  /** Fetch the authentication record (isVerified, etc.) for a phone number. */
  getAuthRecord: (phoneNumber: string) =>
    api.get(`/userAuthentication/${enc(phoneNumber)}`),
};
