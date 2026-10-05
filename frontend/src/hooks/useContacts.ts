import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { contactsApi } from "@/api/contacts";

export const contactKeys = {
  list: (phoneNumber: string) => ["contacts", phoneNumber] as const,
};

export function useContacts(phoneNumber?: string) {
  return useQuery({
    queryKey: contactKeys.list(phoneNumber ?? ""),
    queryFn: () => contactsApi.listByPhone(phoneNumber!),
    enabled: Boolean(phoneNumber),
  });
}

/** Replace the user's whole contact set (backend diffs add/remove). */
export function useSetContacts(phoneNumber: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contactPhoneNumbers: string[]) =>
      contactsApi.setContacts(phoneNumber, contactPhoneNumbers),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: contactKeys.list(phoneNumber),
      }),
  });
}

export function useRemoveContact(phoneNumber: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      targetUserId,
    }: {
      userId: string;
      targetUserId: string;
    }) => contactsApi.remove(userId, targetUserId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: contactKeys.list(phoneNumber),
      }),
  });
}
