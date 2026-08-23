import { useMutation } from "@tanstack/react-query"
import { API_URL } from "../../constants/Config"
import { fetchWithAuth, getToken } from "../index"

export interface UserVerification {
  _id: string
  userId: string
  isVerified: boolean
  createdAt: string
  updatedAt: string
  __v: number
}

export const useUserVerificationMutation = () =>
  useMutation({
    mutationFn: async (params: {
      phoneNumber: string
    }): Promise<UserVerification> => {
      const token = getToken()

      const response = await fetchWithAuth(
        `${API_URL}/userAuthentication/${params.phoneNumber}`,
        token ? { headers: { Authorization: token } } : {}
      )

      if (!response.ok) throw new Error("Failed to verify user")

      return (await response.json()) as UserVerification
    },
  })
