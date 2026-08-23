import { useQuery } from "@tanstack/react-query"
import { API_URL } from "../../constants/Config"
import { fetchWithAuth, getToken } from "../index"

type Participant = {
  _id: string
  name: string
  phoneNumber: string
  profilePicture?: string | null
}

export type Chat = {
  _id: string
  mainUserId: Participant
  participants: Participant[]
  totalNumberOfMessages: number
  totalNumberOfMessagesInChat: number
  createdAt: string
  __v: number
  lastMessage: string
  archivedBy: string[]
  pinnedBy: string[]
  isPinned: boolean
  deletedBy: string[]
}

export const chatsQueryKey = (params: { phoneNumber?: string }) => [
  "chats",
  params.phoneNumber,
]

export const useChatsQuery = (params: { phoneNumber?: string }) =>
  useQuery({
    refetchInterval: 500,
    queryKey: chatsQueryKey(params),
    queryFn: async (): Promise<Chat[]> => {
      if (!params.phoneNumber) return []

      const token = getToken()

      const response = await fetchWithAuth(
        `${API_URL}/chats/${params.phoneNumber}`,
        token ? { headers: { Authorization: token } } : {}
      )

      if (!response.ok) throw new Error("Failed to fetch chats")

      const data = (await response.json()) as Chat[]

      return Array.isArray(data) ? data : []
    },
  })
