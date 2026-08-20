import { useQuery } from "@tanstack/react-query"
import { API_URL } from "../constants/Config"
import { fetchWithAuth, getToken } from "./index"

export type UserContact = {
  _id: string
  userId: string
  contactUserId: {
    _id: string
    name: string
    phoneNumber: string
    profilePicture: string | null
  }
  status: boolean
  createdAt: string
  __v: number
}

export const contactsQueryKey = (params: { phoneNumber?: string }) => [
  "contacts",
  params.phoneNumber,
]

export const useContactsQuery = (params: { phoneNumber?: string }) =>
  useQuery({
    refetchInterval: 5000,
    queryKey: contactsQueryKey(params),
    queryFn: async (): Promise<UserContact[]> => {
      if (!params.phoneNumber) return []

      const token = getToken()
      const response = await fetchWithAuth(
        `${API_URL}/contacts/${params.phoneNumber}`,
        token ? { headers: { Authorization: token } } : {}
      )

      if (!response.ok) throw new Error("Failed to fetch contacts")

      return (await response.json()) as UserContact[]
    },
  })
