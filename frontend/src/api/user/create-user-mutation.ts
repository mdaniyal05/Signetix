import { useMutation, useQueryClient } from "@tanstack/react-query"
import { API_URL } from "../../constants/Config"
import type { User } from "./login-user-mutation"

export interface CreateUserParams {
  name: string
  phoneNumber: string
  password: string
}

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: CreateUserParams): Promise<User> => {
      const response = await fetch(`${API_URL}/auth/users/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })

      if (!response.ok) throw new Error("Failed to create user")

      return (await response.json()) as User
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user"] }),
  })
}
