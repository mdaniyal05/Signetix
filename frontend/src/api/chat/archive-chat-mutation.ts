import { useMutation, useQueryClient } from "@tanstack/react-query"
import { API_URL } from "../../constants/Config"
import { fetchWithAuth, getToken } from "../index"
import { chatsQueryKey } from "./chats-query"

interface ArchiveChatPayload {
  userPhoneNumber: string
  chatId: string
  isArchived: boolean
}

export const archiveChat = async (payload: ArchiveChatPayload) => {
  const token = getToken()

  const response = await fetchWithAuth(`${API_URL}/chats/archive`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: token } : {}),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) throw new Error("Failed to archive chat")

  return await response.json()
}

export const useArchiveChatMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: archiveChat,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: chatsQueryKey({ phoneNumber: variables.userPhoneNumber }),
      })
    },
  })
}
