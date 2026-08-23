import { useMutation, useQueryClient } from "@tanstack/react-query"
import { API_URL } from "../../constants/Config"
import { fetchWithAuth, getToken } from "../index"

interface DeleteCallPayload {
  phoneNumber: string
  callHistoryLogIds: string[]
}

export const deleteCallLog = async (payload: DeleteCallPayload) => {
  const token = getToken()

  const response = await fetchWithAuth(`${API_URL}/callHistory/delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: token } : {}),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) throw new Error("Failed to delete call log")

  return await response.json()
}

export const useDeleteCallMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCallLog,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["callHistory", variables.phoneNumber],
      })
    },
  })
}
