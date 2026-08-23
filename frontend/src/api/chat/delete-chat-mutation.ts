import { useMutation, useQueryClient } from "@tanstack/react-query"
import { API_URL } from "../../constants/Config"
import { fetchWithAuth, getToken } from "../index"

interface DeleteChatPayload {
  userPhoneNumber: string
  chatId: string
}

export const deleteChat = async (payload: DeleteChatPayload) => {
  const token = getToken()

  const response = await fetchWithAuth(`${API_URL}/chats/delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: token } : {}),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) throw new Error("Failed to delete chat")

  return await response.json()
}

export const useDeleteChatMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] })
    },
  })
}
