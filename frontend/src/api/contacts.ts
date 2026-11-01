import { api } from "./client";
import type { Contact } from "@/types/api";

const enc = encodeURIComponent;

export const contactsApi = {
  listByPhone: (phoneNumber: string) =>
    api.get<Contact[]>(`/contacts/${enc(phoneNumber)}`),

  /** Replace the user's contact set; the backend diffs to add/remove (send the full desired list). */
  setContacts: (userPhoneNumber: string, contacts: string[]) =>
    api.post<{ message: string; added: number; removed: number }>(
      "/contacts/create",
      { userPhoneNumber, contacts },
    ),

  remove: (userId: string, targetUserId: string) =>
    api.del("/contacts/delete", { userId, targetUserId }),
};
