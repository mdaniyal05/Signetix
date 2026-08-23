import { useQuery } from "@tanstack/react-query"
import { API_URL } from "../../constants/Config"
import { fetchWithAuth, getToken } from "../index"

export interface MessageUser {
  _id: string
  name: string
  phoneNumber: string
}

export interface Message {
  __v: number
  _id: string
  chatId: string
  content: string
  createdAt: string
  receiverIds: MessageUser[]
  senderId: MessageUser
  deletedBy: string[]
}

export const chatMessagesQueryKey = (chatId: string) => [
  "chats",
  "chatMessages",
  chatId,
]

export const useChatMessagesQuery = (chatId?: string) =>
  useQuery({
    queryKey: chatMessagesQueryKey(chatId ?? ""),
    refetchInterval: 500,
    queryFn: async (): Promise<Message[]> => {
      if (!chatId) return []

      const token = getToken()

      const response = await fetchWithAuth(
        `${API_URL}/chats/custom/id/${chatId}`,
        token ? { headers: { Authorization: token } } : {}
      )

      if (!response.ok) throw new Error("Failed to fetch chat messages")

      const data = (await response.json()) as { messages?: Message[] }

      return ((data.messages ?? []) as Message[]).sort((a, b) => {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      })
    },
  })
