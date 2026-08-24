/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  type FC,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { io, Socket } from "socket.io-client"
import { API_URL } from "../constants/Config"
import { createMeeting, queryClient } from "../api"
import { QueryClientProvider } from "@tanstack/react-query"
import type { User } from "../api/user/login-user-mutation"
import { sanitizePhoneNumber } from "../constants/Utils"
import { useNavigate } from "react-router-dom"

export type CallType = {
  type: "video" | "voice"
  meetingId: string
  caller: string
  callee: string
}

type AppContextType = {
  phoneNumber?: string
  setPhoneNumber: (phoneNumber: string) => void
  isConnected: boolean
  call: CallType | null
  declineCall: () => void
  sendMessage: (
    message: string,
    targetPhoneNumbers: string[],
    chatId: string
  ) => void
  user: User | undefined
  setUser: (user: User) => void
  chatsSearchQuery: string
  setChatsSearchQuery: (query: string) => void
  callSearchQuery: string
  setCallSearchQuery: (query: string) => void
  callUser: (type: "voice" | "video", targetPhoneNumber: string) => void
  reset: () => void
  sendMeetingAccepted: () => void
  incomingCallUser: string | undefined
  callingUser: string | undefined
}

export const AppContext = createContext<AppContextType | null>(null)

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}

