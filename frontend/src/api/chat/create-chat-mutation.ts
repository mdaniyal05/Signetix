import { useMutation, useQueryClient } from "@tanstack/react-query"
import { API_URL } from "../../constants/Config"
import { chatsQueryKey } from "./chats-query"
import { fetchWithAuth, getToken } from "../index"

export interface CreateChatParams {
  mainUserPhoneNumber: string
  participants: string[]
}

export const useCreateChatMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: CreateChatParams) => {
      const token = getToken()

      const response = await fetchWithAuth(`${API_URL}/chats/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: token } : {}),
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) throw new Error("Failed to create chat")

      return await response.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: chatsQueryKey({ phoneNumber: variables.mainUserPhoneNumber }),
      })
    },
  })
}
