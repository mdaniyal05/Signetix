import { api } from "./client";
import type { User, UserRef } from "@/types/api";

const enc = encodeURIComponent;

export interface UpdateUserPayload {
  phoneNumber: string;
  name?: string;
  password?: string;
  profilePicture?: string;
  profileStatus?: string;
}

export const usersApi = {
  getAll: () => api.get<User[]>("/users/all"),

  getByPhone: (phoneNumber: string) =>
    api.get<User>(`/users/phone/${enc(phoneNumber)}`),

  update: (payload: UpdateUserPayload) =>
    api.put<User>("/users/update", payload),

  getBlocked: (phoneNumber: string) =>
    api.get<UserRef[]>(`/users/blocked/${enc(phoneNumber)}`),

  block: (phoneNumber: string, targetPhoneNumber: string, block: boolean) =>
    api.post<{ blockedUsers: string[] }>("/users/block", {
      phoneNumber,
      targetPhoneNumber,
      block,
    }),
};
