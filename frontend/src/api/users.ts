import { api } from "./client";
import type { User } from "@/types/api";

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
};
