import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { callHistoryApi } from "@/api/callHistory";

export const callHistoryKeys = {
  list: (phoneNumber: string) => ["call-history", phoneNumber] as const,
};

export function useCallHistory(phoneNumber?: string) {
  return useQuery({
    queryKey: callHistoryKeys.list(phoneNumber ?? ""),
    queryFn: () => callHistoryApi.listByPhone(phoneNumber!),
    enabled: Boolean(phoneNumber),
  });
}

export function useDeleteCallLogs(phoneNumber: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (callHistoryLogIds: string[]) =>
      callHistoryApi.remove(phoneNumber, callHistoryLogIds),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: callHistoryKeys.list(phoneNumber),
      }),
  });
}
