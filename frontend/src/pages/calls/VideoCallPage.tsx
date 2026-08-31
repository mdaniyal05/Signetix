import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react"
import { useAppContext } from "../../context/AppContext"
import { videoSDKToken } from "../../api"
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
      }) => VideoMeetingInstance
    }
  }
}

interface VideoStream {
  track: MediaStreamTrack
}

interface VideoParticipant {
  id: string
  displayName: string
  webcamOn: boolean
  webcamStream: VideoStream | undefined
  micOn: boolean
  on: (event: string, cb: () => void) => void
}

interface VideoMeetingInstance {
  join: () => void
  leave: () => void
  toggleMic: () => void
  toggleWebcam: () => void
  on: (event: string, cb: (...args: unknown[]) => void) => void
  participants: Map<string, VideoParticipant>
  localParticipant: VideoParticipant | undefined
}

const ParticipantTile = ({
  participant,
  style,
}: {
  participant: VideoParticipant
  style?: React.CSSProperties
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!participant.webcamOn || !participant.webcamStream) return

    const stream = new MediaStream([participant.webcamStream.track])
    const videoEl = videoRef.current

    if (videoEl) {
      videoEl.srcObject = stream
      videoEl.play().catch(() => {})
    }

    return () => {
      if (videoEl) videoEl.srcObject = null
    }
  }, [participant.webcamOn, participant.webcamStream])

  const initial = (participant.displayName ?? "U").charAt(0).toUpperCase()

  return (
    <div className={styles.videoSingle} style={style}>
      {participant.webcamOn && participant.webcamStream ? (
        <video
          ref={videoRef}
          className={styles.videoSlot}
          autoPlay
          muted
          playsInline
        />
      ) : (
        <div className={styles.videoPlaceholder}>
          <div className={styles.videoPlaceholderAvatar}>{initial}</div>
          <span className={styles.videoName}>{participant.displayName}</span>
        </div>
      )}
    </div>
  )
}

const VideoCallPage = () => {
  const navigate = useNavigate()

  const [params] = useSearchParams()
  const meetingIdParam = params.get("meetingId")
  const { call, declineCall, incomingCallUser, callingUser } = useAppContext()

  const meetingRef = useRef<VideoMeetingInstance | null>(null)

  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [joined, setJoined] = useState(false)

  const [participants, setParticipants] = useState<VideoParticipant[]>([])
  const [localParticipant, setLocalParticipant] =
    useState<VideoParticipant | null>(null)

  const didTwoJoin = useRef(false)

  const displayName = incomingCallUser ?? callingUser ?? "Unknown Caller"

  const refreshParticipants = useCallback(() => {
    const m = meetingRef.current

    if (!m) return

    setParticipants(Array.from(m.participants.values()))
    setLocalParticipant(m.localParticipant ?? null)
  }, [])

  const hangUp = useCallback(async () => {
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
        webcamEnabled: true,
        token: videoSDKToken,
      })

      meetingRef.current = meeting

      meeting.on("meeting-joined", () => {
        setJoined(true)
        refreshParticipants()
      })

      meeting.on("participant-joined", () => refreshParticipants())
      meeting.on("participant-left", () => refreshParticipants())

      meeting.on("participant-joined", () => {
        if (!didTwoJoin.current) {
          didTwoJoin.current = (meeting.participants.size ?? 0) > 1
        }
      })

      meeting.on("meeting-left", () => hangUp())

      // Post meetingId to Python AI server
      fetch("https://robust-hen-big.ngrok-free.app/meeting-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId }),
      }).catch(() => {})

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingIdParam])

  const remotes = participants.filter((p) => p.id !== localParticipant?.id)
  const isRinging = joined && remotes.length === 0

  if (call === null) {
    navigate("/app/chats", { replace: true })
    return null
  }

  return (
    <div className={styles.videoPage}>
      {/* Video area */}
      {!joined || isRinging ? (
        <div className={styles.page} style={{ position: "absolute", inset: 0 }}>
          <div className={styles.voiceCenter}>
            <div className={styles.avatar}>
              {displayName.charAt(0).toUpperCase()}
            </div>
            <h2 className={styles.name}>{displayName}</h2>
            <p className={styles.subtitle}>
              {joined ? "Ringing…" : "Connecting…"}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Remote participant */}
          {remotes[0] && (
            <ParticipantTile
              participant={remotes[0]}
              style={{ position: "absolute", inset: 0 }}
            />
          )}

          {/* Local PiP */}
          {localParticipant && (
            <div className={styles.pip}>
              <ParticipantTile participant={localParticipant} />
            </div>
          )}
        </>
      )}

      {/* Controls overlay */}
      <div className={styles.controlsAbsolute}>
        <button
          className={`${styles.ctrlBtn} ${camOn ? styles.ctrlBtnActive : ""}`}
          title={camOn ? "Turn off camera" : "Turn on camera"}
          onClick={() => {
            meetingRef.current?.toggleWebcam()
            setCamOn((c) => !c)
          }}
        >
          {camOn ? <Video size={22} /> : <VideoOff size={22} />}
        </button>

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

export default VideoCallPage