export const AppProviderInner: FC<{ children: ReactNode }> = ({ children }) => {
  const [chatsSearchQuery, setChatsSearchQuery] = useState("")
  const [callSearchQuery, setCallSearchQuery] = useState("")
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>()
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const [call, setCall] = useState<CallType | null>(null)
  const [targetPhoneNumbers, setTargetPhoneNumbers] = useState<string[]>([])
  const [user, setUser] = useState<User | undefined>()

  const navigate = useNavigate()

  const reset = useCallback(() => {
    setPhoneNumber(undefined)
    setIsConnected(false)
    setCall(null)
    setUser(undefined)
    setChatsSearchQuery("")
    setCallSearchQuery("")
  }, [])

  const sendMeetingId = useCallback(
    (meetingId: string, targetPhoneNumber: string, isVoiceCall: boolean) => {
      const socket = socketRef.current

      if (socket && phoneNumber) {
        const sanitizedTarget = sanitizePhoneNumber(targetPhoneNumber)
        const allTargets = [sanitizedTarget]

        setTargetPhoneNumbers(allTargets)

        socket.emit("meeting-id", {
          userPhoneNumber: sanitizePhoneNumber(phoneNumber),
          callinitiator: sanitizePhoneNumber(phoneNumber),
          meetingId,
          targetPhoneNumbers: allTargets,
          isVoiceCall,
          isOnCall: true,
        })
      }
    },
    [phoneNumber]
  )

  const sendMessage = useCallback(
    (message: string, targetPhones: string[], chatId: string) => {
      const socket = socketRef.current

      if (socket && isConnected && phoneNumber) {
        const sanitizedTargets = targetPhones.map(sanitizePhoneNumber)

        socket.emit("message", {
          senderPhoneNumber: sanitizePhoneNumber(phoneNumber),
          message,
          targetPhoneNumbers: sanitizedTargets,
          chatId,
        })

        setTimeout(() => {
          void queryClient.invalidateQueries({ queryKey: ["chats"] })
        }, 100)
      }
    },
    [isConnected, phoneNumber]
  )

  const sendMeetingIdToPython = useCallback(async (meetingId: string) => {
    try {
      await fetch("https://robust-hen-big.ngrok-free.app/meeting-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId }),
      })
    } catch {
      // ignore
    }
  }, [])

  const callUser = useCallback(
    async (type: "voice" | "video", targetPhoneNumber: string) => {
      if (!phoneNumber) return

      const meetingId = await createMeeting()

      setCall({
        type,
        meetingId,
        caller: phoneNumber,
        callee: targetPhoneNumber,
      })

      sendMeetingId(meetingId, targetPhoneNumber, type === "voice")

      if (type === "video") {
        navigate(`/video-call?meetingId=${meetingId}`)
        await sendMeetingIdToPython(meetingId)
      } else {
        navigate(`/voice-call?meetingId=${meetingId}`)
      }
    },
    [phoneNumber, navigate, sendMeetingId, sendMeetingIdToPython]
  )

  const sendMeetingAccepted = useCallback(() => {
    if (!socketRef.current || !call) return

    socketRef.current.emit("meeting-accepted", {
      userPhoneNumber: phoneNumber,
      meetingId: call.meetingId,
      isVoiceCall: call.type === "voice",
      isOnCall: true,
      callinitiator: call.caller,
      targetPhoneNumbers,
    })
  }, [call, phoneNumber, targetPhoneNumbers])

  const declineCall = useCallback(() => {
    const socket = socketRef.current

    if (socket && isConnected && call && phoneNumber) {
      const target = sanitizePhoneNumber(
        call.callee === phoneNumber ? call.caller : call.callee
      )

      socket.emit("meeting-id-decline", {
        userPhoneNumber: sanitizePhoneNumber(phoneNumber),
        meetingId: call.meetingId,
        isVoiceCall: call.type === "voice",
        isOnCall: false,
        callinitiator: call.caller,
        targetPhoneNumbers: [target],
      })
    }

    setCall(null)
  }, [call, isConnected, phoneNumber])

  useEffect(() => {
    if (!phoneNumber) return

    const socket = io(API_URL)
    socketRef.current = socket

    socket.on("connect", () => {
      socket.emit("socket-registration", {
        userPhoneNumber: sanitizePhoneNumber(phoneNumber),
      })

      setIsConnected(true)
    })

    socket.on("disconnect", () => setIsConnected(false))

    socket.on(
      "meeting-id-offer",
      (data: {
        isVoiceCall: boolean
        meetingId: string
        senderPhoneNumber: string
        targetPhoneNumbers: string[]
      }) => {
        const callType = data.isVoiceCall ? "voice" : "video"

        setCall({
          type: callType,
          meetingId: data.meetingId,
          caller: data.senderPhoneNumber,
          callee: phoneNumber,
        })

        setTargetPhoneNumbers(data.targetPhoneNumbers || [])

        navigate(`/incoming-call?callType=${callType}`)
      }
    )

    socket.on("call-declined", () => {
      setCall(null)
      navigate(-1)
    })

    socket.on("meeting-id-failed", (data: { message: string }) => {
      setCall(null)
      navigate(-1)
      if (data.message === "NO_USER_FOUND") {
        setTimeout(() => alert("Call failed: User not found"), 300)
      }
    })

    socket.on("user-disconnected-from-meeting", () => {
      setCall(null)
      navigate(-1)
    })

    socket.on("message", async (msg: { chatId?: string }) => {
      if (msg.chatId) {
        await queryClient.invalidateQueries({ queryKey: ["chats"] })
      }
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [phoneNumber, navigate])

  // Resolve the other party's display name for call screens
  const otherParty = call?.callee === phoneNumber ? call?.caller : call?.callee

  const contextValue = useMemo(
    () => ({
      phoneNumber,
      setPhoneNumber,
      callUser,
      isConnected,
      call,
      declineCall,
      sendMessage,
      setUser,
      user,
      chatsSearchQuery,
      setChatsSearchQuery,
      callSearchQuery,
      setCallSearchQuery,
      incomingCallUser: otherParty,
      callingUser: call?.caller,
      reset,
      sendMeetingAccepted,
    }),
    [
      phoneNumber,
      callUser,
      isConnected,
      call,
      declineCall,
      sendMessage,
      user,
      chatsSearchQuery,
      callSearchQuery,
      otherParty,
      reset,
      sendMeetingAccepted,
    ]
  )

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  )
}

export const AppProvider: FC<{ children: ReactNode }> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <AppProviderInner>{children}</AppProviderInner>
  </QueryClientProvider>
)
