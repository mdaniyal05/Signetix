import { useMutation, useQueryClient } from "@tanstack/react-query"
import { API_URL } from "../../constants/Config"
import { chatMessagesQueryKey } from "../chat/chats-messages-query"
import { fetchWithAuth, getToken } from "../index"

export interface SendMessageParams {
  mainUserPhoneNumber: string
  targetUserPhoneNumbers: string[]
  message: string
  chatId: string
}

export const useSendMessageMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: SendMessageParams) => {
      const token = getToken()

      const response = await fetchWithAuth(`${API_URL}/messages/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: token } : {}),
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) throw new Error("Failed to send message")

      return await response.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: chatMessagesQueryKey(variables.chatId),
      })
    },
  })
}
