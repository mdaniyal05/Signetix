import { useMutation, useQueryClient } from "@tanstack/react-query"
import { API_URL } from "../../constants/Config"
import { fetchWithAuth, getToken } from "../index"
import { chatsQueryKey } from "./chats-query"

interface PinChatPayload {
  userPhoneNumber: string
  chatId: string
  isPinned: boolean
}

export const pinChat = async (payload: PinChatPayload) => {
  const token = getToken()

  const response = await fetchWithAuth(`${API_URL}/chats/pin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: token } : {}),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) throw new Error("Failed to pin chat")

  return await response.json()
}

export const usePinChatMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: pinChat,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: chatsQueryKey({ phoneNumber: variables.userPhoneNumber }),
      })
    },
  })
}
