import { useQuery } from "@tanstack/react-query"
import { API_URL } from "../../constants/Config"
import { fetchWithAuth, getToken } from "../index"

export interface CallParticipant {
  _id: string
  name: string
  phoneNumber: string
  type: "incoming" | "outgoing"
  profilePicture?: string
}

export interface CallEntry {
  _id: string
  initiatorId: { _id: string; name: string; phoneNumber: string }
  deletedBy: string[]
  participants: CallParticipant[]
  callType: string
  callDurationInSeconds: number
  callStatus: string
  initiatedAt: string
  createdAt: string
  updatedAt: string
  __v: number
}

export const callsQueryKey = (params: { phoneNumber?: string }) => [
  "callHistory",
  params.phoneNumber,
]

export const useCallHistoryQuery = ({
  phoneNumber,
}: {
  phoneNumber?: string
}) =>
  useQuery({
    refetchInterval: 500,
    queryKey: callsQueryKey({ phoneNumber }),
    queryFn: async (): Promise<CallEntry[]> => {
      if (!phoneNumber) return []

      const token = getToken()

      const response = await fetchWithAuth(
        `${API_URL}/callHistory/${phoneNumber}`,
        token ? { headers: { Authorization: token } } : {}
      )

      if (!response.ok) throw new Error("Failed to fetch call history")

      return (await response.json()) as CallEntry[]
    },
  })
