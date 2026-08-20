import { QueryClient } from "@tanstack/react-query"
import { getStorageValue, setStorageValue } from "../context/storage"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {},
    mutations: {},
  },
})

export const videoSDKToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiIyN2ZhZDRjMy0xM2ZiLTQ1ZGQtYjBkOS1mODEzYWUxNmU2ZjIiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTczNDY0ODU1OSwiZXhwIjoxODkyNDM2NTU5fQ.Y3bEl5_ffScQJroMT_ihsKs0W0U45bS0w9481rWwl4c"

export const createMeeting = async (): Promise<string> => {
  const res = await fetch("https://api.videosdk.live/v2/rooms", {
    method: "POST",
    headers: {
      authorization: videoSDKToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  })

  const { roomId } = (await res.json()) as { roomId: string }

  return roomId
}

export const getToken = (): string | null => {
  const raw = getStorageValue("user")

  if (!raw) return null

  try {
    const user = JSON.parse(raw) as { accessToken: string }

    return user.accessToken ? `Bearer ${user.accessToken}` : null
  } catch {
    return null
  }
}

export const fetchWithAuth = async (
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> => {
  const response = await fetch(input, init)

  if (response.status === 401) {
    setStorageValue("user", "")

    window.location.href = "/"

    throw new Error("Unauthorized")
  }

  return response
}
