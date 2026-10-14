import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { usersApi } from "@/api/users";
import { reportsApi, type ReportReason } from "@/api/reports";
import { chatKeys } from "@/hooks/useChats";
import { contactKeys } from "@/hooks/useContacts";

export const blockedKeys = {
  list: (phoneNumber: string) => ["blocked", phoneNumber] as const,
};

export function useBlockedUsers(phoneNumber?: string) {
  return useQuery({
    queryKey: blockedKeys.list(phoneNumber ?? ""),
    queryFn: () => usersApi.getBlocked(phoneNumber!),
    enabled: Boolean(phoneNumber),
  });
}

export function useToggleBlock(phoneNumber: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      targetPhoneNumber,
      block,
    }: {
      targetPhoneNumber: string;
      block: boolean;
    }) => usersApi.block(phoneNumber, targetPhoneNumber, block),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blockedKeys.list(phoneNumber) });
      queryClient.invalidateQueries({ queryKey: contactKeys.list(phoneNumber) });
      queryClient.invalidateQueries({ queryKey: chatKeys.list(phoneNumber) });
    },
  });
}

export function useReportUser(phoneNumber: string) {
  return useMutation({
    mutationFn: ({
      targetPhoneNumber,
      reason,
    }: {
      targetPhoneNumber: string;
      reason: ReportReason;
    }) => reportsApi.create(phoneNumber, targetPhoneNumber, reason),
  });
}
