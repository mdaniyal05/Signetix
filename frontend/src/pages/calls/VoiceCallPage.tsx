/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Mic, MicOff, PhoneOff } from "lucide-react"
import { useAppContext } from "../../context/AppContext"
import { videoSDKToken } from "../../api"
import { formatTime } from "../../constants/Utils"
import styles from "./CallPage.module.css"

declare global {
  interface Window {
    VideoSDK: {
      initMeeting: (config: {
        meetingId: string
        name: string
        micEnabled: boolean
        webcamEnabled: boolean
        token: string
      }) => MeetingInstance
    }
  }
}

interface MeetingInstance {
  join: () => void
  leave: () => void
  toggleMic: () => void
  on: (event: string, cb: (...args: unknown[]) => void) => void
  participants: Map<string, unknown>
  localParticipant: { micOn: boolean } | undefined
}

const VoiceCallPage = () => {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const meetingIdParam = params.get("meetingId")
  const { call, declineCall, incomingCallUser, callingUser } = useAppContext()

  const meetingRef = useRef<MeetingInstance | null>(null)
  const [micOn, setMicOn] = useState(true)
  const [joined, setJoined] = useState(false)
  const [participantCount, setParticipantCount] = useState(1)
  const [seconds, setSeconds] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const displayName = incomingCallUser ?? callingUser ?? "Unknown Caller"
  const initial = displayName.charAt(0).toUpperCase()

  const startTimer = useCallback(() => {
    if (timerRef.current) return

    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
  }, [])

  const hangUp = useCallback(async () => {
    timerRef.current && clearInterval(timerRef.current)
    meetingRef.current?.leave()

    declineCall()

    try {
      await fetch("https://robust-hen-big.ngrok-free.app/meeting-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId: null }),
      })
    } catch {
      /* ignore */
    }
    navigate("/app/chats", { replace: true })
  }, [declineCall, navigate])

  useEffect(() => {
    const meetingId = meetingIdParam ?? call?.meetingId

    if (!meetingId) return

    const initMeeting = () => {
      const meeting = window.VideoSDK.initMeeting({
        meetingId,
        name: "Web User",
        micEnabled: true,
        webcamEnabled: false,
        token: videoSDKToken,
      })

      meetingRef.current = meeting

      meeting.on("meeting-joined", () => {
        setJoined(true)
        setParticipantCount((c) => {
          if (c > 1) startTimer()
          return c
        })
      })

      meeting.on("participant-joined", () => {
        setParticipantCount((c) => {
          const next = c + 1
          if (next >= 2) startTimer()
          return next
        })
      })

      meeting.on("participant-left", () => {
        setParticipantCount((c) => Math.max(1, c - 1))
      })

      meeting.on("meeting-left", () => {
        hangUp()
      })

      setTimeout(() => meeting.join(), 200)
    }

    if (window.VideoSDK) {
      initMeeting()
    } else {
      const script = document.createElement("script")

      script.src = "https://sdk.videosdk.live/js-sdk/0.0.92/videosdk.js"
      script.onload = initMeeting

      document.head.appendChild(script)
    }

    return () => {
      timerRef.current && clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingIdParam])

  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  const timerDisplay = `${formatTime(hours)}:${formatTime(mins)}:${formatTime(secs)}`

  const isRinging = joined && participantCount <= 1

  return (
    <div className={styles.page}>
      <div className={styles.voiceCenter}>
        <div className={styles.avatar}>{initial}</div>
        <h2 className={styles.name}>{displayName}</h2>
        {isRinging || !joined ? (
          <p className={styles.subtitle}>Connecting…</p>
        ) : (
          <p className={styles.timer}>{timerDisplay}</p>
        )}
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <button
          className={`${styles.ctrlBtn} ${micOn ? styles.ctrlBtnActive : ""}`}
          title={micOn ? "Mute" : "Unmute"}
          onClick={() => {
            meetingRef.current?.toggleMic()
            setMicOn((m) => !m)
          }}
        >
          {micOn ? <Mic size={22} /> : <MicOff size={22} />}
        </button>

        <button
          className={`${styles.ctrlBtn} ${styles.hangupBtn}`}
          title="Hang up"
          onClick={hangUp}
        >
          <PhoneOff size={22} />
        </button>
      </div>
    </div>
  )
}

export default VoiceCallPage
