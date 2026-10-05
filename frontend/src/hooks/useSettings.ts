import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { settingsApi, type UpdateSettingsPayload } from "@/api/settings";
import type { Settings } from "@/types/api";

export const settingsKeys = {
  byPhone: (phoneNumber: string) => ["settings", phoneNumber] as const,
};

/** Returns the first (only) settings record for the user. */
export function useSettings(phoneNumber?: string) {
  return useQuery({
    queryKey: settingsKeys.byPhone(phoneNumber ?? ""),
    queryFn: async (): Promise<Settings | null> => {
      const list = await settingsApi.getByPhone(phoneNumber!);
      return list[0] ?? null;
    },
    enabled: Boolean(phoneNumber),
  });
}

export function useUpdateSettings(phoneNumber: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<UpdateSettingsPayload, "phoneNumber">) =>
      settingsApi.update({ ...payload, phoneNumber }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: settingsKeys.byPhone(phoneNumber),
      }),
  });
}
