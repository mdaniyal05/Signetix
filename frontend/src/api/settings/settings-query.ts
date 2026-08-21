import { useQuery } from "@tanstack/react-query"
import { API_URL } from "../../constants/Config"
import { fetchWithAuth, getToken } from "../index"

export type UserSettings = {
  _id: string
  userId: { _id: string; name: string; phoneNumber: string }
  theme: string
  autoDownload: boolean
  notificationEnabled: boolean
  aslTranslationLanguage: number
  createdAt: string
  updatedAt: string
  __v: number
}

export const settingsQueryKey = (params: { phoneNumber?: string }) => [
  "settings",
  params.phoneNumber,
]

export const useSettingsQuery = (params: { phoneNumber?: string }) =>
  useQuery({
    queryKey: settingsQueryKey(params),
    enabled: !!params.phoneNumber,
    queryFn: async (): Promise<UserSettings> => {
      const token = getToken()

      const response = await fetchWithAuth(
        `${API_URL}/settings/${params.phoneNumber}`,
        token ? { headers: { Authorization: token } } : {}
      )

      if (!response.ok) throw new Error("Failed to fetch settings")

      const data = (await response.json()) as UserSettings[]

      if (!Array.isArray(data) || data.length === 0)
        throw new Error("No settings found")

      return data[0]!
    },
  })
